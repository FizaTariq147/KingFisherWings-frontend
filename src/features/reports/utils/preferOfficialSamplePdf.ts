import { hasHblSamplePdf } from './generateHblSamplePdf';
import { hasHawbSamplePdf } from './generateHawbSamplePdf';
import { hasDoOrWmsOfficialSamplePdf } from './generateCatalogOfficialSamplePdf';
import { allowsFresaSamplePdf, resolveReportPdfWorkflow } from './reportPdfWorkflow';

/**
 * Catalogue codes that have a distinct official Fresa sample PDF (reference browse).
 */
export function hasOfficialSamplePdf(code: string): boolean {
  const c = code.trim();
  if (!c) return false;
  return hasHblSamplePdf(c) || hasHawbSamplePdf(c) || hasDoOrWmsOfficialSamplePdf(c);
}

/**
 * Prefer official Fresa sample for **reference browse** only.
 *
 * Phase 3: never prefer sample PDFs for Freightnest Generate or entity-bound docs.
 * Generate must use native / template-v2 / JSON / backend pack.
 */
export function shouldPreferOfficialSamplePdf(opts: {
  code: string;
  format: string;
  entityBound?: boolean;
  /** browse = catalogue reference; generate = Freightnest PDF (default). */
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
