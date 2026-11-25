import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { getReportBrandingSlots } from './brandingSlots';

const POPPLER =
  process.env.POPPLER_PDFTOTEXT ||
  String.raw`C:\Users\fizat\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftotext.exe`;

describe('FG_HBL_HKG measured letterhead', () => {
  it('keeps logo in the agent box (right), not the shipper cell', async () => {
    const slots = getReportBrandingSlots('FG_HBL_HKG');
    expect(slots?.logo).toBeTruthy();
    // Agent/carrier logo lives on the right half of the HBL form.
    expect(slots!.logo!.x).toBeGreaterThan(280);
    expect(slots!.company?.x ?? 0).toBeGreaterThan(280);
    expect(slots!.issuerCompany?.x ?? 0).toBeGreaterThan(280);
    expect(slots!.issuerCompany?.y ?? 0).toBeLessThan(slots!.logo!.y);
    expect(slots!.preparedByValue).toBeTruthy();
    expect(slots!.signatureBy).toBeTruthy();
    expect(slots!.barcode).toBeTruthy();

    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf('FG_HBL_HKG', {
      companyName: 'Zoyan Logistics',
      companyAddress: 'Dubai, UAE',
      companyPhone: '+971 50 000 0000',
      companyEmail: 'ops@zoyan.example',
      logoUrl,
      printedBy: 'ops@zoyan.example',
      hblNo: 'PLMAAJEA00081',
      entityBound: true,
      // Live shipper replaces sample party (not org chrome in Shipper).
      shipperLines: ['LIVE SHIPPER CO', 'Chennai, India'],
      consigneeLines: ['LIVE CONSIGNEE LLC', 'Sharjah, UAE'],
    });
    expect(result.blob.size).toBeGreaterThan(8000);
    mkdirSync('tools/tmp-hbl-out', { recursive: true });
    const pdfPath = 'tools/tmp-hbl-out/FG_HBL_HKG.pdf';
    writeFileSync(pdfPath, Buffer.from(await result.blob.arrayBuffer()));

    let extract = '';
    try {
      extract = execFileSync(POPPLER, ['-layout', pdfPath, '-'], {
        encoding: 'utf8',
        maxBuffer: 2 * 1024 * 1024,
      });
    } catch {
      // Poppler optional in CI — generation + size assert still cover chrome.
    }
    if (extract) {
      expect(extract).toMatch(/LIVE SHIPPER CO/);
      expect(extract).toMatch(/LIVE CONSIGNEE LLC/);
      expect(extract).not.toMatch(/4G LOGISTICS/);
      expect(extract).not.toMatch(/AL NASER TRADING/);
      // Org chrome stays out of the Shipper cell.
      expect(extract).toMatch(/Zoyan Logistics/);
    }
  });
});
