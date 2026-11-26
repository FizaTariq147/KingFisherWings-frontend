import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { generateHawbOfficialPdf } from './generateHawbOfficialPdf';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../qa/phase2-hawb-fixtures/measured',
);

describe('HAWB Draft-1 vector Generate (replaces html2canvas raster)', () => {
  it(
    'produces vector text at Fresa MediaBox with org chrome and no Fresa identity',
    { timeout: 45000 },
    async () => {
      const { blob, layout } = await generateHawbOfficialPdf(
        'HAWB_DRAFT_REPORT_FORMAT_1',
        {
          entityBound: false,
          companyName: 'Zippo Logistics',
          companyAddress: 'Dubai Airport Free Zone',
          companyPhone: '+971-4-000-0000',
        },
        { appendCustomerTerms: false },
      );

      mkdirSync(OUT, { recursive: true });
      writeFileSync(join(OUT, 'draft1-vector-generate.pdf'), Buffer.from(await blob.arrayBuffer()));

      const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      // 9 identical copy faces (T&C disabled for this harness).
      expect(doc.numPages).toBe(9);
      const page = await doc.getPage(1);
      const vp = page.getViewport({ scale: 1 });
      expect(Math.round(vp.width)).toBe(595);
      expect(Math.round(vp.height)).toBe(842);
      expect(layout.variant).toBe('draft1');

      const content = await page.getTextContent();
      expect(content.items.length).toBeGreaterThan(40);
      const text = content.items.map((i) => ('str' in i ? i.str : '')).join(' ');
      expect(text.toLowerCase()).not.toContain('fresa');
      expect(text).toMatch(/HOUSE AIR WAYBILL/i);
      expect(text).toMatch(/MAWB NO\./i);
      expect(text).toMatch(/HAWB NO\./i);
      expect(text).toMatch(/Zippo Logistics/i);
      expect(text).toMatch(/Notify Party/i);
      expect(text).toMatch(/Dimensions or Volume/i);
      expect(text).toMatch(/AS ARRANGED|GLOBAL EXPORT|STC:/i);

      // Pin micro-labels must stay at Fresa sizes (4–5pt), not clamped to 6.
      const items = content.items
        .filter((i) => 'str' in i && String(i.str).includes('It is agreed'))
        .map((i) => {
          const t = (i as { transform: number[] }).transform;
          return Math.hypot(t[0], t[1]);
        });
      expect(items[0] ?? 0).toBeLessThan(5.5);
      await doc.destroy();
    },
  );
});
