import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { inspectPdfFile } from '../../../../../tools/reports/extract.mjs';
import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import { code128BitString } from './code128Vector';
import {
  REFERENCE_BARCODE_BOX,
  REFERENCE_LOGO_BOX,
  generateReferenceAccuratePdf,
} from './index';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../');

const logoUrl = `data:image/png;base64,${fs.readFileSync(path.join(root, 'public/kingfisher-logo.png')).toString('base64')}`;

const northwind: InvoiceFormatPdfData = {
  entityBound: true,
  companyName: 'Northwind Freight LLC',
  companyAddress: '18 Harbor Road, Houston, TX 77002',
  logoUrl,
  invoiceNumber: 'INV-2026-0142',
  invoiceDate: '12-NOV-2026',
  dueDate: '12-DEC-2026',
  jobNumber: 'JOB-FE-11-26-0142',
  shipmentNumber: 'SHP-88421',
  hblNo: 'HBL-HOU-4421',
  mawbNo: 'MBL-MAEU-9981',
  referenceNo: 'PO-44190',
  pol: 'Houston',
  pod: 'Jebel Ali',
  vesselFlight: 'MAERSK DENVER / 246E',
  etd: '02-NOV-2026',
  eta: '18-NOV-2026',
  currencyCode: 'USD',
  incoterm: 'FOB',
  commodity: 'Steel valves',
  containerNo: 'MSCU1234567',
  containerType: '20DC',
  sealNo: 'SL-90821',
  pieces: '12',
  grossWeight: '8400 KGS',
  measurement: '18.4 CBM',
  shipperLines: ['Harbor Steel Co', '18 Harbor Road', 'Houston TX 77002'],
  consigneeLines: ['Gulf Metals Trading', 'Warehouse 4, Jebel Ali'],
  notifyLines: ['Gulf Metals Trading'],
  billToName: 'Gulf Metals Trading',
  lines: [
    {
      description: 'Ocean freight',
      sac: '996521',
      qty: '1',
      rate: '1850.00',
      taxable: '1850.00',
      sgstRate: '9',
      sgstAmount: '166.50',
      cgstRate: '9',
      cgstAmount: '166.50',
      igstRate: '0',
      igstAmount: '0.00',
      amount: '2183.00',
    },
  ],
  tax: '333.00',
  total: '2183.00',
  bankName: 'First Harbor Bank',
  bankAccountName: 'Northwind Freight LLC',
  bankAccountNumber: '100200300',
  bankIban: 'US00HARB000100200300',
  bankSwift: 'HARBUS44',
};

const samples = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: 'reports/references/files/invoice-report-format-1-tax-invoice-india.pdf',
  HBL_DRAFT_REPORT_FORMAT_JASPER: 'reports/references/files/hbl-draft-report-fomat-jasper.pdf',
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER:
    'reports/references/files/arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf',
} as const;

function near(left: number, right: number, tolerance = 0.5): boolean {
  return Math.abs(left - right) <= tolerance;
}

describe('production PDF corrections', () => {
  it('encodes a live CODE_128 payload and refuses an empty value', () => {
    const bits = code128BitString('HBL-HOU-4421');
    expect(bits.length).toBeGreaterThan(20);
    expect(bits).toMatch(/^[01]+$/);
    expect(code128BitString('')).toBe('');
    expect(code128BitString('SHP-88421')).not.toBe(bits);
  });

  it('keeps page size, table lines, logo, barcode, weights, and Northwind values', async () => {
    const invoice = await generateReferenceAccuratePdf('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA', northwind);
    const hbl = await generateReferenceAccuratePdf('HBL_DRAFT_REPORT_FORMAT_JASPER', northwind);
    const arrival = await generateReferenceAccuratePdf(
      'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
      northwind,
    );
    const generated = {
      INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: new Uint8Array(await invoice.blob.arrayBuffer()),
      HBL_DRAFT_REPORT_FORMAT_JASPER: new Uint8Array(await hbl.blob.arrayBuffer()),
      ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER: new Uint8Array(await arrival.blob.arrayBuffer()),
    };

    for (const [code, bytes] of Object.entries(generated) as Array<[keyof typeof samples, Uint8Array]>) {
      const file = path.join(root, 'reports/output/production-b2', `${code}.pdf`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, bytes);
      const sample = await inspectPdfFile(path.join(root, samples[code]));
      const drawn = await inspectPdfFile(file);
      expect(drawn.pages).toBe(1);
      expect(drawn.width).toBe(sample.width);
      expect(drawn.height).toBe(sample.height);
      const sampleLines = sample.pageReads[0].lines;
      const matched = sampleLines.filter((line) =>
        drawn.pageReads[0].lines.some(
          (other) =>
            near(line.x1, other.x1) &&
            near(line.y1, other.y1) &&
            near(line.x2, other.x2) &&
            near(line.y2, other.y2),
        ),
      );
      expect(matched.length).toBe(sampleLines.length);

      const logo = REFERENCE_LOGO_BOX[code];
      const image = drawn.pageReads[0].images[0];
      expect(image).toBeTruthy();
      expect(near(image.x, logo.x, 0.6)).toBe(true);
      expect(near(image.y, logo.y, 0.6)).toBe(true);
      expect(image.width).toBeLessThanOrEqual(logo.maxWidth + 0.6);
      expect(image.height).toBeLessThanOrEqual(logo.maxHeight + 0.6);
      expect(image.width >= logo.maxWidth - 0.6 || image.height >= logo.maxHeight - 0.6).toBe(true);

      const text = drawn.pageReads[0].spans.map((span) => span.text).join('\n');
      expect(text).toContain('Northwind Freight LLC');
      expect(text).not.toMatch(/fresa/i);
      expect(text).not.toMatch(/fresatechnologies/i);
      expect(text).not.toMatch(/powered by/i);
    }

    const invoiceRead = await inspectPdfFile(
      path.join(root, 'reports/output/production-b2/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA.pdf'),
    );
    const invoiceSpans = invoiceRead.pageReads[0].spans;
    expect(invoiceSpans.some((span) => span.text === 'TAX INVOICE' && span.font === 'Helvetica-Bold')).toBe(true);
    expect(invoiceSpans.some((span) => span.text === '996521' && span.font === 'Courier')).toBe(true);
    expect(invoiceSpans.some((span) => span.text === '166.50' && span.font === 'Courier')).toBe(true);
    expect(invoiceSpans.some((span) => span.text === '2183.00' && span.font === 'Courier')).toBe(true);

    const hblRead = await inspectPdfFile(
      path.join(root, 'reports/output/production-b2/HBL_DRAFT_REPORT_FORMAT_JASPER.pdf'),
    );
    expect(
      hblRead.pageReads[0].spans.some(
        (span) => span.text === 'BILL OF LADING' && span.font === 'Helvetica-Bold' && span.size >= 10,
      ),
    ).toBe(true);
    const hblBars = hblRead.pageReads[0].rects.filter(
      (rect) =>
        near(rect.y, REFERENCE_BARCODE_BOX.HBL_DRAFT_REPORT_FORMAT_JASPER.y, 0.6) &&
        near(rect.height, REFERENCE_BARCODE_BOX.HBL_DRAFT_REPORT_FORMAT_JASPER.height, 0.6) &&
        String(rect.fill).startsWith('0.000'),
    );
    expect(hblBars.length).toBeGreaterThan(8);
    expect(hblRead.pageReads[0].spans.map((span) => span.text).join('\n')).toContain('HBL-HOU-4421');

    const arrivalRead = await inspectPdfFile(
      path.join(root, 'reports/output/production-b2/ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER.pdf'),
    );
    const arrivalText = arrivalRead.pageReads[0].spans;
    expect(arrivalText.some((span) => span.text.startsWith('1. Kindly contact') && near(span.x, 23))).toBe(true);
    expect(arrivalText.some((span) => span.text.startsWith('4. Partial Payments') && near(span.x, 23))).toBe(true);
    expect(arrivalText.some((span) => span.text.startsWith('6. After Free days') && near(span.x, 23))).toBe(true);
    expect(arrivalText.some((span) => span.text === 'of 1' && near(span.x, 538))).toBe(true);
    expect(arrivalText.some((span) => span.text.includes('Cheque in favor of "Northwind Freight LLC"'))).toBe(true);
    const headerFill = arrivalRead.pageReads[0].rects.find(
      (rect) => near(rect.x, 20, 0.6) && near(rect.y, 442, 0.6) && near(rect.width, 80, 0.6),
    );
    expect(headerFill).toBeTruthy();
    expect(String(headerFill?.fill).startsWith('0.960')).toBe(true);
    const arrivalBars = arrivalRead.pageReads[0].rects.filter(
      (rect) =>
        near(rect.y, REFERENCE_BARCODE_BOX.ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER.y, 0.6) &&
        near(rect.height, REFERENCE_BARCODE_BOX.ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER.height, 0.6) &&
        String(rect.fill).startsWith('0.000'),
    );
    expect(arrivalBars.length).toBeGreaterThan(8);
  }, 60000);
});
