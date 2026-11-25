import { hasHblSamplePdf } from './generateHblSamplePdf';
import { hasHawbSamplePdf } from './generateHawbSamplePdf';
import { hasDoOrWmsOfficialSamplePdf } from './generateCatalogOfficialSamplePdf';
import { allowsFresaSamplePdf, resolveReportPdfWorkflow } from './reportPdfWorkflow';

/**
 * Catalogue codes that have a distinct official Fresa sample PDF on CDN
 * (external layout comparison only — never opened in-app).
 */
export function hasOfficialSamplePdf(code: string): boolean {
  const c = code.trim();
  if (!c) return false;
  return hasHblSamplePdf(c) || hasHawbSamplePdf(c) || hasDoOrWmsOfficialSamplePdf(c);
}

/**
 * Prefer official Fresa sample for in-app PDF?
 * Always false — catalogue preview and generate use Freightnest native only.
 */
export function shouldPreferOfficialSamplePdf(opts: {
  code: string;
  format: string;
  entityBound?: boolean;
  /** browse = catalogue; generate = download (both resolve to Freightnest). */
  purpose?: 'browse' | 'generate';
}): boolean {
  const workflow = resolveReportPdfWorkflow({
    entityBound: opts.entityBound,
    purpose: opts.purpose ?? 'generate',
  });
  if (!allowsFresaSamplePdf(workflow)) return false;
  if (String(opts.format || '').toUpperCase() !== 'PDF') return false;
  return hasOfficialSamplePdf(opts.code);
}
