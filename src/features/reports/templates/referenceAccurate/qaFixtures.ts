import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';

/**
 * QA-only records. These are not written to the database and are not the Fresa sample.
 */
export const QA_POPULATED_REPORT: InvoiceFormatPdfData = {
  entityBound: true,
  companyName: 'KingFisher Wings Logistics',
  companyAddress: 'Chennai',
  logoUrl: '',
  shipperLines: ['ACME EXPORTERS', 'CHENNAI'],
  consigneeLines: ['BETA IMPORTS LLC', 'DUBAI'],
  notifyLines: ['BETA IMPORTS LLC'],
  jobNumber: 'JOB-260014',
  invoiceNumber: 'INV-100',
  quotationNumber: 'Q-100',
  invoiceDate: '16-NOV-26',
  hblNo: 'HBL-100',
  mawbNo: 'MAWB-100',
  hawbNo: 'HAWB-100',
  pol: 'CHENNAI',
  pod: 'JEBEL ALI',
  vesselFlight: 'MSC MARINA / 876',
  etd: '16-NOV-26',
  eta: '28-NOV-26',
  currencyCode: 'INR',
  commodity: 'PAPER CUPS',
  shipmentNumber: 'SHP-100',
  pieces: '100',
  grossWeight: '1250',
  measurement: '2.4',
  containerNo: 'ABCU1234567',
  containerType: "20' DC",
  sealNo: 'SL100',
  bankName: 'Sample Bank',
  bankAccountName: 'KingFisher Wings Logistics',
  bankAccountNumber: '000111',
  bankIban: 'AE000',
  bankSwift: 'KFWSWIFT',
  tax: '18.00',
  total: '118.00',
  lines: [{ description: 'FREIGHT', qty: '1', rate: '100', amount: '100', currency: 'INR', taxAmount: '18.00' }],
};

export const QA_EMPTY_REPORT: InvoiceFormatPdfData = {
  entityBound: true,
  companyName: 'KingFisher Wings Logistics',
};
