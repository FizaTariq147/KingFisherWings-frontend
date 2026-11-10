import { hasHblSamplePdf } from './generateHblSamplePdf';
import { hasHawbSamplePdf } from './generateHawbSamplePdf';

/**
 * Catalogue codes that have a distinct official Fresa sample PDF.
 * Backend packs (sea.hbl_* / air.hawb_*) currently share one shell, so
 * catalogue Generate/preview must prefer these samples or every format looks identical.
 */
export function hasOfficialSamplePdf(code: string): boolean {
  const c = code.trim();
  if (!c) return false;
  return hasHblSamplePdf(c) || hasHawbSamplePdf(c);
}

/**
 * Prefer official sample over shared Puppeteer pack for catalogue PDF.
 * Live entity print can still use packs when no sample exists.
 */
export function shouldPreferOfficialSamplePdf(opts: {
  code: string;
  format: string;
}): boolean {
  if (String(opts.format || '').toUpperCase() !== 'PDF') return false;
  return hasOfficialSamplePdf(opts.code);
}
