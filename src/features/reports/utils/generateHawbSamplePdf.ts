import { getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { appendOfficialCustomerTermsPdf } from './appendOfficialCustomerTermsPdf';
import { fetchFresaSamplePdfBytes } from './fetchFresaSamplePdfBytes';
import {
  resolveReportOrgChrome,
  type ReportOrgChrome,
} from './resolveReportOrgChrome';
import { shouldAppendCustomerTermsPage } from './shouldAppendCustomerTermsPage';
import { stampOrgChromeOnSamplePdf } from './stampOrgChromeOnSamplePdf';

export type GenerateHawbSamplePdfOptions = {
  skipOrgStamp?: boolean;
  chrome?: ReportOrgChrome;
  appendCustomerTerms?: boolean;
};

/**
 * Catalogue browse for HAWB: official Fresa sample PDF + org stamp + Airway T&C.
 */
export async function generateHawbSamplePdf(
  code: string,
  options: GenerateHawbSamplePdfOptions = {},
): Promise<{ blob: Blob; samplePdfUrl: string }> {
  const spec = getHawbFormatSpec(code);
  const samplePdfUrl = (spec?.samplePdfUrl || '').trim();
  if (!samplePdfUrl) {
    throw new Error(`No official Fresa HAWB sample URL for ${code}.`);
  }

  const sampleBytes = await fetchFresaSamplePdfBytes(samplePdfUrl);
  const chrome = options.chrome ?? (await resolveReportOrgChrome());

  let layoutBytes: Uint8Array = new Uint8Array(sampleBytes);
  if (!options.skipOrgStamp) {
    layoutBytes = await stampOrgChromeOnSamplePdf(sampleBytes, chrome, {
      formatLabel: spec?.name || code,
      sampleIsFallback: Boolean(spec?.sampleIsFallback),
    });
  }

  let blob = new Blob([new Uint8Array(layoutBytes)], { type: 'application/pdf' });

  const appendTerms =
    typeof options.appendCustomerTerms === 'boolean'
      ? options.appendCustomerTerms
      : shouldAppendCustomerTermsPage(code);

  if (appendTerms) {
    blob = await appendOfficialCustomerTermsPdf(blob, {
      kind: 'airway',
      formatCode: code,
    });
  }

  return { blob, samplePdfUrl };
}

export function hasHawbSamplePdf(code: string): boolean {
  return Boolean(getHawbFormatSpec(code)?.samplePdfUrl);
}
