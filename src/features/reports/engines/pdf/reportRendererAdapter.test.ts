import { describe, expect, it } from 'vitest';
import {
  HTML_CSS_PILOT_CODES,
  isHtmlCssPilotCode,
  isPlaywrightHtmlCode,
  PLAYWRIGHT_HTML_ALLOWLIST,
} from './playwrightHtml/playwrightHtmlCodes';
import { resolveHtmlPilotTemplate } from './playwrightHtml/htmlPilotRegistry';
import { getReportEnrichment } from '@/features/reports/registry';

describe('HTML/CSS pilot adapter registry', () => {
  it('allowlists exactly three Hybrid Option C codes plus HAWB Draft 2', () => {
    expect(HTML_CSS_PILOT_CODES).toEqual([
      'HBL_DRAFT_REPORT_FORMAT_JASPER',
      'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
      'JOB_LIST_SUMMARY_REPORT_FORMAT',
    ]);
    expect(PLAYWRIGHT_HTML_ALLOWLIST).toContain('HAWB_DRAFT_REPORT_FORMAT_2');
    expect(PLAYWRIGHT_HTML_ALLOWLIST).toHaveLength(4);
  });

  it('resolves a template for each pilot and refuses unknown codes', () => {
    for (const code of HTML_CSS_PILOT_CODES) {
      expect(isHtmlCssPilotCode(code)).toBe(true);
      expect(isPlaywrightHtmlCode(code)).toBe(true);
      const template = resolveHtmlPilotTemplate(code);
      expect(template?.code).toBe(code);
      expect(typeof template?.buildHtml).toBe('function');
      expect(template!.widthMm).toBeGreaterThan(0);
      expect(template!.heightMm).toBeGreaterThan(0);
    }
    expect(isHtmlCssPilotCode('INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE')).toBe(false);
    expect(resolveHtmlPilotTemplate('INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE')).toBeNull();
  });

  it('marks enrichment renderer playwright_html for pilots only', () => {
    for (const code of HTML_CSS_PILOT_CODES) {
      expect(getReportEnrichment(code)?.renderer).toBe('playwright_html');
    }
    expect(getReportEnrichment('HAWB_DRAFT_REPORT_FORMAT_2')?.renderer).toBe('playwright_html');
    expect(getReportEnrichment('INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE')?.renderer).toBeUndefined();
  });
});
