import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { isHblFormatCode, getHblFormatSpec } from '../constants/hblFormatCatalog';
import { resolveAnyFormatUiLayout } from '../data/resolveAnyFormatUiLayout';
import { generateHblFamilyClassicPdf } from '@/features/shared/bl-draft/generateHblFamilyClassicPdf';
import { generateHblSamplePdf, hasHblSamplePdf } from './generateHblSamplePdf';
import {
  generateInvoiceFormatLayoutPdf,
  type InvoiceFormatPdfData,
} from './generateInvoiceFormatLayoutPdf';

/**
 * Client layout PDF for any catalogue / registry code that has a permanent JSON layout.
 * Used for entity-bound live data (quotation / invoice / job / party) and as fallback
 * when POST /reports/generate is unavailable. Never replaces POST /invoices/:id/pdf
 * or /quotations/:id/pdf.
 *
 * HBL is special-cased (plan: sample-PDF + pack path):
 * - sample browse → official Fresa sample PDF + org stamp + BL T&C
 * - entity-bound → classic family print doc (not hblBlShell / JSON raster)
 */
export type GenerateCatalogLayoutPdfOptions = {
  /** Override T&C append for this call (validation / layout-only capture). */
  appendCustomerTerms?: boolean;
  /** Registered org / tenant logo URL. */
  logoUrl?: string;
  /**
   * Force HBL path: `sample` (official PDF) | `classic` (family live doc).
   * When omitted: entityBound → classic, else sample.
   */
  hblMode?: 'sample' | 'classic';
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
        // If sample CDN/proxy fails on entity browse, fall through to classic.
        if (!data.entityBound) {
          // Still try classic so Generate is not a hard failure.
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

  const layout = resolveAnyFormatUiLayout(code);
  if (!layout) return null;

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

  const blob = await generateInvoiceFormatLayoutPdf(preview, data, {
    appendCustomerTerms: options.appendCustomerTerms,
    logoUrl: options.logoUrl,
  });
  return { blob, preview };
}

export function hasCatalogLayoutPdf(code: string): boolean {
  if (isHblFormatCode(code) && hasHblSamplePdf(code)) return true;
  return Boolean(resolveAnyFormatUiLayout(code));
}
