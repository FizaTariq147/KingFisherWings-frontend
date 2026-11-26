import { describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { generateHawbOfficialPdf } from './generateHawbOfficialPdf';

const liveJob = {
  entityBound: true,
  companyName: 'Zoyan Logistics',
  companyPhone: '+971541266616',
  carrier: 'EMIRATES',
  mawbNo: '176-99998888',
  hawbNo: 'JBJOBAE112600024',
  shipperLines: [
    'Hassan Ahmed',
    'house no p33, street 06, Peoples colony no 2, faisalabad, Pakistan',
    'Faisalabad, AE',
    '+97134878928',
  ],
  consigneeLines: ['Hafsa Anwaar', 'Faisalabad, PK'],
  pieces: '10',
  grossWeight: '100',
  measurement: '100',
  commodity: 'General merchandise',
  pol: 'AEAUH',
  pod: 'AUABP',
  currencyCode: 'AED',
  declaredCarriage: 'N.V.D.',
  insurance: 'NIL',
} as const;

describe('HAWB Draft dense chrome (no leftover Fresa AWB strip)', () => {
  it(
    'skips pin 176|MAA| strip and stamps org agent + live top AWB',
    { timeout: 45000 },
    async () => {
      const { blob } = await generateHawbOfficialPdf(
        'HAWB_DRAFT_REPORT_FORMAT',
        { ...liveJob },
        { appendCustomerTerms: false },
      );

      const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      expect(doc.numPages).toBe(1);
      const page = await doc.getPage(1);
      const content = await page.getTextContent();
      const text = content.items.map((i) => ('str' in i ? i.str : '')).join(' ');
      expect(text).not.toMatch(/176\|MAA\|23456882/);
      expect(text).toMatch(/176\|/);
      expect(text).toMatch(/99998888|176-99998888/);
      expect(text).toMatch(/Zoyan Logistics/);
      expect(text).toMatch(/EMIRATES/);
      expect(text).toMatch(/\bK\b/);
      expect(text.toLowerCase()).not.toContain('fresa');
      await doc.destroy();
    },
  );

  it(
    'Draft-2 stamps org agent + HAWB ref and drops MAA/DXB demo strip',
    { timeout: 45000 },
    async () => {
      const { blob } = await generateHawbOfficialPdf(
        'HAWB_DRAFT_REPORT_FORMAT_2',
        { ...liveJob },
        { appendCustomerTerms: false },
      );
      const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      const page = await doc.getPage(1);
      const content = await page.getTextContent();
      const text = content.items.map((i) => ('str' in i ? i.str : '')).join(' ');
      expect(text).not.toMatch(/MAA\/DXB\/1900014/);
      expect(text).not.toMatch(/176\|MAA\|23456882/);
      expect(text).toMatch(/JBJOBAE112600024/);
      expect(text).toMatch(/Zoyan Logistics/);
      expect(text).toMatch(/\bK\b/);
      expect(text.toLowerCase()).not.toContain('fresa');
      await doc.destroy();
    },
  );
});
