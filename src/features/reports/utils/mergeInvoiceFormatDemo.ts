import type { InvoiceFormatUiDemo, InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import type { InvoiceFormatPdfData } from './invoiceFormatToInvoicePdfModel';

/** Overlay live invoice fields onto a permanent JSON layout demo payload. */
export function mergeInvoiceFormatDemo(
  layout: InvoiceFormatUiLayout,
  data: InvoiceFormatPdfData = {},
): InvoiceFormatUiLayout {
  const demo: InvoiceFormatUiDemo = { ...layout.demo };

  if (data.invoiceNumber) {
    demo.invoiceNo = data.invoiceNumber;
    demo.metaRows = (demo.metaRows ?? []).map((row) =>
      /invoice\s*no/i.test(row.k) || /^no\.?$/i.test(row.k)
        ? { ...row, v: data.invoiceNumber! }
        : row,
    );
  }
  if (data.invoiceDate) {
    demo.invoiceDate = data.invoiceDate;
    demo.metaRows = (demo.metaRows ?? []).map((row) =>
      /date/i.test(row.k) && !/due/i.test(row.k) ? { ...row, v: data.invoiceDate! } : row,
    );
  }
  if (data.billToName) demo.billToName = data.billToName;
  if (data.billToAddress) demo.billToAddress = data.billToAddress;
  if (data.currencyCode) demo.currency = data.currencyCode;
  if (data.subtotal) demo.subtotal = data.subtotal;
  if (data.tax) demo.tax = data.tax;
  if (data.total) {
    const cur = data.currencyCode || demo.currency || '';
    demo.total = cur && !data.total.includes(cur) ? `${cur} ${data.total}` : data.total;
  }

  if (data.lines?.length) {
    const headers = demo.tableHeaders?.length
      ? demo.tableHeaders
      : ['Description', 'Qty', 'Rate', 'Amount'];
    demo.tableHeaders = headers;
    demo.tableRows = data.lines.map((line) => {
      const cells = headers.map((h) => {
        const key = h.toLowerCase();
        if (/desc|charge|particular|service|item/i.test(key)) return line.description;
        if (/qty|quantity|unit$/i.test(key) && !/amount|rate|price/i.test(key))
          return line.qty ?? '1';
        if (/rate|price|amount\s*\/\s*qty/i.test(key)) return line.rate ?? '';
        if (/amount|total|fcy/i.test(key)) return line.amount ?? line.rate ?? '';
        if (/curr/i.test(key)) return data.currencyCode || demo.currency || '';
        return '';
      });
      return cells;
    });
  }

  // Never surface third-party sample brand names in demo overlays.
  const scrub = (s?: string) =>
    s ? s.replace(/Fresa/gi, 'KingFisher').replace(/FRESA/g, 'KingFisher') : s;
  demo.billToName = scrub(demo.billToName);
  demo.billToAddress = scrub(demo.billToAddress);
  demo.partyLeft = demo.partyLeft
    ? { ...demo.partyLeft, lines: demo.partyLeft.lines.map((l) => scrub(l) || l) }
    : demo.partyLeft;
  demo.partyMid = demo.partyMid
    ? { ...demo.partyMid, lines: demo.partyMid.lines.map((l) => scrub(l) || l) }
    : demo.partyMid;
  demo.fieldGrid = demo.fieldGrid?.map((f) => ({ ...f, v: scrub(f.v) || f.v }));
  demo.metaRows = demo.metaRows?.map((f) => ({ ...f, v: scrub(f.v) || f.v }));

  return { ...layout, demo, name: scrub(layout.name) || layout.name };
}
