import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { isUuid } from '@/lib/isUuid';
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
      download_path: String(rec.download_path ?? rec.downloadPath ?? ''),
    },
    tenantId || String(rec.tenant_id ?? rec.tenantId ?? '') || undefined,
  );
}

function pickFileUrlFromRecord(raw: unknown, tenantId?: string): string | null {
  return candidatesFromRecord(raw, tenantId)[0] ?? null;
}

function pickDocumentId(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  for (const key of ['id', 'document_id', 'documentId'] as const) {
    const v = rec[key];
    if (typeof v === 'string' && isUuid(v)) return v;
  }
  return null;
}

async function fetchDocumentPdfById(
  jobId: string,
  documentId: string,
): Promise<Blob | null> {
  if (!isUuid(jobId) || !isUuid(documentId)) return null;
  try {
    const blob = await jobService.fetchJobDocumentBlob(jobId, documentId);
    return (await blobLooksLikePdf(blob)) ? blob : null;
  } catch {
    return null;
  }
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

/**
 * After BL draft / document generate — poll until GET …/documents/:id/download
 * returns PDF bytes (file_url / S3 often lag or expire).
 */
export async function waitForJobDocumentPdfBlob(
  jobId: string,
  opts?: {
    documentId?: string | null;
    /** Prefer docs whose type/name matches (e.g. hbl, bl-draft). */
    typeHint?: string | null;
    tenantId?: string;
    maxWaitMs?: number;
  },
): Promise<{ blob: Blob; documentId?: string; fileName?: string } | null> {
  const maxWaitMs = opts?.maxWaitMs ?? 24000;
  const deadline = Date.now() + maxWaitMs;
  const hint = (opts?.typeHint || '').toLowerCase();

  const tryDoc = async (raw: unknown) => {
    const id = pickDocumentId(raw);
    if (!id) return null;
    const blob = await fetchDocumentPdfById(jobId, id);
    if (!blob) return null;
    const rec = raw as Record<string, unknown>;
    const fileName = String(rec.file_name ?? rec.fileName ?? '').trim() || undefined;
    return { blob, documentId: id, fileName };
  };

  while (Date.now() < deadline) {
    if (opts?.documentId && isUuid(opts.documentId)) {
      const blob = await fetchDocumentPdfById(jobId, opts.documentId);
      if (blob) return { blob, documentId: opts.documentId };
    }

    try {
      const docs = await jobService.listDocuments(jobId);
      const parts = hint.split('|').filter(Boolean);
      const score = (raw: unknown) => {
        if (!parts.length) return 1;
        const rec = raw as Record<string, unknown>;
        const t = String(
          rec.document_type ?? rec.documentType ?? rec.file_name ?? rec.fileName ?? '',
        )
          .toLowerCase()
          .replace(/_/g, '-');
        return parts.reduce(
          (s, p) => s + (t.includes(p.replace(/_/g, '-')) ? 1 : 0),
          0,
        );
      };
      const ranked = [...docs].reverse().sort((a, b) => score(b) - score(a));
      for (const doc of ranked) {
        // When a type hint is set, skip unrelated docs until timeout forces broader try.
        if (parts.length && score(doc) === 0 && Date.now() < deadline - 8000) continue;
        const hit = await tryDoc(doc);
        if (hit) return hit;
        for (const url of candidatesFromRecord(doc, opts?.tenantId)) {
          const rawBlob = await fetchRawJobDocumentPdf(url, opts?.tenantId);
          if (rawBlob) {
            const id = pickDocumentId(doc) || undefined;
            const rec = doc as Record<string, unknown>;
            return {
              blob: rawBlob,
              documentId: id,
              fileName: String(rec.file_name ?? rec.fileName ?? '').trim() || undefined,
            };
          }
        }
      }
    } catch {
      /* retry */
    }
    await sleep(2000);
  }
  return null;
}

export type PrepareJobDocumentDisplayPdfOptions = {
  jobId: string;
  tenantId?: string;
  /** Job document UUID — preferred download via GET …/documents/:id/download. */
  documentId?: string | null;
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
 * Prefers document-id download stream, then file URLs / S3 candidates.
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

  // 1) Stable Bearer stream by document id (avoids expired R2 / bad /files paths).
  if (options.documentId && isUuid(options.documentId)) {
    const byId = await fetchDocumentPdfById(options.jobId, options.documentId);
    if (byId) {
      try {
        return await stampPdfInvoiceChrome(byId);
      } catch {
        return byId;
      }
    }
  }

  enqueue(options.fileUrl);
  for (const url of options.fallbackUrls || []) enqueue(url);

  if (options.documentId && isUuid(options.documentId)) {
    enqueue(`/jobs/${options.jobId}/documents/${options.documentId}/download`);
  }

  if (!queue.length && options.waitForUrl) {
    const waitedBlob = await waitForJobDocumentPdfBlob(options.jobId, {
      documentId: options.documentId,
      tenantId: options.tenantId,
    });
    if (waitedBlob?.blob) {
      try {
        return await stampPdfInvoiceChrome(waitedBlob.blob);
      } catch {
        return waitedBlob.blob;
      }
    }
    const waited = await waitForJobDocumentPdfUrl(options.jobId, options.tenantId);
    enqueue(waited);
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

  let raw: Blob | null = null;
  while (queue.length && !raw) {
    const next = queue.shift()!;
    tried.add(next);
    raw = await fetchRawJobDocumentPdf(next, options.tenantId);
  }

  // Last resort: poll document-id download even when URLs were present but invalid.
  if (!raw && options.waitForUrl) {
    const waitedBlob = await waitForJobDocumentPdfBlob(options.jobId, {
      documentId: options.documentId,
      tenantId: options.tenantId,
      maxWaitMs: 12000,
    });
    raw = waitedBlob?.blob ?? null;
  } else if (!raw && options.documentId && isUuid(options.documentId)) {
    raw = await fetchDocumentPdfById(options.jobId, options.documentId);
  }

  if (!raw) {
    throw new Error(
      queue.length === 0 && !options.documentId
        ? 'Document PDF is not available from the API yet. Generate the document, then try View PDF again.'
        : 'Could not load the document PDF from the server. The file may still be generating, the link may have expired, or the stored path is invalid — try Generate again, then View PDF.',
    );
  }

  try {
    return await stampPdfInvoiceChrome(raw);
  } catch {
    // Chrome stamp is best-effort — still return the API PDF bytes.
    return raw;
  }
}
