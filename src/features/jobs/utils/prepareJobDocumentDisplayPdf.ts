import { jobService } from '../services/job.service';
import { fetchRawJobDocumentPdf } from './fetchRawJobDocumentPdf';
import { stampPdfInvoiceChrome } from './stampPdfInvoiceChrome';
import { resolveJobDocumentFileUrl } from './resolveJobDocumentFileUrl';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function pickFileUrlFromRecord(raw: unknown, tenantId?: string): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const resolved = resolveJobDocumentFileUrl(
    {
      file_url: String(rec.file_url ?? rec.fileUrl ?? ''),
      s3_key: String(rec.s3_key ?? rec.s3Key ?? ''),
    },
    tenantId,
  );
  return resolved || null;
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
  /** Wait for API PDF after generate when URL is missing. */
  waitForUrl?: boolean;
};

/**
 * API PDF body unchanged; invoice header + footer chrome applied only.
 */
export async function prepareJobDocumentDisplayPdf(
  options: PrepareJobDocumentDisplayPdfOptions,
): Promise<Blob> {
  let fileUrl = options.fileUrl?.trim() || null;
  if (!fileUrl && options.waitForUrl) {
    fileUrl = await waitForJobDocumentPdfUrl(options.jobId, options.tenantId);
  }
  if (!fileUrl) {
    throw new Error(
      'Document PDF is not available from the API yet. Generate the document, then try View PDF again.',
    );
  }

  const raw = await fetchRawJobDocumentPdf(fileUrl, options.tenantId);
  if (!raw) {
    throw new Error('Could not load the document PDF from the server.');
  }

  return stampPdfInvoiceChrome(raw);
}
