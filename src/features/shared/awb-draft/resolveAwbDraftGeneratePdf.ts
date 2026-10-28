import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { fetchRawJobDocumentPdf } from '@/features/jobs/utils/fetchRawJobDocumentPdf';
import { waitForJobDocumentPdfBlob } from '@/features/jobs/utils/prepareJobDocumentDisplayPdf';
import { asRecord, pickString } from '@/features/portal-shared/normalize';
import { isUuid } from '@/lib/isUuid';

function pickDocumentId(raw: Record<string, unknown> | null): string | undefined {
  if (!raw) return undefined;
  for (const key of [
    'document_id',
    'documentId',
    'job_document_id',
    'jobDocumentId',
    'id',
  ]) {
    const v = pickString(raw[key]);
    if (v && isUuid(v)) return v;
  }
  return undefined;
}

/**
 * Prefer sync BE generate payload: document_id / download_path / file_url PDF.
 * Returns null when the response has no usable PDF (caller builds client catalog PDF).
 */
export async function resolveAwbDraftGeneratePdf(
  generateResult: unknown,
  opts: {
    jobId?: string;
    tenantId?: string;
    typeHint?: string;
  } = {},
): Promise<{ blob: Blob; fileName?: string; documentId?: string } | null> {
  if (generateResult instanceof Blob) {
    return (await blobLooksLikePdf(generateResult))
      ? { blob: generateResult }
      : null;
  }

  const root = asRecord(generateResult);
  const data = asRecord(root?.data) ?? root;
  const doc =
    asRecord(data?.document) ??
    asRecord(data?.job_document) ??
    asRecord(data?.jobDocument) ??
    data;
  if (!doc) return null;

  const documentId = pickDocumentId(doc) ?? pickDocumentId(data);
  const downloadPath = pickString(
    doc.download_path,
    doc.downloadPath,
    doc.file_url,
    doc.fileUrl,
    doc.download_url,
    doc.downloadUrl,
    data?.download_path,
    data?.downloadPath,
    data?.file_url,
    data?.fileUrl,
  );
  const fileName =
    pickString(doc.file_name, doc.fileName, data?.file_name, data?.fileName) ||
    undefined;

  const jobId = opts.jobId && isUuid(opts.jobId) ? opts.jobId : '';
  if (jobId && documentId) {
    const hit = await waitForJobDocumentPdfBlob(jobId, {
      documentId,
      typeHint: opts.typeHint ?? 'hawb|mawb|awb|air-waybill',
      tenantId: opts.tenantId,
      maxWaitMs: 10_000,
    });
    if (hit?.blob) {
      return {
        blob: hit.blob,
        fileName: hit.fileName || fileName,
        documentId: hit.documentId || documentId,
      };
    }
  }

  if (downloadPath) {
    const blob = await fetchRawJobDocumentPdf(downloadPath, opts.tenantId);
    if (blob) return { blob, fileName, documentId };
  }

  return null;
}
