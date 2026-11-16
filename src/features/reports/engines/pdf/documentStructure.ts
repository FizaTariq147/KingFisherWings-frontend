/**
 * Phase 1 — document structure CSS for tables, chrome, and page breaks.
 * Used by print CSS pilots and as the shared stylesheet contract for format templates.
 */

export type DocumentStructureOptions = {
  /** Border color for grids / separators. */
  borderColor?: string;
  borderWidthPx?: number;
  /** Show running header/footer regions in print. */
  enablePrintChrome?: boolean;
  /** Avoid splitting rows across pages when possible. */
  avoidBreakInsideRows?: boolean;
};

const DEFAULTS: Required<DocumentStructureOptions> = {
  borderColor: '#1a1a1a',
  borderWidthPx: 1,
  enablePrintChrome: true,
  avoidBreakInsideRows: true,
};

/**
 * Structural CSS: precise tables, thead repeat, controlled breaks, header/footer slots.
 */
export function documentStructureToCss(options: DocumentStructureOptions = {}): string {
  const o = { ...DEFAULTS, ...options };
  const border = `${o.borderWidthPx}px solid ${o.borderColor}`;

  return `
.fn-doc {
  position: relative;
  box-sizing: border-box;
}
.fn-doc *,
.fn-doc *::before,
.fn-doc *::after {
  box-sizing: border-box;
}
.fn-doc .fn-page {
  position: relative;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
}
.fn-doc .fn-page:last-child {
  page-break-after: auto;
  break-after: auto;
}
.fn-doc .fn-section {
  position: relative;
}
.fn-doc .fn-fixed-slot {
  position: absolute;
}
.fn-doc .fn-separator {
  border: 0;
  border-top: ${border};
  margin: 0;
}
.fn-doc table.fn-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.fn-doc table.fn-table th,
.fn-doc table.fn-table td {
  border: ${border};
  vertical-align: top;
  overflow: hidden;
}
.fn-doc table.fn-table thead {
  display: table-header-group;
}
.fn-doc table.fn-table tfoot {
  display: table-footer-group;
}
.fn-doc table.fn-table tr {
  ${o.avoidBreakInsideRows ? 'page-break-inside: avoid; break-inside: avoid;' : ''}
}
.fn-doc .fn-no-break {
  page-break-inside: avoid;
  break-inside: avoid;
}
.fn-doc .fn-break-before {
  page-break-before: always;
  break-before: page;
}
.fn-doc .fn-break-after {
  page-break-after: always;
  break-after: page;
}
.fn-doc .fn-overflow-clip {
  overflow: hidden;
  max-width: 100%;
}
.fn-doc .fn-header-slot,
.fn-doc .fn-footer-slot {
  width: 100%;
}
${
  o.enablePrintChrome
    ? `
@media print {
  .fn-doc .fn-print-header {
    position: running(fnHeader);
  }
  .fn-doc .fn-print-footer {
    position: running(fnFooter);
  }
  @page {
    @top-center { content: element(fnHeader); }
    @bottom-center { content: element(fnFooter); }
  }
}
`
    : ''
}
`.trim();
}
