/**
 * Phase 3 — separate Fresa reference PDFs from Freightnest-generated documents.
 *
 * reference_browse: may display unmodified official Fresa CDN samples (labelled).
 * freightnest_generate: native / template-v2 / JSON / backend pack only — never a Fresa sample PDF.
 */

export type ReportPdfWorkflow = 'reference_browse' | 'freightnest_generate';

export const REPORT_PDF_WORKFLOW = {
  REFERENCE_BROWSE: 'reference_browse' as const,
  FREIGHTNEST_GENERATE: 'freightnest_generate' as const,
};

/** User-facing label for browse of official CDN samples. */
export const FRESA_REFERENCE_SAMPLE_LABEL =
  'Official Fresa reference sample (third-party artwork — not a Freightnest-generated document)';

export type ResolveReportPdfWorkflowInput = {
  /** Live job/shipment/invoice bound into the report. */
  entityBound?: boolean;
  /**
   * Explicit purpose. Generate panel / download must pass `freightnest_generate`.
   * Catalogue AutoPdf unbound browse may pass `reference_browse`.
   */
  purpose?: 'browse' | 'generate';
};

/**
 * Resolve which PDF workflow applies.
 * Entity-bound and Generate always use Freightnest generation.
 */
export function resolveReportPdfWorkflow(
  input: ResolveReportPdfWorkflowInput = {},
): ReportPdfWorkflow {
  if (input.entityBound) return REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE;
  if (input.purpose === 'generate') return REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE;
  if (input.purpose === 'browse') return REPORT_PDF_WORKFLOW.REFERENCE_BROWSE;
  // Safe default: treat unspecified unbound calls as generate so callers cannot
  // accidentally ship stamped Fresa samples as Freightnest PDFs.
  return REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE;
}

/** True only for labelled reference browse of CDN samples. */
export function allowsFresaSamplePdf(workflow: ReportPdfWorkflow): boolean {
  return workflow === REPORT_PDF_WORKFLOW.REFERENCE_BROWSE;
}

/**
 * Guard for generate paths — throws if a caller tries to use a Fresa sample as output.
 */
export function assertFreightnestGenerateAllowsNoFresaSample(
  workflow: ReportPdfWorkflow,
  context: string,
): void {
  if (!allowsFresaSamplePdf(workflow)) return;
  throw new Error(
    `Phase 3: Fresa sample PDF is not allowed for Freightnest generation (${context}). Use native, template-v2, JSON, or backend pack.`,
  );
}
