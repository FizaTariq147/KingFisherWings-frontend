import { generateBlDraftPdf } from '@/features/shared/bl-draft/generateBlDraftPdf';
import { loadBlDraftSource } from '@/features/shared/bl-draft/loadBlDraftSource';
import { appendOfficialCustomerTermsPdf } from '@/features/reports/utils/appendOfficialCustomerTermsPdf';
import { generateCatalogLayoutPdf } from '@/features/reports/utils/generateCatalogLayoutPdf';
import { resolveCatalogContextPdfData } from '@/features/reports/utils/resolveCatalogContextPdfData';
import { resolveCustomerTermsBranding } from '@/features/reports/utils/resolveCustomerTermsBranding';
import { shouldAppendCustomerTermsPage } from '@/features/reports/utils/shouldAppendCustomerTermsPage';
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

async function maybeAppendTerms(formatCode: string, blob: Blob): Promise<Blob> {
  if (!shouldAppendCustomerTermsPage(formatCode)) return blob;
  try {
    const branding = await resolveCustomerTermsBranding();
    return appendOfficialCustomerTermsPdf(blob, branding);
  } catch {
    return appendOfficialCustomerTermsPdf(blob);
  }
}

/**
 * Prefer catalog / classic Fresa layout PDF for critical job documents.
 * Returns null when the key is out of scope or generation fails (caller falls
 * back to backend bytes + chrome stamp).
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
      let { blob } = await generateBlDraftPdf({
        jobId: opts.jobId,
        shipmentId: opts.shipmentId || undefined,
        quotationId: opts.quotationId || undefined,
        preview,
      });
      blob = await maybeAppendTerms(formatCode, blob);
      return { blob, formatCode, source: 'classic-bl' };
    }

    const data = await resolveCatalogContextPdfData({
      job_id: opts.jobId,
      shipment_id: opts.shipmentId || undefined,
      quotation_id: opts.quotationId || undefined,
    });
    const generated = await generateCatalogLayoutPdf(formatCode, data);
    if (!generated?.blob) return null;

    const blob = await maybeAppendTerms(formatCode, generated.blob);
    return { blob, formatCode, source: 'catalog-layout' };
  } catch {
    return null;
  }
}
