import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { generateCatalogLayoutPdf } from '../../utils/generateCatalogLayoutPdf';
import {
  ACTIVITY_COMPLETED_JOBS_HEADERS,
  generateActivityCompletedJobsWorkbook,
} from './activityCompletedJobsWorkbook';
import { generateReferenceAccuratePdf, REFERENCE_ACCURATE_STATUS } from './index';

async function textOf(bytes: Uint8Array): Promise<string> {
  const doc = await getDocument({ data: bytes }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const box = page.getViewport({ scale: 1 });
  const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
  return `${box.width.toFixed(1)}x${box.height.toFixed(1)} ${text}`;
}

const live = {
  entityBound: true,
  companyName: 'KingFisher Wings Logistics',
  shipperLines: ['ACME EXPORTERS'],
  consigneeLines: ['BETA IMPORTS LLC'],
  notifyLines: ['BETA IMPORTS LLC'],
  jobNumber: 'JOB-260014',
  invoiceNumber: 'INV-100',
  quotationNumber: 'Q-100',
  hblNo: 'HBL-100',
  mawbNo: 'MAWB-100',
  hawbNo: 'HAWB-100',
  pol: 'CHENNAI',
  pod: 'JEBEL ALI',
  currencyCode: 'INR',
  commodity: 'PAPER CUPS',
  lines: [{ description: 'FREIGHT', qty: '1', rate: '100', amount: '100' }],
  total: '100',
};

describe('reference-accurate templates', () => {
  it('keeps six separate codes and does not mark visual validation accepted', () => {
    expect(REFERENCE_ACCURATE_STATUS).toHaveLength(6);
    const codes = new Set(REFERENCE_ACCURATE_STATUS.map((row) => row.code));
    expect(codes.size).toBe(6);
    for (const row of REFERENCE_ACCURATE_STATUS) {
      expect(row.visualValidation).not.toBe('accepted');
    }
  });

  it('draws the India tax invoice from live fields and omits the Fresa sample', async () => {
    const { blob } = await generateReferenceAccuratePdf(
      'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
      live,
    );
    const text = await textOf(new Uint8Array(await blob.arrayBuffer()));
    expect(text.startsWith('594.0x841.9')).toBe(true);
    expect(text).toContain('TAX INVOICE');
    expect(text).toContain('Bill To');
    expect(text).toContain('KingFisher Wings Logistics');
    expect(text).toContain('ACME EXPORTERS');
    expect(text).toContain('INV-100');
    expect(text).not.toMatch(/fresa/i);
    expect(text).not.toContain('4G LOGISTICS');
    expect(text).not.toContain('MAAINV1900717');
  });

  it('draws the HBL, quotation and arrival notice as separate pages', async () => {
    const hbl = await generateReferenceAccuratePdf('HBL_DRAFT_REPORT_FORMAT_JASPER', live);
    const quote = await generateReferenceAccuratePdf('FCL_QUOTATION_REPORT_FORMAT', live);
    const arrival = await generateReferenceAccuratePdf(
      'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
      live,
    );
    const hblText = await textOf(new Uint8Array(await hbl.blob.arrayBuffer()));
    const quoteText = await textOf(new Uint8Array(await quote.blob.arrayBuffer()));
    const arrivalText = await textOf(new Uint8Array(await arrival.blob.arrayBuffer()));
    expect(hblText.startsWith('595.0x842.0')).toBe(true);
    expect(hblText).toContain('BILL OF LADING');
    expect(hblText).toContain('HBL-100');
    expect(hblText).toContain('appearent good order');
    expect(hblText).toContain('quantity, condition,');
    expect(hblText).toContain('delivery order.');
    expect(quoteText).toContain('FCL QUOTATION');
    expect(quoteText).toContain('Q-100');
    expect(arrivalText).toContain('ARRIVAL NOTICE');
    expect(arrivalText).toContain('MAWB-100');
    expect(hblText + quoteText + arrivalText).not.toMatch(/fresa/i);
  });

  it('routes catalogue generate for the invoice code to the independent template', async () => {
    const generated = await generateCatalogLayoutPdf(
      'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
      live,
      { purpose: 'generate', workflow: 'freightnest_generate' },
    );
    expect(generated).toBeTruthy();
    const text = await textOf(new Uint8Array(await generated!.blob.arrayBuffer()));
    expect(text).toContain('ACME EXPORTERS');
    expect(text).not.toContain('MAAINV1900717');
  });

  it('builds the activity workbook with the reference header order and caller rows only', () => {
    const { bytes } = generateActivityCompletedJobsWorkbook([
      { jobNumber: 'JOB-260014', department: 'AIR', por: 'MAA', pod: 'DXB' },
    ]);
    const xml = new TextDecoder().decode(bytes);
    expect(ACTIVITY_COMPLETED_JOBS_HEADERS.join(',')).toBe(
      'Job No.,Department,POR,POD,No Of Pcs,G.Weight,Volume',
    );
    expect(xml).toContain('Job No.');
    expect(xml).toContain('JOB-260014');
    expect(xml).toContain('Activity Completed Jobs List_LI');
    expect(xml).toContain('autoFilter');
    expect(xml).toContain('state="frozen"');
    expect(xml).toContain('orientation="landscape"');
    expect(xml).not.toContain('CAE180038');
    expect(xml).not.toMatch(/fresa/i);
  });
});
