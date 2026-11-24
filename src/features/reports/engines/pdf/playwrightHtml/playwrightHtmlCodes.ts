/**
 * Codes the Node Playwright HTML renderer may print.
 * HAWB Draft 2 is the original pilot; the three HTML_CSS_PILOT_CODES are Hybrid Option C.
 */
export const HTML_CSS_PILOT_CODES = [
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'JOB_LIST_SUMMARY_REPORT_FORMAT',
] as const;

export type HtmlCssPilotCode = (typeof HTML_CSS_PILOT_CODES)[number];

export const PLAYWRIGHT_HTML_ALLOWLIST = [
  'HAWB_DRAFT_REPORT_FORMAT_2',
  ...HTML_CSS_PILOT_CODES,
] as const;

export const PLAYWRIGHT_HTML_PILOT_CODE = 'HAWB_DRAFT_REPORT_FORMAT_2' as const;

export function isHtmlCssPilotCode(code: string): boolean {
  const key = String(code || '').trim().toUpperCase();
  return (HTML_CSS_PILOT_CODES as readonly string[]).includes(key);
}

export function isPlaywrightHtmlCode(code: string): boolean {
  const key = String(code || '').trim().toUpperCase();
  return (PLAYWRIGHT_HTML_ALLOWLIST as readonly string[]).includes(key);
}
