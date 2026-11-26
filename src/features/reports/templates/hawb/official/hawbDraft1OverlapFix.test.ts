import { describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { generateHawbOfficialPdf } from './generateHawbOfficialPdf';

describe('HAWB Draft-1 overlap fix', () => {
  it(
    'does not stack shipper/consignee phone+email on the same baseline',
    { timeout: 45000 },
    async () => {
      const { blob } = await generateHawbOfficialPdf(
        'HAWB_DRAFT_REPORT_FORMAT_1',
        {
          entityBound: true,
          companyName: 'Zoyan Logistics',
          companyPhone: '+971541266616',
          hawbNo: 'JBJOBAE112600024',
          jobNumber: 'JOB/AE/11/26/00024',
          shipperLines: [
            'Hassan Ahmed',
            'house no p33, street 06, Peoples colony no 2, faisalabad, Pakistan',
            'Faisalabad, AE',
            '+97134878928',
            'hafsaanwaar8@gmail.com',
          ],
          consigneeLines: [
            'Hafsa Anwaar',
            'house no p33, street 06, Peoples colony no 2, faisalabad, Pakistan',
            'Faisalabad, PK',
            '+923487892866',
            'hafsaanwaar8@gmail.com',
          ],
          pieces: '10',
          grossWeight: '100',
          measurement: '100',
          pol: 'AEAUH',
          pod: 'AUABP',
        },
        { appendCustomerTerms: false },
      );

      const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      const page = await doc.getPage(1);
      const content = await page.getTextContent();
      const items = content.items
        .filter((i) => 'str' in i && String(i.str).trim())
        .map((i) => {
          const t = (i as { transform: number[]; str: string }).transform;
          return { y: +t[5].toFixed(1), x: +t[4].toFixed(1), s: String((i as { str: string }).str) };
        });

      const byY = new Map<string, string[]>();
      for (const it of items) {
        if (it.x > 100) continue; // left party column only
        const key = String(it.y);
        const list = byY.get(key) || [];
        list.push(it.s);
        byY.set(key, list);
      }
      for (const [y, strs] of byY) {
        expect(strs.length, `stacked at y=${y}: ${strs.join(' | ')}`).toBeLessThanOrEqual(1);
      }

      const text = items.map((i) => i.s).join(' ');
      expect(text).not.toMatch(/JOB NO\.: JOB\/AE\/11\/26\/00024[\s\S]*JOB NO\.: JOB\/AE/);
      // Accounting band must not repeat the job number as freight text collision source.
      const accountingHits = items.filter((i) => i.y > 450 && i.y < 470 && /JOB NO/i.test(i.s));
      expect(accountingHits.length).toBe(0);
      await doc.destroy();
    },
  );
});
