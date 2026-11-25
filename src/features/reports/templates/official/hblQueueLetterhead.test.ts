import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { getReportBrandingSlots } from './brandingSlots';

const QUEUE = [
  'FG_HBL_MAGICLOGISYS',
  'FG_HBL_FORMAT_14',
  'FG_HBL_FORMAT_16',
  'FG_HBL_FORMAT_20',
  'FG_HBL_ORIGINAL_FORMAT_87',
] as const;

describe('HBL queue letterhead (no shipper-column chrome)', () => {
  it(
    'keeps org logo/company out of the left shipper band',
    async () => {
    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    mkdirSync('tools/tmp-hbl-queue', { recursive: true });

    for (const code of QUEUE) {
      const slots = getReportBrandingSlots(code);
      expect(slots, code).toBeTruthy();
      const pageH = 842;
      if (slots!.logo) {
        const inShipperBand =
          slots!.logo.x < 220 && slots!.logo.y + slots!.logo.height > pageH * 0.9;
        expect(inShipperBand, `${code} logo in shipper`).toBe(false);
      }
      if (slots!.company) {
        const inShipperBand =
          slots!.company.x < 200 && slots!.company.y > pageH * 0.88;
        expect(inShipperBand, `${code} company in shipper`).toBe(false);
      }

      const result = await generateOfficialMeasuredPdf(code, {
        companyName: 'Zoyan Logistics',
        companyAddress: 'Dubai, UAE',
        companyEmail: 'ops@zoyan.example',
        logoUrl,
        printedBy: 'ops@zoyan.example',
      });
      // Pre-printed originals (e.g. FORMAT_87) are sparse — still a real PDF.
      expect(result.blob.size, code).toBeGreaterThan(2000);
      writeFileSync(
        `tools/tmp-hbl-queue/${code}.pdf`,
        Buffer.from(await result.blob.arrayBuffer()),
      );
    }
  },
    120_000,
  );
});
