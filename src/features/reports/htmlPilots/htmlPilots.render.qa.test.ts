import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { closePlaywrightHtmlBrowser, renderPlaywrightHtmlPdf } from '../engines/pdf/playwrightHtml/renderPlaywrightHtmlPdf';
import { HTML_CSS_PILOT_CODES } from '../engines/pdf/playwrightHtml/playwrightHtmlCodes';

const outRoot = path.resolve(process.cwd(), 'reports/html-pilots');

const FIXTURE = {
  entityBound: true,
  companyName: 'KingFisher Wings Logistics',
  companyAddress: 'Dubai, UAE',
  companyPhone: '+971-4-000-0000',
  companyEmail: 'ops@kingfisher.example',
  shipperLines: ['ACME EXPORTERS', 'CHENNAI, INDIA'],
  consigneeLines: ['BETA IMPORTS LLC', 'SHARJAH, UAE'],
  notifyLines: [] as string[],
  invoiceNumber: 'INV/26/QA-001',
  invoiceDate: '2026-02-18',
  jobNumber: 'JOB-QA-001',
  hblNo: 'HBL-QA-001',
  pol: 'INMAA',
  pod: 'AEDXB',
  currencyCode: 'AED',
  lines: [{ description: 'Ocean freight', qty: '1', rate: '1000.00', amount: '1000.00' }],
  subtotal: '1000.00',
  tax: '',
  total: '1000.00',
  tableHeaders: ['Job', 'Customer', 'POL', 'POD', 'ETD', 'Status'],
  tableRows: [
    ['JOB-QA-001', 'Acme', 'INMAA', 'AEDXB', '2026-02-20', 'Open'],
    ['JOB-QA-002', 'Beta', 'INMAA', 'AESHJ', '', ''],
  ],
};

afterAll(async () => {
  await closePlaywrightHtmlBrowser();
});

describe('HTML pilot Playwright render (QA evidence)', () => {
  it(
    'writes generated.pdf for each Hybrid Option C pilot',
    async () => {
      fs.mkdirSync(outRoot, { recursive: true });
      for (const code of HTML_CSS_PILOT_CODES) {
        const dir = path.join(outRoot, code);
        fs.mkdirSync(dir, { recursive: true });
        const pdf = await renderPlaywrightHtmlPdf({ code, data: FIXTURE });
        expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
        const out = path.join(dir, 'generated.pdf');
        fs.writeFileSync(out, pdf);
        const doc = await PDFDocument.load(pdf);
        expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
        fs.writeFileSync(
          path.join(dir, 'fixture.json'),
          `${JSON.stringify({ code, ...FIXTURE }, null, 2)}\n`,
        );
      }
    },
    120_000,
  );
});
