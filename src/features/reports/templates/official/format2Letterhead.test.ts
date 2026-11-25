import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { getReportBrandingSlots } from './brandingSlots';

describe('Format-2 Tax Invoice India letterhead/footer', () => {
  it('keeps rotated letterhead chrome in the header strip and writes a clean footer', async () => {
    const slots = getReportBrandingSlots('INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA');
    expect(slots?.headerBand).toBeTruthy();
    expect(slots?.company?.x).toBeLessThan(
      (slots!.headerBand!.x || 0) + (slots!.headerBand!.width || 0) + 8,
    );

    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf(
      'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
      {
        companyName: 'Zoyan Logistics',
        companyAddress: 'Dubai, UAE',
        companyPhone: '+971 50 000 0000',
        companyEmail: 'ops@zoyan.example',
        companyWeb: 'www.example.com',
        logoUrl,
        printedBy: 'olivia.t@example.com',
        invoiceNumber: 'MAAINV1900717',
      },
    );
    expect(result.blob.size).toBeGreaterThan(8000);
    mkdirSync('tools/tmp-f2-out', { recursive: true });
    writeFileSync('tools/tmp-f2-out/format2.pdf', Buffer.from(await result.blob.arrayBuffer()));
  });
});
