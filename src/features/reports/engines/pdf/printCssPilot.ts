/**
 * Phase 4 PDF reliability pilot — Arrival Notice print-CSS path.
 * Phase 1 wires shared page geometry + typography + structure into the stylesheet.
 *
 * Compares conceptually with html2canvas capture:
 * - Selectable text when printed via browser / Playwright
 * - Accurate A4 via @page
 * - Footer via fixed print footer (running elements optional via structure CSS)
 *
 * Runtime in-app still uses captureReactDocumentPdf until Playwright hosting
 * is approved; this module exposes print-ready HTML + CSS for the pilot.
 */
import type { ArrivalNoticeViewModel } from '../../mappings/types';
import { buildDocumentPrintCss } from './buildDocumentPrintCss';

const foundation = buildDocumentPrintCss({
  page: { paper: 'A4', orientation: 'portrait' },
  typography: {
    fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif',
    ink: '#0f172a',
    muted: '#475569',
    sizesPx: { body: 10, label: 9, title: 16 },
  },
  structure: {
    borderColor: '#cbd5e1',
    enablePrintChrome: false,
    avoidBreakInsideRows: true,
  },
  extraCss: `
.an-pilot-root {
  font-family: var(--fn-font);
  color: var(--fn-ink);
  width: 210mm;
  min-height: 297mm;
  box-sizing: border-box;
  padding: 12mm;
  background: #fff;
}
@media print {
  .an-pilot-root { box-shadow: none !important; border: none !important; }
  .an-pilot-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 9px;
    color: #475569;
    border-top: 1px solid #cbd5e1;
    padding-top: 4px;
  }
}
.an-pilot-root h1 { font-size: 16px; margin: 0 0 4px; }
.an-pilot-root table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
.an-pilot-root th, .an-pilot-root td {
  border: 1px solid #cbd5e1;
  padding: 4px 6px;
  text-align: left;
  vertical-align: top;
}
.an-pilot-root thead { display: table-header-group; }
.an-pilot-root tr { page-break-inside: avoid; break-inside: avoid; }
.an-pilot-band {
  background: #0e7490;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  margin: 10px 0 6px;
  text-transform: uppercase;
}
`.trim(),
});

export const ARRIVAL_NOTICE_PRINT_PILOT_CODE_HINT = 'ARRIVAL_NOTICE';

/** Foundation-backed print CSS (includes @page A4 portrait). */
export const arrivalNoticePrintCss = foundation.css;

export const arrivalNoticePrintGeometry = foundation.geometry;

/** Build print-ready HTML string for Arrival Notice pilot (no invented fields). */
export function buildArrivalNoticePrintHtml(model: ArrivalNoticeViewModel): string {
  const party = (title: string, lines: string[]) =>
    `<div style="border:1px solid #cbd5e1;padding:8px;background:#f8fafc;min-height:72px">
      <div style="font-size:9px;font-weight:700;color:#0e7490;text-transform:uppercase">${title}</div>
      <div style="font-size:10px;white-space:pre-line">${(lines.length ? lines : ['—']).join('\n')}</div>
    </div>`;

  const headers = model.tableHeaders || [];
  const rows = model.tableRows || [];
  const head =
    headers.length > 0
      ? `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`
      : '';
  const body = (rows.length ? rows : [['—']]).map(
    (r) => `<tr>${r.map((c) => `<td>${escapeHtml(c || '—')}</td>`).join('')}</tr>`,
  );

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(model.formatName)}</title>
<style>${arrivalNoticePrintCss}</style>
</head>
<body>
  <article class="an-pilot-root fn-doc" data-pdf-pilot="arrival_notice">
    <header>
      <div style="font-size:14px;font-weight:700;color:#0e7490">${escapeHtml(model.companyName || '')}</div>
      <div style="font-size:10px;color:#475569">${escapeHtml(model.companyAddress || '')}</div>
      <h1>${escapeHtml(model.formatName)}</h1>
      <div style="font-size:9px;color:#64748b">${escapeHtml(model.formatCode)}</div>
    </header>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0">
      ${party('Shipper', model.shipper.lines)}
      ${party('Consignee', model.consignee.lines)}
      ${party('Notify', model.notify.lines)}
    </div>
    <div class="an-pilot-band">Shipment</div>
    <table class="fn-table">
      <tbody>
        <tr><th>Vessel / flight</th><td>${escapeHtml(model.vesselFlight || '—')}</td>
            <th>POL</th><td>${escapeHtml(model.pol || '—')}</td></tr>
        <tr><th>POD</th><td>${escapeHtml(model.pod || '—')}</td>
            <th>ETA</th><td>${escapeHtml(model.eta || '—')}</td></tr>
        <tr><th>Reference</th><td>${escapeHtml(model.referenceNo || '—')}</td>
            <th>Job</th><td>${escapeHtml(model.jobNumber || model.shipmentNumber || '—')}</td></tr>
      </tbody>
    </table>
    <div class="an-pilot-band">Cargo details</div>
    ${model.commodity ? `<p style="font-size:10px">${escapeHtml(model.commodity)}</p>` : ''}
    <table class="fn-table">
      <thead>${head}</thead>
      <tbody>${body.join('')}</tbody>
    </table>
    <footer class="an-pilot-footer fn-footer-slot">
      Arrival notice · ${escapeHtml(model.formatCode)} · Freightnest catalogue pilot (print CSS)
    </footer>
  </article>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type PdfPilotAcceptance = {
  selectableText: boolean;
  pageSizeA4: boolean;
  footerEachPage: boolean;
  repeatingTableHeader: boolean;
  sharpLogo: boolean;
};

/** Documented acceptance checklist for the Arrival Notice pilot. */
export const ARRIVAL_NOTICE_PDF_PILOT_ACCEPTANCE: PdfPilotAcceptance = {
  selectableText: true,
  pageSizeA4: true,
  footerEachPage: true,
  repeatingTableHeader: true,
  sharpLogo: true,
};
