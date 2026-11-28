import { describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { generateOfficialMeasuredPdf } from '../../templates/official/generateOfficialMeasuredPdf';
import { generateHawbOfficialPdf } from '../../templates/hawb/official/generateHawbOfficialPdf';
import { pilotHawbFixture, pilotInvoiceFaceData } from './pilotFixtures';

async function extractText(bytes: Uint8Array): Promise<string> {
  const doc = await getDocument({ data: bytes }).promise;
  let all = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    all +=
      content.items
        .filter((i): i is { str: string } => 'str' in i)
        .map((i) => i.str)
        .join(' ') + '\n';
  }
  await doc.destroy();
  return all;
}

describe('Phase 1.1 defect remediation', () => {
  it('does not leak AL NASER sample party on Formats 2/14/15/17 when entityBound', async () => {
    const codes = [
      'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
      'INVOICE_REPORT_FORMAT_14_INVOICE',
      'INVOICE_REPORT_FORMAT_15_INVOICE_FCY',
      'INVOICE_REPORT_FORMAT_17_INVOICE_JASPER',
    ] as const;
    for (const code of codes) {
      const { blob } = await generateOfficialMeasuredPdf(code, pilotInvoiceFaceData('base'));
      const text = await extractText(new Uint8Array(await blob.arrayBuffer()));
      expect(text, code).not.toMatch(/AL NASER TRADING COMPANY LLC/i);
      expect(text, code).toMatch(/LIVE (SHIPPER|CONSIGNEE|BILLTO)|Zoyan Logistics/i);
    }
  });

  it('renders Trading Division on Format 4/8 long_party letterhead (extractable)', async () => {
    for (const code of [
      'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
      'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC',
    ] as const) {
      const { blob } = await generateOfficialMeasuredPdf(code, pilotInvoiceFaceData('long_party'));
      const text = await extractText(new Uint8Array(await blob.arrayBuffer()));
      expect(text, code).toContain('Trading Division');
      expect(text, code).toContain('International Consolidated Freight Forwarding');
      expect(text, code).not.toMatch(/AL NASER TRADING COMPANY LLC/i);
    }
  });

  it('keeps short company names on official HAWB Draft without AL NASER leak', async () => {
    const { blob } = await generateHawbOfficialPdf(
      'HAWB_DRAFT_REPORT_FORMAT',
      pilotHawbFixture('base'),
      { appendCustomerTerms: false },
    );
    const text = await extractText(new Uint8Array(await blob.arrayBuffer()));
    expect(text).toContain('Zoyan Logistics');
    expect(text).not.toMatch(/AL NASER TRADING COMPANY LLC/i);
  });
});
