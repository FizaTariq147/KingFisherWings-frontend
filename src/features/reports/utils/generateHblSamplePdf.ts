import { getHblFormatSpec } from '../constants/hblFormatCatalog';
import { HBL_OFFICIAL_CATALOG } from '../constants/hblOfficialCatalog.generated.ts';
import { appendOfficialCustomerTermsPdf } from './appendOfficialCustomerTermsPdf';
import { fetchFresaSamplePdfBytes } from './fetchFresaSamplePdfBytes';
import {
  resolveReportOrgChrome,
  type ReportOrgChrome,
} from './resolveReportOrgChrome';
import { shouldAppendCustomerTermsPage } from './shouldAppendCustomerTermsPage';
import { stampOrgChromeOnSamplePdf } from './stampOrgChromeOnSamplePdf';

const HKG_FALLBACK_URL =
  HBL_OFFICIAL_CATALOG.find((r) => r.code === 'FG_HBL_HKG')?.samplePdfUrl ||
  'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/fg_hbl_hkg_rpm_ref_245.pdf';

export type GenerateHblSamplePdfOptions = {
  /** Skip org chrome stamp (raw Fresa sample + optional T&C). */
  skipOrgStamp?: boolean;
  chrome?: ReportOrgChrome;
  appendCustomerTerms?: boolean;
};

function resolveSampleUrl(code: string): string {
  const spec = getHblFormatSpec(code);
  const url = (spec?.samplePdfUrl || '').trim();
  if (url) return url;
  return HKG_FALLBACK_URL;
}

/**
 * Catalogue browse / sample Generate for HBL:
 * official Fresa sample PDF + org stamp + BL Terms append.
 */
export async function generateHblSamplePdf(
  code: string,
  options: GenerateHblSamplePdfOptions = {},
): Promise<{ blob: Blob; samplePdfUrl: string; usedFallbackSample: boolean }> {
  const needle = code.trim().toUpperCase();
  const samplePdfUrl = resolveSampleUrl(needle);
  const usedFallbackSample = !(getHblFormatSpec(needle)?.samplePdfUrl || '').trim();
  const spec = getHblFormatSpec(needle);

  const sampleBytes = await fetchFresaSamplePdfBytes(samplePdfUrl);
  const chrome = options.chrome ?? (await resolveReportOrgChrome());

  let layoutBytes: Uint8Array = new Uint8Array(sampleBytes);
  if (!options.skipOrgStamp) {
    layoutBytes = await stampOrgChromeOnSamplePdf(sampleBytes, chrome, {
      formatLabel: spec?.name || needle,
      sampleIsFallback: usedFallbackSample,
    });
  }

  let blob = new Blob([new Uint8Array(layoutBytes)], { type: 'application/pdf' });

  const appendTerms =
    typeof options.appendCustomerTerms === 'boolean'
      ? options.appendCustomerTerms
      : shouldAppendCustomerTermsPage(needle);

  if (appendTerms) {
    blob = await appendOfficialCustomerTermsPdf(blob, {
      kind: 'bl',
      formatCode: needle,
    });
  }

  return { blob, samplePdfUrl, usedFallbackSample };
}

export function hasHblSamplePdf(code: string): boolean {
  return Boolean(getHblFormatSpec(code));
}
