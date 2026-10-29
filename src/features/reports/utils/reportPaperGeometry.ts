import type {
  InvoiceFormatOrientation,
  InvoiceFormatPaper,
} from '../types/invoiceFormatPreview.types';

/** @deprecated Prefer InvoiceFormatOrientation — kept as alias for call sites. */
export type ReportPageOrientation = InvoiceFormatOrientation;

/**
 * CSS pixel sizes at 96dpi matching physical paper.
 * A4: 210mm × 297mm → 794.0 × 1123.0 px
 * Letter: 8.5in × 11in → 816 × 1056 px
 *
 * Keep the sheet box exact (border-box) so html2canvas → jsPDF mapping stays stable.
 */
export const REPORT_PAPER_CSS_PX = {
  A4: { short: 794, long: 1123 },
  Letter: { short: 816, long: 1056 },
} as const;

export type ReportPaperGeometry = {
  paper: InvoiceFormatPaper;
  orientation: ReportPageOrientation;
  /** Capture host / sheet width in CSS px */
  cssWidth: number;
  /** Capture sheet height in CSS px */
  cssHeight: number;
  /** jsPDF orientation */
  jsPdfOrientation: ReportPageOrientation;
  /** jsPDF format name */
  jsPdfFormat: 'a4' | 'letter';
};

export function normalizeReportOrientation(
  value: string | null | undefined,
): ReportPageOrientation {
  return String(value || '').toLowerCase() === 'landscape' ? 'landscape' : 'portrait';
}

export function resolveReportPaperGeometry(
  paper: InvoiceFormatPaper | null | undefined,
  orientation?: ReportPageOrientation | string | null,
): ReportPaperGeometry {
  const resolvedPaper: InvoiceFormatPaper = paper === 'Letter' ? 'Letter' : 'A4';
  const orient = normalizeReportOrientation(orientation);
  const dims = REPORT_PAPER_CSS_PX[resolvedPaper];
  const cssWidth = orient === 'landscape' ? dims.long : dims.short;
  const cssHeight = orient === 'landscape' ? dims.short : dims.long;
  return {
    paper: resolvedPaper,
    orientation: orient,
    cssWidth,
    cssHeight,
    jsPdfOrientation: orient,
    jsPdfFormat: resolvedPaper === 'Letter' ? 'letter' : 'a4',
  };
}
