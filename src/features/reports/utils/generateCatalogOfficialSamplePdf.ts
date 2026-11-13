/**
 * Catalogue browse: stamp official Fresa sample PDFs for codes with verified CDN URLs.
 * Never use for entity-bound generate (live data must come from pack / template-v2).
 */
import { getDeliveryOrderFormatSpec } from '../constants/deliveryOrderFormatCatalog';
import { getWmsFormatSpec } from '../constants/wmsFormatCatalog';
import { getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { getHblFormatSpec } from '../constants/hblFormatCatalog';
import { getFresaOfficialSampleByCode } from '../data/fresaOfficialSampleCatalogue';
import { appendOfficialCustomerTermsPdf } from './appendOfficialCustomerTermsPdf';
import { fetchFresaSamplePdfBytes } from './fetchFresaSamplePdfBytes';
import {
  resolveReportOrgChrome,
  type ReportOrgChrome,
} from './resolveReportOrgChrome';
import { shouldAppendCustomerTermsPage } from './shouldAppendCustomerTermsPage';
import { resolveCustomerTermsKind } from './resolveCustomerTermsKind';
import { stampOrgChromeOnSamplePdf } from './stampOrgChromeOnSamplePdf';
import { hasDeliveryOrderSamplePdf } from '../constants/deliveryOrderFormatCatalog';
import { hasWmsSamplePdf } from '../constants/wmsFormatCatalog';

export type GenerateCatalogOfficialSamplePdfOptions = {
  skipOrgStamp?: boolean;
  chrome?: ReportOrgChrome;
  appendCustomerTerms?: boolean;
};

function resolveSampleMeta(code: string): {
  samplePdfUrl: string;
  formatLabel: string;
  sampleIsFallback: boolean;
} | null {
  const needle = code.trim();
  const official = getFresaOfficialSampleByCode(needle);
  if (official?.verificationStatus === 'url_verified' && official.samplePdfUrl) {
    return {
      samplePdfUrl: official.samplePdfUrl,
      formatLabel: official.fresaName,
      sampleIsFallback: false,
    };
  }

  const doSpec = getDeliveryOrderFormatSpec(needle);
  if (doSpec && hasDeliveryOrderSamplePdf(needle)) {
    return {
      samplePdfUrl: doSpec.samplePdfUrl,
      formatLabel: doSpec.name,
      sampleIsFallback: false,
    };
  }

  const wms = getWmsFormatSpec(needle);
  if (wms?.samplePdfUrl && hasWmsSamplePdf(needle)) {
    return {
      samplePdfUrl: wms.samplePdfUrl,
      formatLabel: wms.name,
      sampleIsFallback: Boolean(wms.sampleIsFallback),
    };
  }

  const hawb = getHawbFormatSpec(needle);
  if (hawb?.samplePdfUrl) {
    return {
      samplePdfUrl: hawb.samplePdfUrl,
      formatLabel: hawb.name,
      sampleIsFallback: Boolean(hawb.sampleIsFallback),
    };
  }

  const hbl = getHblFormatSpec(needle);
  if (hbl?.samplePdfUrl) {
    return {
      samplePdfUrl: hbl.samplePdfUrl,
      formatLabel: hbl.name,
      sampleIsFallback: false,
    };
  }

  return null;
}

export function hasCatalogOfficialSamplePdf(code: string): boolean {
  return Boolean(resolveSampleMeta(code)?.samplePdfUrl);
}

export function hasDoOrWmsOfficialSamplePdf(code: string): boolean {
  return hasDeliveryOrderSamplePdf(code) || hasWmsSamplePdf(code);
}

export async function generateCatalogOfficialSamplePdf(
  code: string,
  options: GenerateCatalogOfficialSamplePdfOptions = {},
): Promise<{ blob: Blob; samplePdfUrl: string }> {
  const meta = resolveSampleMeta(code);
  if (!meta?.samplePdfUrl) {
    throw new Error(`No official Fresa sample URL for ${code}.`);
  }

  const sampleBytes = await fetchFresaSamplePdfBytes(meta.samplePdfUrl);
  const chrome = options.chrome ?? (await resolveReportOrgChrome());

  let layoutBytes: Uint8Array = new Uint8Array(sampleBytes);
  if (!options.skipOrgStamp) {
    layoutBytes = await stampOrgChromeOnSamplePdf(sampleBytes, chrome, {
      formatLabel: meta.formatLabel || code,
      sampleIsFallback: meta.sampleIsFallback,
    });
  }

  let blob = new Blob([new Uint8Array(layoutBytes)], { type: 'application/pdf' });

  const appendTerms =
    typeof options.appendCustomerTerms === 'boolean'
      ? options.appendCustomerTerms
      : shouldAppendCustomerTermsPage(code);

  if (appendTerms) {
    const termsKind = resolveCustomerTermsKind(code);
    if (termsKind) {
      blob = await appendOfficialCustomerTermsPdf(blob, {
        kind: termsKind,
        formatCode: code,
      });
    }
  }

  return { blob, samplePdfUrl: meta.samplePdfUrl };
}
