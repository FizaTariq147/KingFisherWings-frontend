import { afterAll, describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument } from 'pdf-lib';
import { OFFICIAL_HAWB_FORMAT_CODES } from '@/features/reports/utils/officialFormatGovernance';
import {
  PILOT_HAWB_DRAFT2_FIXTURE,
  PLAYWRIGHT_HTML_PILOT_CODE,
  buildHawbDraft2Html,
} from './hawbDraft2Html';
import { closePlaywrightHtmlBrowser, renderPlaywrightHtmlPdf } from './renderPlaywrightHtmlPdf';

afterAll(async () => {
  await closePlaywrightHtmlBrowser();
});

describe('playwright html HAWB Draft-2', () => {
  it('keeps five official HAWB codes and only prints Draft-2', () => {
    expect(OFFICIAL_HAWB_FORMAT_CODES).toHaveLength(5);
    expect(PLAYWRIGHT_HTML_PILOT_CODE).toBe('HAWB_DRAFT_REPORT_FORMAT_2');
  });

  it('rejects other codes and caller HTML', async () => {
    expect(() => buildHawbDraft2Html({ companyName: 'KingFisher Wings Logistics' })).not.toThrow();
    await expect(
      renderPlaywrightHtmlPdf({ code: 'HAWB_DRAFT_REPORT_FORMAT', data: PILOT_HAWB_DRAFT2_FIXTURE }),
    ).rejects.toThrow(/allowlist/);
    await expect(
      renderPlaywrightHtmlPdf({
        code: PLAYWRIGHT_HTML_PILOT_CODE,
        data: PILOT_HAWB_DRAFT2_FIXTURE,
        html: '<p>injected</p>',
      }),
    ).rejects.toThrow(/HTML/);
  });

  it('renders the existing Draft-2 face with org branding and no orange ribbon', () => {
    const html = buildHawbDraft2Html(PILOT_HAWB_DRAFT2_FIXTURE);
    expect(html).toContain('Air Waybill');
    expect(html).toContain('KingFisher Wings Logistics');
    expect(html).toContain('Prepaid');
    expect(html).toContain('Collect');
    expect(html).toContain('ACME EXPORTERS');
    expect(html).not.toContain('#F6A21B');
    expect(html.toLowerCase()).not.toContain('fresa');
    expect(html).toContain('size: 595pt 845pt');
    expect(html).toContain('margin: 0');
  });

  it('refuses a Fresa logo and a remote logo that was not inlined', () => {
    expect(() =>
      buildHawbDraft2Html({
        ...PILOT_HAWB_DRAFT2_FIXTURE,
        logoUrl: 'https://fresatechnologies.com/logo.png',
      }),
    ).toThrow(/Fresa|inlined/i);
    expect(() =>
      buildHawbDraft2Html({
        ...PILOT_HAWB_DRAFT2_FIXTURE,
        logoUrl: 'https://cdn.example.com/logo.png',
      }),
    ).toThrow(/inlined/i);
  });

  it('prints one 595×845 pt page with selectable text', async () => {
    const pdf = await renderPlaywrightHtmlPdf({
      code: PLAYWRIGHT_HTML_PILOT_CODE,
      data: PILOT_HAWB_DRAFT2_FIXTURE,
    });
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBe(1);
    const { width, height } = doc.getPage(0).getSize();
    expect(Math.abs(width - 595)).toBeLessThanOrEqual(2);
    expect(Math.abs(height - 845)).toBeLessThanOrEqual(2);

    const parsed = await getDocument({ data: new Uint8Array(pdf) }).promise;
    expect(parsed.numPages).toBe(1);
    const page = await parsed.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    expect(text).toContain('KingFisher Wings Logistics');
    expect(text).toContain('Air Waybill');
    expect(text.toLowerCase()).toContain('prepaid');
    expect(text.toLowerCase()).toContain('collect');
    expect(text).toContain('ACME EXPORTERS');
    expect(text.toLowerCase()).not.toContain('fresa');
    const view = page.getViewport({ scale: 1 });
    for (const item of content.items) {
      if (!('transform' in item) || !item.str?.trim()) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      expect(x).toBeGreaterThanOrEqual(-4);
      expect(y).toBeGreaterThanOrEqual(-4);
      expect(x).toBeLessThanOrEqual(view.width + 4);
      expect(y).toBeLessThanOrEqual(view.height + 4);
    }
    await parsed.destroy();
  }, 60_000);
});
