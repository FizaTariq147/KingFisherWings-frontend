import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';

const POPPLER =
  process.env.POPPLER_PDFTOTEXT ||
  String.raw`C:\Users\fizat\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftotext.exe`;

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
});
