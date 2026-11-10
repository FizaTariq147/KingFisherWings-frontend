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

/**
 * Client layout PDF for catalogue codes when backend pack is unavailable.
 * Never replaces POST /invoices|quotations/:id/pdf.
 *
 * HBL / HAWB browse → official Fresa sample PDF (not shared React shells).
 * HBL entity-bound fallback → classic family print doc.
 */
export type GenerateCatalogLayoutPdfOptions = {
  appendCustomerTerms?: boolean;
  logoUrl?: string;
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

  if (isHawbFormatCode(code) && hasHawbSamplePdf(code) && !data.entityBound) {
    try {
      const { blob } = await generateHawbSamplePdf(code, {
        appendCustomerTerms: options.appendCustomerTerms,
      });
      return { blob, preview: hawbPreviewMeta(code) };
    } catch {
      /* fall through to JSON shell if sample CDN/proxy fails */
    }
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
  if (isHawbFormatCode(code) && hasHawbSamplePdf(code)) return true;
  return Boolean(resolveAnyFormatUiLayout(code));
}
