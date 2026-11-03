import { generateBlDraftPdf } from '@/features/shared/bl-draft/generateBlDraftPdf';
import { loadBlDraftSource } from '@/features/shared/bl-draft/loadBlDraftSource';
import { generateCatalogLayoutPdf } from '@/features/reports/utils/generateCatalogLayoutPdf';
import { resolveCatalogContextPdfData } from '@/features/reports/utils/resolveCatalogContextPdfData';
import { allowClientLayoutGenerate } from '@/features/reports/utils/clientLayoutFallback';
import {
  generateAndDownloadReportPack,
  isReportPackReady,
} from '@/features/reports/utils/reportPackGenerate';
import { reportCatalogService } from '@/features/reports/services/reportCatalog.service';
import { suggestReportPackKey } from '@/features/reports/utils/suggestReportPackKey';
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
 * Prefer Fresa-parity backend pack for critical job documents.
 * Auto-bind suggested pack when BE has filled renderers. Classic BL / client only as fallback.
 */
export async function prepareJobDocumentCatalogPdf(opts: {
  jobId: string;
  documentKey: string;
  quotationId?: string | null;
  shipmentId?: string | null;
}): Promise<{
  blob: Blob;
  formatCode: string;
  source: 'report-pack' | 'classic-bl' | 'catalog-layout';
} | null> {
  const key = normalizeDocKey(opts.documentKey);
  if (!CATALOG_LAYOUT_JOB_DOCUMENT_KEYS.has(key)) return null;

  const formatCode = resolveJobDocumentFormatCode(opts.documentKey);
  const context = {
    job_id: opts.jobId,
    shipment_id: opts.shipmentId || undefined,
    quotation_id: opts.quotationId || undefined,
  };

  // 1) Fresa-parity pack (bind+activate if needed, then generate).
  try {
    let template = await reportCatalogService.getTemplate(formatCode);
    if (!isReportPackReady(template)) {
      const renderers = await reportCatalogService.listRenderers().catch(() => []);
      const packKey =
        suggestReportPackKey(formatCode, template.family, renderers) ||
        template.renderer_key ||
        '';
      if (packKey && !/^pending/i.test(packKey)) {
        try {
          template = await reportCatalogService.bindRenderer(formatCode, {
            renderer_key: packKey,
            activate: true,
          });
        } catch {
          /* try generate anyway if already mapped on BE */
        }
      }
    }
    const { blob } = await generateAndDownloadReportPack({
      code: formatCode,
      templateId: template.id,
      format: 'PDF',
      context,
    });
    if (blob?.size) {
      return { blob, formatCode, source: 'report-pack' };
    }
  } catch {
    /* pack unavailable — try classic / client fallback */
  }

  try {
    // 2) Classic BL draft (preserve until all HBL pack variants QA’d).
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

    // 3) Client JSON — explicit opt-in only (not Fresa look).
    if (
      !allowClientLayoutGenerate({
        packReady: false,
        templateActive: false,
      })
    ) {
      return null;
    }

    const data = await resolveCatalogContextPdfData(context);
    const generated = await generateCatalogLayoutPdf(formatCode, data);
    if (!generated?.blob) return null;

    return { blob: generated.blob, formatCode, source: 'catalog-layout' };
  } catch {
    return null;
  }
}
