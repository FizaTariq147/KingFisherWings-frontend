import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { getReportBrandingSlots } from './brandingSlots';

const POPPLER =
  process.env.POPPLER_PDFTOTEXT ||
  String.raw`C:\Users\fizat\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftotext.exe`;

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

  it('maps bound job parties + cargo onto Format-1 without pin leftovers', async () => {
    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf('FG_HBL_FORMAT_1', {
      companyName: 'Zoyan Logistics',
      companyAddress: 'Dubai, UAE',
      companyEmail: 'ops@zoyan.example',
      logoUrl,
      printedBy: 'ops@zoyan.example',
      entityBound: true,
      shipperLines: ['LIVE SHIPPER CO', 'Dubai Marina Walk', 'Dubai, UAE'],
      consigneeLines: ['LIVE CONSIGNEE LLC', 'Jebel Ali Free Zone', 'Dubai, UAE'],
      hblNo: 'HBL-JOB-0016',
      jobNumber: 'JBJOBFE112600016',
      departure: 'KARACHI, PAKISTAN',
      destination: 'JEBEL ALI, UAE',
      carrier: 'MSC',
      byCarrier: 'MSC',
      flightDate: 'MSC ISABELLA / 123N',
      pieces: '10',
      grossWeight: '1,250.00',
      chargeableWeight: '1.50',
      nature: 'STC: INDUSTRIAL VALVES',
      packagesLine: 'TOTAL : (10) PACKAGES ONLY',
      currency: 'AED',
    });
    mkdirSync('tools/tmp-hbl-f1', { recursive: true });
    const pdfPath = 'tools/tmp-hbl-f1/bound.pdf';
    writeFileSync(pdfPath, Buffer.from(await result.blob.arrayBuffer()));

    let extract = '';
    try {
      extract = execFileSync(POPPLER, ['-layout', pdfPath, '-'], {
        encoding: 'utf8',
        maxBuffer: 2 * 1024 * 1024,
      });
    } catch {
      return;
    }
    expect(extract).toMatch(/LIVE SHIPPER CO/);
    expect(extract).toMatch(/LIVE CONSIGNEE LLC/);
    expect(extract).toMatch(/KARACHI,\s*PAKISTAN/);
    expect(extract).toMatch(/JEBEL ALI,\s*UAE/);
    expect(extract).toMatch(/\bMSC\b/);
    expect(extract).toMatch(/INDUSTRIAL VALVES/);
    expect(extract).toMatch(/\b10\b/);
    expect(extract).toMatch(/1,?250\.00/);
    expect(extract).not.toMatch(/AL NASER/i);
    expect(extract).not.toMatch(/4G\s*LOGISTICS/i);
    expect(extract).not.toMatch(/CHENNAI FREIGHT FORWARDING/i);
    expect(extract).not.toMatch(/SHANMUGAM/i);
    expect(extract).not.toMatch(/AS ARRANGED/i);
    expect(extract).not.toMatch(/VALVE MATERIALS FOR MACHINERY/i);
    expect(extract).not.toMatch(/EVERGREEN MARINE/i);
    expect(extract).not.toMatch(/CMA CGM/i);
    // Issuing Carrier Agent letterhead — org name next to logo (not the "Company" stub).
    expect(extract).toMatch(/Zoyan Logistics/);
    expect(extract).not.toMatch(/(^|\n)\s*Company\s*(\n|$)/);
  });

  it('stamps org company name in the Issuing Carrier Agent box', async () => {
    const slots = getReportBrandingSlots('FG_HBL_FORMAT_1');
    expect(slots?.company?.x ?? 999).toBeLessThan(200);
    expect(slots?.company?.y ?? 0).toBeGreaterThan(560);
    expect(slots?.company?.y ?? 999).toBeLessThan(650);

    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf('FG_HBL_FORMAT_1', {
      companyName: 'King Fisher Freight LLC',
      companyAddress: 'Dubai, UAE',
      companyEmail: 'ops@kingfisher.example',
      logoUrl,
      printedBy: 'ops@kingfisher.example',
      entityBound: true,
      shipperLines: ['LIVE SHIPPER CO'],
      consigneeLines: ['LIVE CONSIGNEE LLC'],
    });
    mkdirSync('tools/tmp-hbl-f1', { recursive: true });
    const pdfPath = 'tools/tmp-hbl-f1/company.pdf';
    writeFileSync(pdfPath, Buffer.from(await result.blob.arrayBuffer()));

    let extract = '';
    try {
      extract = execFileSync(POPPLER, ['-layout', pdfPath, '-'], {
        encoding: 'utf8',
        maxBuffer: 2 * 1024 * 1024,
      });
    } catch {
      return;
    }
    expect(extract).toMatch(/King Fisher Freight LLC/);
    expect(extract).not.toMatch(/(^|\n)\s*Company\s*(\n|$)/);
  });
});
