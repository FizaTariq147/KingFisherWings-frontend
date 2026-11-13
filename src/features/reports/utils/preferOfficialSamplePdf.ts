import { hasHblSamplePdf } from './generateHblSamplePdf';
import { hasHawbSamplePdf } from './generateHawbSamplePdf';
import { hasDoOrWmsOfficialSamplePdf } from './generateCatalogOfficialSamplePdf';

/**
 * Catalogue codes that have a distinct official Fresa sample PDF.
 * Backend packs currently share shells, so catalogue Generate/preview must
 * prefer these samples or every format looks identical.
 */
export function hasOfficialSamplePdf(code: string): boolean {
  const c = code.trim();
  if (!c) return false;
  return hasHblSamplePdf(c) || hasHawbSamplePdf(c) || hasDoOrWmsOfficialSamplePdf(c);
}

/**
 * Prefer official sample over shared Puppeteer pack for catalogue PDF browse.
 * Never use CDN samples when a live entity is bound — samples must not replace
 * transaction data (Phase 6 QA: sample_replaces_live_data).
 */
export function shouldPreferOfficialSamplePdf(opts: {
  code: string;
  format: string;
  entityBound?: boolean;
}): boolean {
  if (opts.entityBound) return false;
  if (String(opts.format || '').toUpperCase() !== 'PDF') return false;
  return hasOfficialSamplePdf(opts.code);
}
