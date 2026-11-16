import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { isHblFormatCode, getHblFormatSpec } from '../constants/hblFormatCatalog';
import { isHawbFormatCode, getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { resolveAnyFormatUiLayout } from '../data/resolveAnyFormatUiLayout';
import { generateHblFamilyClassicPdf } from '@/features/shared/bl-draft/generateHblFamilyClassicPdf';
import {
  generateHblJasperPilotPdf,
  isHblJasperPilotCode,
} from '../templates/hbl/jasperPilot';
import { isOfficialHawbFormatCode } from './officialFormatGovernance';
import { generateHblSamplePdf, hasHblSamplePdf } from './generateHblSamplePdf';
import { generateHawbSamplePdf, hasHawbSamplePdf } from './generateHawbSamplePdf';
import {
  generateHawbOfficialPdf,
  isHawbOfficialNativeCode,
} from '../templates/hawb/official';
import {
  generateCatalogOfficialSamplePdf,
  hasDoOrWmsOfficialSamplePdf,
} from './generateCatalogOfficialSamplePdf';
import { isDeliveryOrderFormatCode } from '../constants/deliveryOrderFormatCatalog';
import { isWmsFormatCode } from '../constants/wmsFormatCatalog';
import {
  generateInvoiceFormatLayoutPdf,
  type InvoiceFormatPdfData,
} from './generateInvoiceFormatLayoutPdf';
import {
  renderTemplateV2Pdf,
  supportsTemplateV2,
} from '../engines/preview/renderTemplateV2Pdf';
import { getReportEnrichment } from '../registry';
import {
  allowsFresaSamplePdf,
  resolveReportPdfWorkflow,
  type ReportPdfWorkflow,
  REPORT_PDF_WORKFLOW,
} from './reportPdfWorkflow';
import {
  generateOfficialMeasuredPdf,
  isOfficialMeasuredNativeCode,
} from '../templates/official';

/**
 * Client layout PDF for catalogue codes when backend pack is unavailable.
 * Never replaces POST /invoices|quotations/:id/pdf.
 *
 * Phase 3 priority:
 * 1. reference_browse — unbound catalogue may show unmodified Fresa CDN samples (labelled)
 * 2. freightnest_generate — native / template-v2 / JSON only (never Fresa sample as final PDF)
 * 3. backend_pack — entity-bound pack via POST /reports/generate (caller / Generate panel)
 *
 * Preview/download must reuse the single Blob returned here.
 */
export type GenerateCatalogLayoutPdfOptions = {
  appendCustomerTerms?: boolean;
  logoUrl?: string;
  hblMode?: 'sample' | 'classic';
  preferTemplateV2?: boolean;
  preferHawbOfficial?: boolean;
  /**
   * Phase 3 workflow. Defaults from entityBound / purpose.
   * Generate panel must use freightnest_generate (or omit and pass entityBound / purpose:'generate').
   */
  workflow?: ReportPdfWorkflow;
  /** Alias for workflow resolution when workflow omitted. */
  purpose?: 'browse' | 'generate';
};

function hblPreviewMeta(code: string): InvoiceFormatPreview {
  const spec = getHblFormatSpec(code);
  return {
    code: spec?.code || code,
    formatNumber: spec?.sortOrder || 0,
    name: spec?.name || code,
    samplePdfUrl: spec?.samplePdfUrl || null,
    layoutKind: 'generic',
    paper: 'A4',
    appendCustomerTerms: true,
    rtl: false,
    sections: [],
  };
}

function hawbPreviewMeta(code: string): InvoiceFormatPreview {
  const spec = getHawbFormatSpec(code);
  return {
    code: spec?.code || code,
    formatNumber: spec?.sortOrder || 0,
    name: spec?.name || code,
    samplePdfUrl: spec?.samplePdfUrl || null,
    layoutKind: 'generic',
    paper: 'A4',
    appendCustomerTerms: true,
    rtl: false,
    sections: [],
  };
}

function enrichmentPreviewMeta(code: string): InvoiceFormatPreview {
  const enrichment = getReportEnrichment(code);
  return {
    code,
    formatNumber: 0,
    name: enrichment?.templateType || code,
    samplePdfUrl: enrichment?.reference?.samplePdfUrl || null,
    layoutKind: 'generic',
    paper: enrichment?.page.size || 'A4',
    orientation: enrichment?.page.orientation,
    appendCustomerTerms: false,
    rtl: false,
    sections: [],
  };
}

async function tryTemplateV2(
  code: string,
  data: InvoiceFormatPdfData,
  options: GenerateCatalogLayoutPdfOptions,
): Promise<{ blob: Blob; preview: InvoiceFormatPreview } | null> {
  if (!supportsTemplateV2(code)) return null;
  try {
    const blob = await renderTemplateV2Pdf(code, data, {
      logoUrl: options.logoUrl,
      formatName: getReportEnrichment(code)?.templateType,
    });
    if (!blob) return null;
    return { blob, preview: enrichmentPreviewMeta(code) };
  } catch {
    return null;
  }
}

export async function generateCatalogLayoutPdf(
  code: string,
  data: InvoiceFormatPdfData = {},
  options: GenerateCatalogLayoutPdfOptions = {},
): Promise<{ blob: Blob; preview: InvoiceFormatPreview } | null> {
  const workflow =
    options.workflow ??
    resolveReportPdfWorkflow({
      entityBound: data.entityBound,
      purpose: options.purpose,
    });
  const allowSample = allowsFresaSamplePdf(workflow);

  // Measured native faces. Browse may still open the unmodified Fresa sample.
  if (!allowSample && isOfficialMeasuredNativeCode(code) && !isHblJasperPilotCode(code)) {
    const { blob } = await generateOfficialMeasuredPdf(code, {
      companyName: data.companyName,
      companyAddress: data.companyAddress,
      companyPhone: data.companyPhone,
      companyEmail: data.companyEmail,
      logoUrl: options.logoUrl || data.logoUrl,
      entityBound: data.entityBound,
      shipperLines: data.shipperLines,
      consigneeLines: data.consigneeLines,
      notifyLines: data.notifyLines,
      jobNumber: data.jobNumber,
      referenceNo: data.referenceNo,
      invoiceNumber: data.invoiceNumber,
    });
    return { blob, preview: enrichmentPreviewMeta(code) };
  }

  // HBL Jasper pilot — Freightnest native only (no Fresa sample fallback on generate).
  if (isHblJasperPilotCode(code)) {
    try {
      const { blob } = await generateHblJasperPilotPdf(data, {
        appendCustomerTerms: options.appendCustomerTerms,
        showPlaceholders: !data.entityBound,
      });
      return { blob, preview: hblPreviewMeta(code) };
    } catch (pilotErr) {
      if (allowSample) {
        try {
          const { blob } = await generateHblSamplePdf(code, {
            appendCustomerTerms: options.appendCustomerTerms,
            skipOrgStamp: true,
          });
          return { blob, preview: hblPreviewMeta(code) };
        } catch {
          /* fall through */
        }
      }
      const classic = await generateHblFamilyClassicPdf(code, data, {
        appendCustomerTerms: options.appendCustomerTerms,
      }).catch(() => null);
      if (classic) return { blob: classic.blob, preview: hblPreviewMeta(code) };
      throw pilotErr;
    }
  }

  if (isHblFormatCode(code)) {
    // Phase 3: sample mode only for reference_browse. Generate always classic/v2.
    const wantSample =
      allowSample &&
      (options.hblMode === 'sample' || (!options.hblMode && !data.entityBound));

    if (wantSample && hasHblSamplePdf(code)) {
      try {
        const { blob } = await generateHblSamplePdf(code, {
          appendCustomerTerms: options.appendCustomerTerms,
          skipOrgStamp: true,
        });
        return { blob, preview: hblPreviewMeta(code) };
      } catch {
        const v2 = await tryTemplateV2(code, data, options);
        if (v2) return v2;
        const { blob } = await generateHblFamilyClassicPdf(code, data, {
          appendCustomerTerms: options.appendCustomerTerms,
        });
        return { blob, preview: hblPreviewMeta(code) };
      }
    }

    const v2 = await tryTemplateV2(code, data, options);
    if (v2) return v2;
    const { blob } = await generateHblFamilyClassicPdf(code, data, {
      appendCustomerTerms: options.appendCustomerTerms,
    });
    return { blob, preview: hblPreviewMeta(code) };
  }

  // Official HAWB native layouts — Freightnest generate (entity-bound or preferHawbOfficial).
  if (
    isHawbOfficialNativeCode(code) &&
    (data.entityBound ||
      options.preferHawbOfficial ||
      workflow === REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE) &&
    !options.preferTemplateV2
  ) {
    try {
      const { blob } = await generateHawbOfficialPdf(code, data, {
        appendCustomerTerms: options.appendCustomerTerms,
        showPlaceholders: !data.entityBound,
      });
      return { blob, preview: hawbPreviewMeta(code) };
    } catch {
      // Fall through.
    }
  }

  // HAWB Fresa CDN sample — reference browse only (unmodified artwork).
  if (allowSample && isHawbFormatCode(code) && hasHawbSamplePdf(code) && !data.entityBound) {
    try {
      const { blob } = await generateHawbSamplePdf(code, {
        appendCustomerTerms: options.appendCustomerTerms,
        skipOrgStamp: true,
      });
      return { blob, preview: hawbPreviewMeta(code) };
    } catch {
      if (isHawbOfficialNativeCode(code)) {
        try {
          const { blob } = await generateHawbOfficialPdf(code, data, {
            appendCustomerTerms: options.appendCustomerTerms,
            showPlaceholders: true,
          });
          return { blob, preview: hawbPreviewMeta(code) };
        } catch {
          /* continue */
        }
      }
      const v2 = await tryTemplateV2(code, data, options);
      if (v2) return v2;
    }
  }

  // DO / WMS official samples — reference browse only.
  if (
    allowSample &&
    !data.entityBound &&
    hasDoOrWmsOfficialSamplePdf(code) &&
    (isDeliveryOrderFormatCode(code) || isWmsFormatCode(code))
  ) {
    try {
      const { blob, samplePdfUrl } = await generateCatalogOfficialSamplePdf(code, {
        appendCustomerTerms: options.appendCustomerTerms,
        skipOrgStamp: true,
      });
      return {
        blob,
        preview: {
          ...enrichmentPreviewMeta(code),
          samplePdfUrl,
          layoutKind: 'generic',
        },
      };
    } catch {
      // Fall through to template-v2 / JSON.
    }
  }

  const layoutEarly = resolveAnyFormatUiLayout(code);
  const skipEarlyV2ForOfficialHawbJson =
    isOfficialHawbFormatCode(code) && Boolean(layoutEarly) && !options.preferTemplateV2;

  if (
    (options.preferTemplateV2 || supportsTemplateV2(code)) &&
    !skipEarlyV2ForOfficialHawbJson
  ) {
    const v2 = await tryTemplateV2(code, data, options);
    if (v2) return v2;
  }

  const layout = layoutEarly;
  if (!layout) {
    return tryTemplateV2(code, data, options);
  }

  const preview: InvoiceFormatPreview = {
    code: layout.code,
    formatNumber: layout.formatNumber || 0,
    name: layout.name || layout.code,
    samplePdfUrl: null,
    layoutKind: 'generic',
    paper: layout.paper,
    orientation: layout.orientation,
    appendCustomerTerms: layout.appendCustomerTerms,
    rtl: layout.rtl,
    sections: [],
  };

  const enrichment = getReportEnrichment(code);
  const hawbUsesDistinctJsonShell =
    enrichment?.templateFamily === 'hawb' &&
    isOfficialHawbFormatCode(code) &&
    Boolean(layout);
  const preferV2Family =
    enrichment &&
    !hawbUsesDistinctJsonShell &&
    (enrichment.templateFamily === 'arrival_notice' ||
      enrichment.templateFamily === 'delivery_order' ||
      enrichment.templateFamily === 'cargo_manifest' ||
      enrichment.templateFamily === 'ops_list' ||
      enrichment.templateFamily === 'ledger' ||
      enrichment.templateFamily === 'voucher' ||
      enrichment.templateFamily === 'financial_statement' ||
      enrichment.templateFamily === 'hawb' ||
      enrichment.templateFamily === 'hbl');

  if (preferV2Family) {
    const v2 = await tryTemplateV2(code, data, options);
    if (v2) return v2;
  }

  const blob = await generateInvoiceFormatLayoutPdf(preview, data, {
    appendCustomerTerms: options.appendCustomerTerms,
    logoUrl: options.logoUrl || data.logoUrl,
  });
  return { blob, preview };
}

export function hasCatalogLayoutPdf(code: string): boolean {
  if (isOfficialMeasuredNativeCode(code)) return true;
  if (isHblFormatCode(code) && hasHblSamplePdf(code)) return true;
  if (isHawbFormatCode(code) && hasHawbSamplePdf(code)) return true;
  if (isHawbOfficialNativeCode(code)) return true;
  if (supportsTemplateV2(code)) return true;
  return Boolean(resolveAnyFormatUiLayout(code));
}

/** True when Freightnest can generate without a Fresa sample PDF. */
export function hasFreightnestGeneratePath(code: string): boolean {
  if (isHblJasperPilotCode(code)) return true;
  if (isHawbOfficialNativeCode(code)) return true;
  if (isOfficialMeasuredNativeCode(code)) return true;
  if (supportsTemplateV2(code)) return true;
  if (resolveAnyFormatUiLayout(code)) return true;
  if (isHblFormatCode(code)) return true; // classic family
  return false;
}
