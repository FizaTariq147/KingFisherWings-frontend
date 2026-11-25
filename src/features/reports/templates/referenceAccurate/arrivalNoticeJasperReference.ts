import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import type { PlacedText } from './drawReferenceForm';
import { pdfSafe, stackLines } from './drawReferenceForm';

/** Cargo arrival notice Jasper. Reference: arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf, 595×842 pt. */
export const ARRIVAL_JASPER_REFERENCE_CODE = 'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER';
export const ARRIVAL_JASPER_REFERENCE_FILE =
  'arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf';

const LABELS = new Set([
  'ARRIVAL NOTICE',
  'Attention: Ocean Import - Shipping Dept.',
  'Please come before 12:30pm or after 2:00pm',
  'Shipper',
  'Consignee',
  'Notify 1',
  'MBL No.',
  'HBL No.',
  'ETD / ETA',
  'Vessel / Voyage No.',
  'Port of Loading',
  'Port of Discharge',
  'Final Destination',
  'Gross Weight',
  'Measurement',
  'No. of Pcs',
  'Freight',
  'BL Status',
  'Goods Available At',
  'Shipment No.',
  'Marks',
  'Description of Goods',
  'Container No.',
  'Type',
  'Actual Seal',
  'Commodity Desc',
  'No. of Pcs',
  'No. of',
  'Pallets',
  'G.Weight',
  'Volume',
  'Total :',
  'Charge Description',
  'Qty',
  'Currency',
  'Ex.Rate',
  'Amount/Qty',
  'FCY Amount',
  'Local Amount',
  'KGS',
  'CBM',
  ':',
  '1. Kindly contact our Imports Department/Customer Service for Actual Arrival.',
  '2. D.O Counter Timings - 10.00am to 01.00pm & 02.00pm to 4.30pm.',
  '4. Partial Payments are not acceptable.',
  '5. Free Days FCL- 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL - 5 Days Free Days',
  '6. After Free days storage charges applicable',
  'Yours faithfully ,',
  'Printed By :',
  'Printed Date :',
  'Page 1',
  'of 1',
]);

export function keepArrivalJasperLabel(text: string): boolean {
  return LABELS.has(text);
}

/**
 * The measured face stores these notice lines at x=31.9 and "of 1" at x=539.9.
 * The pinned sample text is at x=23 and x=538. The face file is left unchanged.
 */
export function arrivalLabelX(text: string, x: number): number {
  if (
    text.startsWith('1. Kindly contact our Imports Department') ||
    text.startsWith('4. Partial Payments are not acceptable') ||
    text.startsWith('6. After Free days storage charges applicable')
  ) {
    return 23;
  }
  if (text === 'of 1') return 538;
  return x;
}

export function arrivalJasperFields(data: InvoiceFormatPdfData): PlacedText[] {
  const cargo = data.tableRows?.[0] || [];
  const etdEta = [data.etd, data.eta].filter(Boolean).join(' / ');
  const company = pdfSafe(data.companyName || '');
  const chargeFields: PlacedText[] = [];
  (data.lines || []).slice(0, 6).forEach((line, index) => {
    const y = 387.5 - index * 13;
    chargeFields.push(
      { text: line.description || '', x: 23, y, size: 8 },
      { text: line.qty || '', x: 217.8, y, size: 8 },
      { text: data.currencyCode || '', x: 253.1, y, size: 8 },
      { text: line.amount || '', x: 520, y, size: 8 },
    );
  });
  return [
    ...stackLines(data.shipperLines, 23, 666.5, 7, 9.4, 3),
    ...stackLines(data.consigneeLines, 23, 604.5, 7, 9.4, 3),
    ...stackLines(data.notifyLines, 23, 539.5, 7, 9.4, 3),
    { text: data.mawbNo || data.referenceNo || '', x: 386, y: 675.7, size: 7 },
    { text: data.hblNo || '', x: 386, y: 664.7, size: 7 },
    { text: etdEta, x: 386, y: 653.7, size: 7 },
    { text: data.vesselFlight || '', x: 386, y: 641.7, size: 7 },
    { text: data.pol || '', x: 386, y: 630.7, size: 7 },
    { text: data.pod || '', x: 386, y: 619.7, size: 7 },
    { text: data.grossWeight || '', x: 386, y: 597.7, size: 7 },
    { text: data.measurement || '', x: 386, y: 586.7, size: 7 },
    { text: data.pieces || '', x: 386, y: 575.7, size: 7 },
    { text: data.shipmentNumber || '', x: 386, y: 541.7, size: 7 },
    { text: data.commodity || cargo[3] || '', x: 231, y: 432.1, size: 7 },
    { text: data.containerNo || cargo[0] || '', x: 21, y: 432.1, size: 7 },
    { text: data.containerType || cargo[1] || '', x: 101, y: 432.1, size: 7 },
    { text: data.sealNo || cargo[2] || '', x: 161, y: 432.1, size: 7 },
    ...chargeFields,
    { text: data.total || '', x: 520, y: 348.5, size: 8 },
    {
      text: company ? `3. Cheque in favor of "${company}".` : '',
      x: 31.9,
      y: 287,
      size: 8,
    },
  ];
}
