import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import type { PlacedText } from './drawReferenceForm';
import { pdfSafe, stackLines } from './drawReferenceForm';

/** Tax invoice India format 1. Reference: invoice-report-format-1-tax-invoice-india.pdf, 594×841.9 pt. */
export const INVOICE_INDIA_REFERENCE_CODE = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA';
export const INVOICE_INDIA_REFERENCE_FILE = 'invoice-report-format-1-tax-invoice-india.pdf';

const LABELS = new Set([
  'TAX INVOICE',
  '1/1',
  'Bill To',
  'Invoice No./Date',
  'Due Date',
  'Shipper',
  'Consignee',
  'Job No.',
  'Shipment No.',
  'MBL / MAWB No.',
  'HBL / HAWB No.',
  'Place of Receipt',
  'POR',
  'POL',
  'POD',
  'Place of Delivery',
  'Vessel / Voyage',
  'ETD',
  'ETA',
  'Narration',
  'Reference No.',
  'Currency',
  'IGM No.',
  'INCO Terms',
  'Remarks',
  'Container No.',
  'Type',
  'No of Pcs',
  'Gross Weight',
  'Volume',
  'Volume Weight',
  'Charges',
  'SAC',
  'Code',
  'Qty',
  'Amount /',
  'Currency',
  'Ex.Rate',
  'FCY',
  'Amount',
  'Taxable',
  'Non',
  'SGST',
  '%',
  'CGST',
  'I/UGST',
  'Total',
  '(INR)',
  'Tax',
  'Amount (INR)',
  'Terms',
  'Bank Details',
  'Bank',
  'A/c No',
  'IBAN Code',
  'Swift Code',
  'Address',
  'Created By :',
  'User :',
  ':',
  'This is a computer generated document and does not require a signature',
]);

const TERMS = [
  '1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt.',
  '2. Any discrepancy should be notified to us in writing within 15 days from the invoice date after which NONE will be accepted.',
];

export function keepInvoiceIndiaLabel(text: string): boolean {
  return LABELS.has(text);
}

/** Sample title is Arial Bold. The measured face stores bold as 0. */
export function invoiceHeadingBold(text: string): boolean {
  return text === 'TAX INVOICE';
}

function numeric(text: string, x: number, y: number, size = 7.9): PlacedText {
  return { text, x, y, size, mono: Boolean(text.trim()) };
}

/** Courier is 0.6 em wide. Right edge keeps a value inside its column. */
function numericEnd(text: string, right: number, y: number, size = 7.9): PlacedText {
  const width = text.trim().length * size * 0.6;
  return numeric(text, text.trim() ? right - width : right, y, size);
}

export function invoiceIndiaFields(data: InvoiceFormatPdfData): PlacedText[] {
  const bill = data.billToName
    ? [data.billToName, ...(data.consigneeLines || []).filter((line) => line !== data.billToName)]
    : data.consigneeLines;
  const house = [data.hblNo, data.hawbNo].filter(Boolean).join(' / ');
  const master = data.mawbNo || '';
  const invoiceRef = [data.invoiceNumber, data.invoiceDate].filter(Boolean).join(' / ');
  const cargo = data.tableRows?.[0] || [];
  const chargeFields: PlacedText[] = [];
  (data.lines || []).slice(0, 8).forEach((line, index) => {
    const y = 487.8 - index * 16;
    chargeFields.push(
      { text: line.description || '', x: 18.9, y, size: 7.9 },
      numeric(line.sac || '', 89.4, y),
      numeric(line.qty || '', 125.3, y),
      numeric(line.rate || '', 145.6, y),
      { text: data.currencyCode || '', x: 184.1, y, size: 7.9 },
      numeric(line.taxable || '', 291.3, y),
      numeric(line.sgstRate || '', 363.4, y),
      numericEnd(line.sgstAmount || '', 417, y),
      numeric(line.cgstRate || '', 419.7, y),
      numericEnd(line.cgstAmount || '', 474, y),
      numeric(line.igstRate || '', 476.3, y),
      numericEnd(line.igstAmount || '', 536, y),
      numeric(line.amount || '', 542.4, y),
    );
  });
  return [
    ...stackLines(bill, 134.2, 741.1, 7.9, 9.1, 5),
    { text: invoiceRef, x: 415.1, y: 741.1, size: 7.9 },
    { text: data.dueDate || '', x: 134.2, y: 685.7, size: 7.9 },
    { text: data.shipperLines?.[0] || '', x: 415.1, y: 685.7, size: 7.9 },
    { text: data.consigneeLines?.[0] || '', x: 134.2, y: 675.5, size: 7.9 },
    { text: data.jobNumber || '', x: 415.1, y: 675.5, size: 7.9 },
    { text: data.shipmentNumber || '', x: 134.2, y: 665.3, size: 7.9 },
    { text: master, x: 415.1, y: 665.3, size: 7.9 },
    { text: house, x: 134.2, y: 655.2, size: 7.9 },
    { text: data.pol || '', x: 415.1, y: 655.2, size: 7.9 },
    { text: data.pol || '', x: 415.1, y: 645, size: 7.9 },
    { text: data.pod || '', x: 134.2, y: 634.8, size: 7.9 },
    { text: data.vesselFlight || '', x: 134.2, y: 624.6, size: 7.9 },
    { text: data.etd || '', x: 415.1, y: 624.6, size: 7.9 },
    { text: data.eta || '', x: 415.1, y: 614.5, size: 7.9 },
    { text: data.referenceNo || '', x: 134.2, y: 586.2, size: 7.9 },
    { text: data.currencyCode || '', x: 415.1, y: 586.2, size: 7.9 },
    { text: data.incoterm || '', x: 415.1, y: 576, size: 7.9 },
    { text: data.commodity || '', x: 136.5, y: 564.1, size: 7.9 },
    { text: data.containerNo || cargo[0] || '', x: 30.9, y: 541, size: 7.9 },
    { text: data.containerType || cargo[1] || '', x: 105.8, y: 541, size: 7.9 },
    { text: data.pieces || cargo[2] || '', x: 222, y: 541, size: 7.9 },
    { text: data.grossWeight || cargo[3] || '', x: 381.4, y: 541, size: 7.9 },
    { text: data.measurement || cargo[4] || '', x: 455.1, y: 541, size: 7.9 },
    ...chargeFields,
    numeric(data.total || '', 542.4, 348.8, 8.5),
    numeric(data.tax || '', 552.6, 372.5),
    { text: 'Beneficiary Name:', x: 16.6, y: 269.1, size: 7.9 },
    { text: data.bankAccountName || '', x: 110, y: 269.1, size: 7.9 },
    { text: data.bankName || '', x: 90, y: 259.4, size: 7.9 },
    numeric(data.bankAccountNumber || '', 90, 249.8),
    numeric(data.bankIban || '', 90, 240.2),
    numeric(data.bankSwift || '', 90, 230.6),
    { text: pdfSafe(TERMS[0]), x: 16.6, y: 319.9, size: 7.9 },
    { text: pdfSafe(TERMS[1]), x: 16.6, y: 303, size: 7.9 },
  ];
}
