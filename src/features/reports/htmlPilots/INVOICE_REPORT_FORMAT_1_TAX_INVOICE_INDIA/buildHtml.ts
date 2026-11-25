import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { isFresaIdentityText } from '@/features/reports/templates/official/officialBranding';
import { escapeHtml, escapeLines } from '../_shared/escapeHtml';
import { wrapHtmlPilotDocument } from '../_shared/wrapDocument';

export const INVOICE_HTML_PILOT_CODE = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA' as const;

const PAGE = {
  widthMm: 210,
  heightMm: 297,
};

/**
 * HTML/CSS face for Tax Invoice India Format 1 (catalogue path only).
 * Reuses InvoiceFormatPdfData. Does not touch classic generateInvoicePdf.
 * Missing fields stay blank. Not accepted.
 */
export function buildInvoiceIndiaHtmlPilot(data: InvoiceFormatPdfData = {}): string {
  for (const bit of [data.companyName, data.companyAddress, data.companyPhone, data.companyEmail]) {
    if (bit && isFresaIdentityText(bit)) {
      throw new Error('HTML pilot refuses Fresa organization identity');
    }
  }

  const lines = (data.lines || [])
    .map(
      (line) => `<tr>
  <td>${escapeHtml(line.description)}</td>
  <td class="num">${escapeHtml(line.qty)}</td>
  <td class="num">${escapeHtml(line.rate)}</td>
  <td class="num">${escapeHtml(line.taxAmount)}</td>
  <td class="num">${escapeHtml(line.amount)}</td>
</tr>`,
    )
    .join('');

  const logo = data.logoUrl?.trim()
    ? `<img class="logo" src="${escapeHtml(data.logoUrl)}" alt="" />`
    : '';

  const billTo = escapeLines(
    [data.billToName, data.billToAddress, data.billToPhone, data.billToEmail].filter(Boolean) as string[],
  );

  const body = `
<header class="header">
  ${logo}
  <div class="company">
    <div class="company-name">${escapeHtml(data.companyName)}</div>
    <div class="company-meta">${escapeLines([data.companyAddress, data.companyPhone, data.companyEmail].filter(Boolean) as string[])}</div>
  </div>
  <div class="title-block">
    <div class="title">Tax Invoice</div>
    <div class="meta"><span class="label">Invoice No.</span> ${escapeHtml(data.invoiceNumber)}</div>
    <div class="meta"><span class="label">Date</span> ${escapeHtml(data.invoiceDate)}</div>
    <div class="meta"><span class="label">Currency</span> ${escapeHtml(data.currencyCode)}</div>
  </div>
</header>
<section class="billto">
  <div class="label">Bill To</div>
  <div>${billTo || '&nbsp;'}</div>
</section>
<section class="refs">
  <div><span class="label">Job</span> ${escapeHtml(data.jobNumber)}</div>
  <div><span class="label">Reference</span> ${escapeHtml(data.referenceNo)}</div>
  <div><span class="label">POL</span> ${escapeHtml(data.pol)}</div>
  <div><span class="label">POD</span> ${escapeHtml(data.pod)}</div>
</section>
<table class="charges">
  <thead>
    <tr>
      <th>Description</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Amount</th>
    </tr>
  </thead>
  <tbody>${lines || '<tr><td colspan="5">&nbsp;</td></tr>'}</tbody>
</table>
<section class="totals no-break">
  <div><span class="label">Subtotal</span> ${escapeHtml(data.subtotal)}</div>
  <div><span class="label">Tax</span> ${escapeHtml(data.tax)}</div>
  <div class="grand"><span class="label">Total</span> ${escapeHtml(data.total)}</div>
</section>
<section class="bank no-break">
  <div class="label">Bank details</div>
  <div>${escapeHtml(data.bankName)}</div>
  <div>${escapeHtml(data.bankAccountName)}</div>
  <div>${escapeHtml(data.bankAccountNumber)}</div>
  <div>${escapeHtml(data.bankIban)}</div>
  <div>${escapeHtml(data.bankSwift)}</div>
</section>`;

  return wrapHtmlPilotDocument(body, {
    ...PAGE,
    styles: `
.header { display: grid; grid-template-columns: 72px 1fr 150px; gap: 8px; padding: 10mm 10mm 4mm; border-bottom: 0.5pt solid #222; }
.logo { max-width: 70px; max-height: 48px; object-fit: contain; }
.company-name { font-size: 11pt; font-weight: 700; }
.company-meta { font-size: 8pt; line-height: 1.3; }
.title { font-size: 12pt; font-weight: 700; text-align: right; }
.meta { font-size: 8pt; text-align: right; margin-top: 1mm; }
.label { font-size: 7pt; color: #333; text-transform: uppercase; display: block; margin-bottom: 0.5mm; }
.billto { margin: 0 10mm; padding: 3mm 0; border-bottom: 0.5pt solid #222; font-size: 9pt; min-height: 22mm; }
.refs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm; margin: 0 10mm; padding: 2mm 0; font-size: 8pt; border-bottom: 0.5pt solid #222; }
.charges { margin: 0 10mm; }
.charges th, .charges td { border: 0.5pt solid #222; padding: 1.5mm; font-size: 8pt; }
.charges th { background: #f3f3f3; font-size: 7pt; text-transform: uppercase; }
.num { text-align: right; }
.totals { margin: 2mm 10mm 0; display: grid; justify-content: end; gap: 1mm; font-size: 9pt; width: auto; max-width: 60mm; margin-left: auto; margin-right: 10mm; }
.grand { font-weight: 700; font-size: 10pt; }
.bank { margin: 6mm 10mm 10mm; font-size: 8pt; min-height: 20mm; border-top: 0.5pt solid #222; padding-top: 2mm; }
`,
  });
}
