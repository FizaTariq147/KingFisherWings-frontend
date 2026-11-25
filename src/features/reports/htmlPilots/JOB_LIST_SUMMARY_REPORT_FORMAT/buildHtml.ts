import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { mapToOpsListViewModel } from '@/features/reports/mappings/fromCatalogPdfData';
import { isFresaIdentityText } from '@/features/reports/templates/official/officialBranding';
import { escapeHtml, escapeLines } from '../_shared/escapeHtml';
import { wrapHtmlPilotDocument } from '../_shared/wrapDocument';

export const JOB_LIST_HTML_PILOT_CODE = 'JOB_LIST_SUMMARY_REPORT_FORMAT' as const;

/** Landscape A4 for ops list family. */
const PAGE = {
  widthMm: 297,
  heightMm: 210,
};

/**
 * HTML/CSS face for Job List Summary. Reuses mapToOpsListViewModel.
 * Missing cells stay blank. Not accepted.
 */
export function buildJobListSummaryHtmlPilot(data: InvoiceFormatPdfData = {}): string {
  for (const bit of [data.companyName, data.companyAddress, data.companyPhone, data.companyEmail]) {
    if (bit && isFresaIdentityText(bit)) {
      throw new Error('HTML pilot refuses Fresa organization identity');
    }
  }

  const model = mapToOpsListViewModel(JOB_LIST_HTML_PILOT_CODE, data, data.logoUrl, 'Job List Summary');
  const headers = (model.tableHeaders || []).map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const rows = (model.tableRows || [])
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');

  const logo = model.logoUrl?.trim()
    ? `<img class="logo" src="${escapeHtml(model.logoUrl)}" alt="" />`
    : '';

  const body = `
<header class="header">
  ${logo}
  <div class="company">
    <div class="company-name">${escapeHtml(model.companyName)}</div>
    <div class="company-meta">${escapeLines([data.companyAddress, data.companyPhone, data.companyEmail].filter(Boolean) as string[])}</div>
  </div>
  <div class="title-block">
    <div class="title">${escapeHtml(model.formatName)}</div>
    <div class="meta">${escapeHtml(data.invoiceDate || data.referenceNo)}</div>
  </div>
</header>
<table class="list">
  <thead><tr>${headers || '<th>Job</th><th>Customer</th><th>POL</th><th>POD</th><th>ETD</th><th>Status</th>'}</tr></thead>
  <tbody>${rows || '<tr><td colspan="6">&nbsp;</td></tr>'}</tbody>
</table>
<footer class="footer">Job list summary — values from catalogue context only. Empty cells are intentional.</footer>`;

  return wrapHtmlPilotDocument(body, {
    ...PAGE,
    styles: `
.header { display: grid; grid-template-columns: 64px 1fr 180px; gap: 8px; padding: 8mm 8mm 3mm; border-bottom: 0.5pt solid #222; }
.logo { max-width: 60px; max-height: 40px; object-fit: contain; }
.company-name { font-size: 11pt; font-weight: 700; }
.company-meta { font-size: 8pt; line-height: 1.3; }
.title { font-size: 12pt; font-weight: 700; text-align: right; }
.meta { font-size: 8pt; text-align: right; margin-top: 1mm; }
.list { margin: 0 8mm; }
.list th, .list td { border: 0.5pt solid #222; padding: 1.5mm; font-size: 8pt; }
.list th { background: #f3f3f3; font-size: 7pt; text-transform: uppercase; }
.footer { padding: 3mm 8mm 8mm; font-size: 7pt; color: #555; }
`,
  });
}
