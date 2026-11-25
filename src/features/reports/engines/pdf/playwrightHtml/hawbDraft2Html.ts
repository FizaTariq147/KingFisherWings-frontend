import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { isFresaIdentityText } from '@/features/reports/templates/official/officialBranding';
import { HawbDraft2Document } from '@/features/reports/templates/hawb/official/documents/HawbDraft2Document';
import { mapToHawbOfficialModel } from '@/features/reports/templates/hawb/official/mapToHawbOfficialModel';
import { PAGE_HAWB_NEAR_A4 } from '@/features/reports/engines/pdf/pageGeometry';
import {
  isPlaywrightHtmlCode,
  PLAYWRIGHT_HTML_ALLOWLIST,
  PLAYWRIGHT_HTML_PILOT_CODE,
} from './playwrightHtmlCodes';

export { PLAYWRIGHT_HTML_ALLOWLIST, PLAYWRIGHT_HTML_PILOT_CODE };

/**
 * Phase 2 bound HAWB fixture already used by official HAWB tests.
 * Not a new production record.
 */
export const PILOT_HAWB_DRAFT2_FIXTURE: InvoiceFormatPdfData = {
  entityBound: true,
  companyName: 'KingFisher Wings Logistics',
  companyAddress: 'Dubai, UAE',
  companyPhone: '+971-4-000-0000',
  logoUrl: '',
  shipperLines: ['ACME EXPORTERS', 'CHENNAI, INDIA'],
  consigneeLines: ['BETA IMPORTS LLC', 'SHARJAH, UAE'],
  notifyLines: ['NOTIFY PARTNER', 'DUBAI'],
  pol: 'CHENNAI (MAA)',
  pod: 'DUBAI INTERNATIONAL AIRPORT (DXB)',
  vesselFlight: 'EK9876 / 20-FEB-26',
  referenceNo: 'MAA/DXB/260014',
  jobNumber: 'JOB-260014',
  commodity: 'STC: PAPER CUPS',
  currencyCode: 'INR',
  invoiceDate: '18-FEB-26',
  tableRows: [['100', '1250.00', 'K', 'Q', '1250.00', '', '', 'STC: PAPER CUPS']],
};

const MAX_LOGO_CHARS = 1_400_000;

export type PlaywrightHtmlRenderInput = {
  code: string;
  data?: InvoiceFormatPdfData;
  /** Rejected when present. Callers cannot supply a document body. */
  html?: unknown;
};

export function assertPlaywrightHtmlAllowlist(input: PlaywrightHtmlRenderInput): void {
  if (!input || typeof input !== 'object') {
    throw new Error('Playwright HTML renderer requires a request object');
  }
  if ('html' in input && input.html != null && input.html !== '') {
    throw new Error('Playwright HTML renderer rejects caller-supplied HTML');
  }
  const code = String(input.code || '').trim().toUpperCase();
  if (!isPlaywrightHtmlCode(code)) {
    throw new Error(`Playwright HTML renderer allowlist does not include ${code || '(empty)'}`);
  }
}

/** https images are inlined by the Node service before this runs. Remote URLs are refused here. */
export function assertSafeInlinedLogo(logoUrl: string | undefined): void {
  const url = (logoUrl || '').trim();
  if (!url) return;
  if (/fresa/i.test(url)) {
    throw new Error('Playwright HTML renderer refuses Fresa logo URLs');
  }
  if (url.startsWith('data:image/')) {
    if (!/^data:image\/(png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(url)) {
      throw new Error('Playwright HTML renderer refuses this logo data URL');
    }
    if (url.length > MAX_LOGO_CHARS) {
      throw new Error('Playwright HTML renderer refuses an oversized logo');
    }
    return;
  }
  throw new Error('Playwright HTML renderer only accepts an inlined image logo');
}

/**
 * Static HTML for the existing Draft-2 face. Page padding stays on the component (4 mm).
 * @page margin is 0 so Chromium does not add a second margin.
 */
export function buildHawbDraft2Html(data: InvoiceFormatPdfData = {}): string {
  assertPlaywrightHtmlAllowlist({ code: PLAYWRIGHT_HTML_PILOT_CODE, data });
  const companyBits = [data.companyName, data.companyAddress, data.companyPhone, data.companyEmail];
  for (const bit of companyBits) {
    if (bit && isFresaIdentityText(bit)) {
      throw new Error('Playwright HTML renderer refuses Fresa organization identity');
    }
  }
  assertSafeInlinedLogo(data.logoUrl);
  const model = mapToHawbOfficialModel(PLAYWRIGHT_HTML_PILOT_CODE, data, {
    showPlaceholders: false,
  });
  const body = renderToStaticMarkup(createElement(HawbDraft2Document, { model }));
  if (/fresa/i.test(body)) {
    throw new Error('Playwright HTML renderer produced Fresa identity text');
  }
  const width = `${PAGE_HAWB_NEAR_A4.widthPt}pt`;
  const height = `${PAGE_HAWB_NEAR_A4.heightPt}pt`;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: ${width} ${height}; margin: 0; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  body { width: ${width}; height: ${height}; overflow: hidden; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body, body * { font-family: Helvetica, Arial, sans-serif !important; }
</style>
</head>
<body>${body}</body>
</html>`;
}
