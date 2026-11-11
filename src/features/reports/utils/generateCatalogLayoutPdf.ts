import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { isHblFormatCode, getHblFormatSpec } from '../constants/hblFormatCatalog';
import { isHawbFormatCode, getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { resolveAnyFormatUiLayout } from '../data/resolveAnyFormatUiLayout';
import { generateHblFamilyClassicPdf } from '@/features/shared/bl-draft/generateHblFamilyClassicPdf';
import { generateHblSamplePdf, hasHblSamplePdf } from './generateHblSamplePdf';
import { generateHawbSamplePdf, hasHawbSamplePdf } from './generateHawbSamplePdf';
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
 * Order: official sample (HBL/HAWB) → template-v2 specialized React docs →
 * classic HBL family → legacy JSON html2canvas layouts.
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

  // Specialized family templates before generic JSON charge-table DNA.
  if (options.preferTemplateV2 || supportsTemplateV2(code)) {
    const v2 = await tryTemplateV2(code, data, options);
    if (v2) return v2;
  }

  const layout = resolveAnyFormatUiLayout(code);
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
  const enrichment = getReportEnrichment(code);
  const preferV2Family =
    enrichment &&
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
    logoUrl: options.logoUrl,
  });
  return { blob, preview };
}

export function hasCatalogLayoutPdf(code: string): boolean {
  if (isHblFormatCode(code) && hasHblSamplePdf(code)) return true;
  if (isHawbFormatCode(code) && hasHawbSamplePdf(code)) return true;
  if (supportsTemplateV2(code)) return true;
  return Boolean(resolveAnyFormatUiLayout(code));
}
