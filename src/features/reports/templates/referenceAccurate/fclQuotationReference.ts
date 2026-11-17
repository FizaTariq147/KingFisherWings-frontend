import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import type { PlacedText } from './drawReferenceForm';
import { stackLines } from './drawReferenceForm';

/** FCL quotation. Reference: fcl-quotation-report-format.pdf, 594×841.9 pt, 1 page. */
export const FCL_QUOTATION_REFERENCE_CODE = 'FCL_QUOTATION_REPORT_FORMAT';
export const FCL_QUOTATION_REFERENCE_FILE = 'fcl-quotation-report-format.pdf';

const LABELS = new Set([
  'FCL QUOTATION',
  '1/1',
  'To :',
  'Dear Sir,',
  'While thanking you for giving us an opportunity to quote for you requirement. Please find',
  'Quotation No :',
  'Quotation Validity :',
  'Origin :',
  'Port of Loding :',
  'Port of Discharge :',
  'Final Destination :',
  'Movement Type :',
  'Transit Time :',
  'PP/CC :',
  'Frequency :',
  'Remarks :',
  'Container Details',
  'Container',
  'No. of Containers',
  'Type',
  'Description',
  'Pkgs',
  'Volume',
  'Net Weight',
  'Gross Weight',
  'Volume Weight',
  'Charges',
  'Charge',
  'Unit',
  'Qty Currency',
  'Ex.Rate',
  'Amount/Unit',
  'FCY',
  'Amount',
  'Taxable',
  'Tax Group Tax Amount Total Amount',
  'Total :',
  'Terms & Conditions',
  '1. Rates Based On Prevailing Market Conditions. Any General Rate Increase Implemented By T',
  '2. Quote is Valid Only For Declared Dimensions And May Change If Actual Dimension Differ.',
  '3. Local Handling Charges Are Based On The Actual / Port / Government / Customs Tariff.',
  '4. Terms Are Applicable As Per Bill Of Lading / Air Way Bill.',
  'Thanks & Regards',
  'Sales Team',
  'User :',
]);

export function keepFclQuotationLabel(text: string): boolean {
  return LABELS.has(text);
}

export function fclQuotationFields(data: InvoiceFormatPdfData): PlacedText[] {
  const party = data.billToName ? [data.billToName, ...(data.consigneeLines || [])] : data.consigneeLines;
  const quoteNo = [data.quotationNumber || data.invoiceNumber, data.invoiceDate].filter(Boolean).join(' / ');
  const chargeFields: PlacedText[] = [];
  (data.lines || []).slice(0, 8).forEach((line, index) => {
    const y = 454.5 - index * 20;
    chargeFields.push(
      { text: line.description || '', x: 17.2, y, size: 7.9 },
      { text: line.qty || '', x: 197.1, y, size: 7.9 },
      { text: data.currencyCode || '', x: 213.2, y, size: 7.9 },
      { text: line.rate || '', x: 304.5, y, size: 7.9 },
      { text: line.amount || '', x: 520, y, size: 7.9 },
    );
  });
  return [
    ...stackLines(party, 16.6, 718.5, 7.9, 9.1, 5),
    { text: quoteNo, x: 128, y: 620.1, size: 7.9 },
    { text: data.validUntil || '', x: 408.9, y: 620.1, size: 7.9 },
    { text: data.pol || '', x: 128, y: 609.9, size: 7.9 },
    { text: data.pol || '', x: 408.9, y: 609.9, size: 7.9 },
    { text: data.pod || '', x: 128, y: 599.8, size: 7.9 },
    { text: data.pod || '', x: 408.9, y: 599.8, size: 7.9 },
    { text: data.commodity || '', x: 128, y: 569.2, size: 7.9 },
    ...chargeFields,
    { text: data.total || '', x: 520, y: 344.2, size: 8.5 },
  ];
}
