import { jobService } from '../services/job.service';
import { fetchRawJobDocumentPdf } from './fetchRawJobDocumentPdf';
import { stampPdfInvoiceChrome } from './stampPdfInvoiceChrome';
import { resolveJobDocumentFileUrlCandidates } from './resolveJobDocumentFileUrl';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function candidatesFromRecord(raw: unknown, tenantId?: string): string[] {
  if (!raw || typeof raw !== 'object') return [];
  const rec = raw as Record<string, unknown>;
  return resolveJobDocumentFileUrlCandidates(
    {
      file_url: String(rec.file_url ?? rec.fileUrl ?? ''),
      s3_key: String(rec.s3_key ?? rec.s3Key ?? ''),
      file_name: String(rec.file_name ?? rec.fileName ?? ''),
      download_url: String(rec.download_url ?? rec.downloadUrl ?? ''),
    },
    tenantId || String(rec.tenant_id ?? rec.tenantId ?? '') || undefined,
  );
}

function pickFileUrlFromRecord(raw: unknown, tenantId?: string): string | null {
  return candidatesFromRecord(raw, tenantId)[0] ?? null;
}

/** Poll job documents list until a PDF URL appears (after async generation). */
export async function waitForJobDocumentPdfUrl(
  jobId: string,
  tenantId?: string,
  maxWaitMs = 24000,
): Promise<string | null> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const docs = await jobService.listDocuments(jobId);
    for (let i = docs.length - 1; i >= 0; i -= 1) {
      const url = pickFileUrlFromRecord(docs[i], tenantId);
      if (url) return url;
    }
    await sleep(2000);
  }
  return null;
}

export type PrepareJobDocumentDisplayPdfOptions = {
  jobId: string;
  tenantId?: string;
  /** Stored file URL when already known. */
  fileUrl?: string | null;
  /**
   * Extra candidates (e.g. R2 `file_url` after `/files` from `s3_key`) tried in order
   * when the primary `fileUrl` fails to yield a PDF.
   */
  fallbackUrls?: string[] | null;
  /** Wait for API PDF after generate when URL is missing. */
  waitForUrl?: boolean;
};

/**
 * API PDF body unchanged; invoice header + footer chrome applied only.
 * Tries primary URL then any fallbacks (presigned R2, alternate fields).
 */
export async function prepareJobDocumentDisplayPdf(
  options: PrepareJobDocumentDisplayPdfOptions,
): Promise<Blob> {
  const tried = new Set<string>();
  const queue: string[] = [];

  const enqueue = (value?: string | null) => {
    const url = value?.trim();
    if (!url || tried.has(url) || queue.includes(url)) return;
    queue.push(url);
  };

  enqueue(options.fileUrl);
  for (const url of options.fallbackUrls || []) enqueue(url);

  if (!queue.length && options.waitForUrl) {
    const waited = await waitForJobDocumentPdfUrl(options.jobId, options.tenantId);
    enqueue(waited);
    // Refresh list once for alternate candidates (s3_key + file_url).
    try {
      const docs = await jobService.listDocuments(options.jobId);
      for (let i = docs.length - 1; i >= 0; i -= 1) {
        for (const url of candidatesFromRecord(docs[i], options.tenantId)) {
          enqueue(url);
        }
      }
    } catch {
      /* best-effort */
    }
  }

  if (!queue.length) {
    throw new Error(
      'Document PDF is not available from the API yet. Generate the document, then try View PDF again.',
    );
  }

  let raw: Blob | null = null;
  while (queue.length && !raw) {
    const next = queue.shift()!;
    tried.add(next);
    raw = await fetchRawJobDocumentPdf(next, options.tenantId);
  }

  if (!raw) {
    throw new Error(
      'Could not load the document PDF from the server. The file may still be generating, the link may have expired, or the stored path is invalid — try Generate again, then View PDF.',
    );
  }

  try {
    return await stampPdfInvoiceChrome(raw);
  } catch {
    // Chrome stamp is best-effort — still return the API PDF bytes.
    return raw;
  }
}
