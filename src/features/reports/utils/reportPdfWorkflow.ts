/**
 * Separate Fresa public samples from Freightnest-generated documents.
 *
 * In-app preview and generate always use Freightnest native / template-v2 / JSON /
 * backend pack with organization branding. Fresa CDN samples are never opened or
 * stamped as product output — compare only via the external Fresa website link.
 */

export type ReportPdfWorkflow = 'reference_browse' | 'freightnest_generate';

export const REPORT_PDF_WORKFLOW = {
  /** @deprecated Kept for type compatibility; in-app PDFs never use this path. */
  REFERENCE_BROWSE: 'reference_browse' as const,
  FREIGHTNEST_GENERATE: 'freightnest_generate' as const,
};

/** Copy when a Fresa CDN sample exists for external comparison only. */
export const FRESA_REFERENCE_SAMPLE_LABEL =
  'Fresa publishes a public sample for layout comparison on fresatechnologies.com. This app never opens or ships that PDF';

export type ResolveReportPdfWorkflowInput = {
  /** Live job/shipment/invoice bound into the report. */
  entityBound?: boolean;
  /**
   * Explicit purpose. Both browse and generate resolve to Freightnest generation
   * so catalogue AutoPdf cannot load a third-party Fresa sample as the document.
   */
  purpose?: 'browse' | 'generate';
};

/**
 * Resolve which PDF workflow applies.
 * Always Freightnest generation — no in-app Fresa sample PDF.
 */
export function resolveReportPdfWorkflow(
  _input: ResolveReportPdfWorkflowInput = {},
): ReportPdfWorkflow {
  return REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE;
}

/** In-app Fresa sample PDFs are disabled. */
export function allowsFresaSamplePdf(_workflow: ReportPdfWorkflow): boolean {
  return false;
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
