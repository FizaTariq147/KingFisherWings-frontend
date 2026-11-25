import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { PAGE_HAWB_NEAR_A4 } from '@/features/reports/engines/pdf/pageGeometry';
import { buildHawbDraft2Html } from './hawbDraft2Html';
import {
  HTML_CSS_PILOT_CODES,
  isHtmlCssPilotCode,
  isPlaywrightHtmlCode,
  PLAYWRIGHT_HTML_ALLOWLIST,
  PLAYWRIGHT_HTML_PILOT_CODE,
} from './playwrightHtmlCodes';
import { buildHblJasperHtmlPilot } from '@/features/reports/htmlPilots/HBL_DRAFT_REPORT_FORMAT_JASPER/buildHtml';
import { buildInvoiceIndiaHtmlPilot } from '@/features/reports/htmlPilots/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA/buildHtml';
import { buildJobListSummaryHtmlPilot } from '@/features/reports/htmlPilots/JOB_LIST_SUMMARY_REPORT_FORMAT/buildHtml';

export {
  HTML_CSS_PILOT_CODES,
  isHtmlCssPilotCode,
  isPlaywrightHtmlCode,
  PLAYWRIGHT_HTML_ALLOWLIST,
  PLAYWRIGHT_HTML_PILOT_CODE,
};

export type HtmlPilotTemplate = {
  code: string;
  buildHtml: (data: InvoiceFormatPdfData) => string;
  widthMm: number;
  heightMm: number;
};

export function resolveHtmlPilotTemplate(code: string): HtmlPilotTemplate | null {
  const key = String(code || '').trim().toUpperCase();
  switch (key) {
    case PLAYWRIGHT_HTML_PILOT_CODE:
      return {
        code: key,
        buildHtml: buildHawbDraft2Html,
        widthMm: PAGE_HAWB_NEAR_A4.widthMm,
        heightMm: PAGE_HAWB_NEAR_A4.heightMm,
      };
    case 'HBL_DRAFT_REPORT_FORMAT_JASPER':
      return {
        code: key,
        buildHtml: buildHblJasperHtmlPilot,
        widthMm: 210,
        heightMm: 297,
      };
    case 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA':
      return {
        code: key,
        buildHtml: buildInvoiceIndiaHtmlPilot,
        widthMm: 210,
        heightMm: 297,
      };
    case 'JOB_LIST_SUMMARY_REPORT_FORMAT':
      return {
        code: key,
        buildHtml: buildJobListSummaryHtmlPilot,
        widthMm: 297,
        heightMm: 210,
      };
    default:
      return null;
  }
}
