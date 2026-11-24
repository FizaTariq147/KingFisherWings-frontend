import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import type { PlacedText } from './drawReferenceForm';
import { stackLines } from './drawReferenceForm';

/** HBL Draft Jasper. Reference: hbl-draft-report-fomat-jasper.pdf, 595×842 pt, 1 page. */
export const HBL_JASPER_REFERENCE_CODE = 'HBL_DRAFT_REPORT_FORMAT_JASPER';
export const HBL_JASPER_REFERENCE_FILE = 'hbl-draft-report-fomat-jasper.pdf';

const LABELS = new Set([
  'BILL OF LADING',
  'NOT NEGOTIABLE UNLESS CONSIGNED "TO ORDER"',
  'Shipper',
  'Consignee',
  'Bill of Lading No.',
  'F/Agent Name & Ref.',
  'Notify Party',
  'Place of Receipt',
  'Port of Loading',
  'Job No.',
  'Vessel/Voyage No.',
  'Port of Discharge',
  'Place of Delivery',
  'No.of Bills of Lading',
  'Pre-carriage by',
  'Prepared By :',
  'Container No. / Seal No./',
  'Mark & No.',
  'No. of Pkgs or',
  'Shipping Units',
  'Description of Goods & Pkgs.',
  'Gross Weight',
  'Measurement',
  'Total Number of Containers SAY :',
  'or Packages(In words)',
  'Freight Details, Charges etc :',
  'Excess Value Declaration: Refer to Clause 6(4)(B) + (C) on reverse side',
  'Signed on behalf of the Carrier.',
  'By',
  'Place and Date of Issue',
  'AS AGENT FOR THE CARRIER',
  'ONBOARD DATE :',
  'DRAFT',
  'KGS',
  'CBM',
]);

export function keepHblJasperLabel(text: string): boolean {
  return LABELS.has(text);
}

/** The sample title is Helvetica Bold. The measured face stores bold as 0. */
export function hblHeadingBold(text: string, size: number): boolean {
  return text === 'BILL OF LADING' && size >= 10;
}

/** Carrier clauses copied from the reference text layer, including its original spelling. */
const HBL_LEGAL: Array<{ text: string; y: number }> = [
  { y: 110.8, text: 'RECEIVED by the Carrier the Goods as specified above in appearent good order and' },
  { y: 103.2, text: 'condition unless otherwise stated, to be transported to such place as agreed, authorised' },
  { y: 95.7, text: 'or permitted herein and subject to all the terms and conditions appearing on the fornt' },
  { y: 88.1, text: 'and reverse of the Bill of Lading to which the Merchant agrees by accepting this Bills of' },
  { y: 80.6, text: 'Lading, any local privileges and customs notwithstanding.' },
  { y: 73.0, text: 'The particulars given above as stated by the shipper and the weight, measure, quantity, condition,' },
  { y: 65.5, text: 'contents and value of the Goods are unknown to the Carrier' },
  { y: 57.9, text: 'In WITNESS whenreof one (1) original Bill of Lading has been signed if not otherwise stated above, the' },
  { y: 50.4, text: 'same being accomplished the other(s). If any, to be void, it required by the Carrier one (1) original Bill' },
  { y: 42.9, text: 'of Lading must be surrendered duty andorsed in exchange fo the Goods or delivery order.' },
];

export function hblJasperFields(data: InvoiceFormatPdfData): PlacedText[] {
  const cargo = data.tableRows?.[0] || [];
  return [
    ...stackLines(data.shipperLines, 21, 766.5, 8, 10.8, 4),
    ...stackLines(data.consigneeLines, 21, 691.5, 8, 10.8, 4),
    ...stackLines(data.notifyLines, 20, 618.5, 8, 10.8, 4),
    { text: data.hblNo || data.referenceNo || '', x: 385, y: 779.9, size: 9 },
    { text: data.jobNumber || '', x: 348, y: 555.7, size: 8 },
    { text: data.pol || '', x: 20, y: 542.5, size: 8 },
    { text: data.pod || '', x: 170, y: 515.5, size: 8 },
    { text: data.vesselFlight || '', x: 20, y: 515.5, size: 8 },
    { text: data.containerNo || cargo[0] || '', x: 21, y: 479.5, size: 8 },
    { text: data.pieces || cargo[1] || '', x: 166.2, y: 479.5, size: 8 },
    { text: data.commodity || cargo[2] || '', x: 233, y: 442.5, size: 8 },
    { text: data.grossWeight || cargo[3] || '', x: 447.4, y: 479.5, size: 8 },
    { text: data.measurement || cargo[4] || '', x: 530.5, y: 479.5, size: 8 },
    { text: data.invoiceDate || '', x: 121, y: 29.5, size: 8 },
    ...HBL_LEGAL.map((line) => ({ text: line.text, x: 20, y: line.y, size: 6 })),
  ];
}
