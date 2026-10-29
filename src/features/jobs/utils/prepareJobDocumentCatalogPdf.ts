import { generateBlDraftPdf } from '@/features/shared/bl-draft/generateBlDraftPdf';
import { loadBlDraftSource } from '@/features/shared/bl-draft/loadBlDraftSource';
import { generateCatalogLayoutPdf } from '@/features/reports/utils/generateCatalogLayoutPdf';
import { resolveCatalogContextPdfData } from '@/features/reports/utils/resolveCatalogContextPdfData';
import {
  CLASSIC_BL_DRAFT_DOCUMENT_KEYS,
  CATALOG_LAYOUT_JOB_DOCUMENT_KEYS,
  resolveJobDocumentFormatCode,
} from './resolveJobDocumentFormatCode';

function normalizeDocKey(documentKey: string): string {
  return String(documentKey || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');
}

/**
 * Prefer catalog / classic Fresa layout PDF for critical job documents.
 * Returns null when the key is out of scope or generation fails (caller falls
 * back to backend bytes + chrome stamp).
 *
 * T&C pages are appended inside `generateBlDraftPdf` / `generateCatalogLayoutPdf`
 * (BL → BL Terms; HAWB/MAWB → Airway Terms) — do not append again here.
 */
export async function prepareJobDocumentCatalogPdf(opts: {
  jobId: string;
  documentKey: string;
  quotationId?: string | null;
  shipmentId?: string | null;
}): Promise<{ blob: Blob; formatCode: string; source: 'classic-bl' | 'catalog-layout' } | null> {
  const key = normalizeDocKey(opts.documentKey);
  if (!CATALOG_LAYOUT_JOB_DOCUMENT_KEYS.has(key)) return null;

  const formatCode = resolveJobDocumentFormatCode(opts.documentKey);

  try {
    if (CLASSIC_BL_DRAFT_DOCUMENT_KEYS.has(key) || formatCode === 'FG_HBL_HKG') {
      const { preview } = await loadBlDraftSource({
        jobId: opts.jobId,
        shipmentId: opts.shipmentId || undefined,
        quotationId: opts.quotationId || undefined,
      });
      const { blob } = await generateBlDraftPdf({
        jobId: opts.jobId,
        shipmentId: opts.shipmentId || undefined,
        quotationId: opts.quotationId || undefined,
        preview,
      });
      return { blob, formatCode, source: 'classic-bl' };
    }

    const data = await resolveCatalogContextPdfData({
      job_id: opts.jobId,
      shipment_id: opts.shipmentId || undefined,
      quotation_id: opts.quotationId || undefined,
    });
    const generated = await generateCatalogLayoutPdf(formatCode, data);
    if (!generated?.blob) return null;

    return { blob: generated.blob, formatCode, source: 'catalog-layout' };
  } catch {
    return null;
  }
}
