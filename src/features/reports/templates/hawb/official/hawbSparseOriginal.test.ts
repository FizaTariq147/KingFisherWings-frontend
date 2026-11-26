import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { generateHawbSparsePdf, isHawbSparseNativeCode } from './generateHawbSparsePdf';
import { getHawbOfficialLayout } from './layouts';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../qa/phase2-hawb-fixtures/sparse',
);

describe('HAWB Original sparse vector PDF (Fresa pre-printed match)', () => {
  it('recognizes Original-1/2 sparse codes only', () => {
    expect(isHawbSparseNativeCode('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')).toBe(true);
    expect(isHawbSparseNativeCode('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2')).toBe(true);
    expect(isHawbSparseNativeCode('HAWB_DRAFT_REPORT_FORMAT')).toBe(false);
  });

  it.each([
    'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
    'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
  ] as const)(
    '%s sparse PDF matches MediaBox and stamps org cargo without Fresa / Draft grid',
    { timeout: 30000 },
    async (code) => {
      const layout = getHawbOfficialLayout(code)!;
      const { blob } = await generateHawbSparsePdf(
        code,
        {
          entityBound: false,
          companyName: 'Zoyan Logistics',
          companyAddress: 'Dubai Airport Free Zone',
          companyPhone: '+971-4-000-0000',
        },
        { appendCustomerTerms: false },
      );

      mkdirSync(OUT, { recursive: true });
      writeFileSync(
        join(OUT, `${layout.variant}-sparse.pdf`),
        Buffer.from(await blob.arrayBuffer()),
      );

      const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      expect(doc.numPages).toBe(1);
      const page = await doc.getPage(1);
      const vp = page.getViewport({ scale: 1 });
      expect(Math.round(vp.width)).toBe(Math.round(layout.page.widthPt));
      expect(Math.round(vp.height)).toBe(Math.round(layout.page.heightPt));

      const content = await page.getTextContent();
      const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
      expect(text.toLowerCase()).not.toContain('fresa');
      expect(text).toMatch(/Zoyan|GLOBAL EXPORT|MAA\/DXB|PAPER CUPS|100/i);
      // Must NOT be the dense Draft face (no HOUSE AIR WAYBILL title block).
      expect(text).not.toMatch(/HOUSE AIR WAYBILL/i);
      expect(text).not.toMatch(/Non Negotiable/i);
      await doc.destroy();
    },
  );
});
