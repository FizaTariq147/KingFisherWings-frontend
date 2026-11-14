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

/**
 * Client layout PDF for catalogue codes when backend pack is unavailable.
 * Never replaces POST /invoices|quotations/:id/pdf.
 *
 * Product priority (see REPORT_GENERATE_PRIORITY / FRESA_FIDELITY_STRATEGY.md):
 * 1. sample_browse — unbound + official CDN sample (HBL/HAWB)
 * 2. backend_pack — entity-bound pack via POST /reports/generate (caller / Generate panel)
 * 3. template_v2 — specialized React docs (no Fresa-identical claim)
 * 4. json_fallback — legacy JSON html2canvas (Dev/offline)
 *
 * Do not expand JSON shell aliases to invent unique Format-N designs.
 */
export type GenerateCatalogLayoutPdfOptions = {
  appendCustomerTerms?: boolean;
  logoUrl?: string;
  hblMode?: 'sample' | 'classic';
  /** Force template-v2 even when a JSON layout exists (pilot / QA). */
  preferTemplateV2?: boolean;
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
  // Phase-3 Jasper pilot — config-driven composition; sample retained as fallback only.
  if (isHblJasperPilotCode(code)) {
    try {
      const { blob } = await generateHblJasperPilotPdf(data, {
        appendCustomerTerms: options.appendCustomerTerms,
        showPlaceholders: !data.entityBound,
      });
      return { blob, preview: hblPreviewMeta(code) };
    } catch (pilotErr) {
      try {
        const { blob } = await generateHblSamplePdf(code, {
          appendCustomerTerms: options.appendCustomerTerms,
        });
        return { blob, preview: hblPreviewMeta(code) };
      } catch {
        throw pilotErr;
      }
    }
  }

  if (isHblFormatCode(code) && hasHblSamplePdf(code)) {
    const mode =
      options.hblMode ||
      (data.entityBound ? 'classic' : 'sample');

    if (mode === 'sample') {
      try {
        const { blob } = await generateHblSamplePdf(code, {
          appendCustomerTerms: options.appendCustomerTerms,
        });
        return { blob, preview: hblPreviewMeta(code) };
      } catch (sampleErr) {
        const v2 = await tryTemplateV2(code, data, options);
        if (v2) return v2;
        if (!data.entityBound) {
          const { blob } = await generateHblFamilyClassicPdf(code, data, {
            appendCustomerTerms: options.appendCustomerTerms,
          });
          return { blob, preview: hblPreviewMeta(code) };
        }
        throw sampleErr;
      }
    }

    const { blob } = await generateHblFamilyClassicPdf(code, data, {
      appendCustomerTerms: options.appendCustomerTerms,
    });
    return { blob, preview: hblPreviewMeta(code) };
  }

  // CDN samples are browse-only. Entity-bound must use live mapped data (v2 / JSON).
  if (isHawbFormatCode(code) && hasHawbSamplePdf(code) && !data.entityBound) {
    try {
      const { blob } = await generateHawbSamplePdf(code, {
        appendCustomerTerms: options.appendCustomerTerms,
      });
      return { blob, preview: hawbPreviewMeta(code) };
    } catch {
      const v2 = await tryTemplateV2(code, data, options);
      if (v2) return v2;
    }
  }

  // DO / WMS verified Fresa samples — browse-only (same entityBound gate).
  if (
    !data.entityBound &&
    hasDoOrWmsOfficialSamplePdf(code) &&
    (isDeliveryOrderFormatCode(code) || isWmsFormatCode(code))
  ) {
    try {
      const { blob, samplePdfUrl } = await generateCatalogOfficialSamplePdf(code, {
        appendCustomerTerms: options.appendCustomerTerms,
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
  // Official HAWB with hawbAwbShell JSON — skip early template-v2 so distinct shells render.
  const skipEarlyV2ForOfficialHawbJson =
    isOfficialHawbFormatCode(code) && Boolean(layoutEarly) && !options.preferTemplateV2;

  // Specialized family templates before generic JSON charge-table DNA.
  if (
    (options.preferTemplateV2 || supportsTemplateV2(code)) &&
    !skipEarlyV2ForOfficialHawbJson
  ) {
    const v2 = await tryTemplateV2(code, data, options);
    if (v2) return v2;
  }

  const layout = layoutEarly;
  if (!layout) {
    // Arrival extras etc. with enrichment but no JSON — last chance template-v2
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

  // Prefer template-v2 for families that must not look like generic invoices.
  // Official HAWB codes have structurally distinct hawbAwbShell JSON layouts
  // (draft / draft1 / draft2 / original1 / original2) — prefer those over color-only v2.
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
  if (isHblFormatCode(code) && hasHblSamplePdf(code)) return true;
  if (isHawbFormatCode(code) && hasHawbSamplePdf(code)) return true;
  if (supportsTemplateV2(code)) return true;
  return Boolean(resolveAnyFormatUiLayout(code));
}
