import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { getReportBrandingSlots } from './brandingSlots';

describe('Format-4 measured letterhead', () => {
  it('keeps logo inside letterhead band under the outer frame', async () => {
    const slots = getReportBrandingSlots('INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE');
    expect(slots?.headerBand).toBeTruthy();
    expect(slots?.logo).toBeTruthy();
    const bandTop = slots!.headerBand!.y + slots!.headerBand!.height;
    expect(slots!.logo!.y + slots!.logo!.height).toBeLessThanOrEqual(bandTop - 6);
    expect(slots!.company!.y + (slots!.company!.size || 12)).toBeLessThanOrEqual(bandTop - 2);

    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf(
      'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
      {
        companyName: 'Zoyan Logistics',
        companyAddress: 'Dubai, UAE',
        companyWeb: 'www.example.com',
        invoiceNumber: 'INV1800584',
        logoUrl,
        shipperLines: ['TRANS WORLD SHIPPING AND CO'],
      },
    );
    expect(result.blob.size).toBeGreaterThan(8000);
    mkdirSync('tools/tmp-f4-out', { recursive: true });
    writeFileSync('tools/tmp-f4-out/format4.pdf', Buffer.from(await result.blob.arrayBuffer()));
  });
});
