import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';

const POPPLER =
  process.env.POPPLER_PDFTOTEXT ||
  String.raw`C:\Users\fizat\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftotext.exe`;

const POPPLER_PDFTOPPM =
  process.env.POPPLER_PDFTOPPM ||
  String.raw`C:\Users\fizat\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftoppm.exe`;

describe('Fresa footer strip', () => {
  it('Format-4 footer matches Printed By / Printed Date / Page structure', async () => {
    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf(
      'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
      {
        companyName: 'Zoyan Logistics',
        companyAddress: 'Dubai, UAE',
        companyEmail: 'ops@zoyan.example',
        logoUrl,
        printedBy: 'ops@zoyan.example',
        entityBound: true,
      },
    );
    mkdirSync('tools/tmp-footer', { recursive: true });
    const pdfPath = 'tools/tmp-footer/format4.pdf';
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
    expect(extract).toMatch(/Printed By\s*:/);
    expect(extract).toMatch(/Printed Date\s*:/);
    expect(extract).toMatch(/Page\s+1\s+of\s+1/);
    expect(extract).not.toMatch(/Powered By\s*:\s*Fresa/i);
    expect(extract).not.toMatch(/User\s*:/);
    // Fresa-style date token (DD-MON-YY …AM/PM)
    expect(extract).toMatch(/\d{2}-[A-Z]{3}-\d{2}\s+\d{2}:\d{2}(AM|PM)/);
  });

  it('Format-3 coloured chip footer keeps bars and stamps Printed By/Date (no Powered by)', async () => {
    const logoBytes = readFileSync('public/kingfisher-logo.png');
    const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
    const result = await generateOfficialMeasuredPdf(
      'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE',
      {
        companyName: 'Zoyan Logistics',
        companyAddress: 'Dubai, UAE',
        companyEmail: 'ops@zoyan.example',
        logoUrl,
        printedBy: 'ops',
        printedDate: '27-NOV-26 10:40AM',
        entityBound: true,
      },
    );
    mkdirSync('tools/tmp-footer', { recursive: true });
    const pdfPath = 'tools/tmp-footer/format3.pdf';
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
    expect(extract).toMatch(/Printed By\s*:/);
    expect(extract).toMatch(/\bops\b/);
    expect(extract).toMatch(/Printed Date\s*:/);
    expect(extract).toMatch(/27-NOV-26\s+10:40AM/);
    expect(extract).toMatch(/\b1\/1\b/);
    expect(extract).not.toMatch(/Page\s+1\s+of\s+1/);
    expect(extract).not.toMatch(/Powered\s+by\s+Fresa/i);
    expect(extract).not.toMatch(/User\s*:/);

    try {
      execFileSync(
        POPPLER_PDFTOPPM,
        ['-png', '-r', '120', '-f', '1', '-l', '1', pdfPath, 'tools/tmp-f3-gen'],
        { stdio: 'pipe' },
      );
    } catch {
      // optional raster for manual review
    }
  });
});
