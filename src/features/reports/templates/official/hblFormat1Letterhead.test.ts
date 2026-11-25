import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { getReportBrandingSlots } from './brandingSlots';

describe('FG_HBL_FORMAT_1 House Air Waybill letterhead', () => {
  it('does not stamp org logo into the Shipper cell', async () => {
    const slots = getReportBrandingSlots('FG_HBL_FORMAT_1');
    expect(slots).toBeTruthy();
    // Shipper band is the top-left (~y>800, x<200). Chrome must not sit there.
    if (slots!.logo) {
      expect(slots!.logo.y + slots!.logo.height).toBeLessThan(780);
    }
    if (slots!.company) {
      expect(slots!.company.y).toBeLessThan(780);
    }

    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf('FG_HBL_FORMAT_1', {
      companyName: 'Zoyan Logistics',
      companyAddress: 'Dubai, UAE',
      companyEmail: 'ops@zoyan.example',
      logoUrl,
      printedBy: 'ops@zoyan.example',
    });
    expect(result.blob.size).toBeGreaterThan(5000);
    mkdirSync('tools/tmp-hbl-f1', { recursive: true });
    writeFileSync(
      'tools/tmp-hbl-f1/system.pdf',
      Buffer.from(await result.blob.arrayBuffer()),
    );
  });
});
