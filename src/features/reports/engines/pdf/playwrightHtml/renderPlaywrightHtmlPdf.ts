import type { Browser, Page } from 'playwright';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { PAGE_HAWB_NEAR_A4 } from '@/features/reports/engines/pdf/pageGeometry';
import {
  assertPlaywrightHtmlAllowlist,
  assertSafeInlinedLogo,
  buildHawbDraft2Html,
  type PlaywrightHtmlRenderInput,
} from './hawbDraft2Html';

const RENDER_TIMEOUT_MS = 20_000;
const LOGO_TIMEOUT_MS = 8_000;
const MAX_LOGO_BYTES = 1_000_000;

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import('playwright');
  return chromium.launch({ headless: true });
}

async function sharedBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error: unknown) => {
      browserPromise = null;
      throw error;
    });
  }
  return browserPromise;
}

/** Close the shared Chromium. Safe to call when no render is using it. */
export async function closePlaywrightHtmlBrowser(): Promise<void> {
  const pending = browserPromise;
  browserPromise = null;
  if (!pending) return;
  const browser = await pending.catch(() => null);
  await browser?.close().catch(() => undefined);
}

function isFresaHost(hostname: string): boolean {
  return /fresa/i.test(hostname);
}

/**
 * Download a logo and return a data URL. Redirects are not followed.
 * File URLs and non-image responses are refused.
 */
export async function inlineRemoteLogo(logoUrl: string): Promise<string> {
  const raw = logoUrl.trim();
  if (!raw) return '';
  if (raw.startsWith('data:image/')) {
    assertSafeInlinedLogo(raw);
    return raw;
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('Playwright HTML renderer refuses an invalid logo URL');
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error('Playwright HTML renderer only loads https logos');
  }
  if (isFresaHost(parsed.hostname)) {
    throw new Error('Playwright HTML renderer refuses Fresa logo URLs');
  }
  const response = await fetch(parsed, { redirect: 'manual', signal: AbortSignal.timeout(LOGO_TIMEOUT_MS) });
  if (response.status >= 300) {
    throw new Error('Playwright HTML renderer refuses logo redirects');
  }
  const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(type)) {
    throw new Error('Playwright HTML renderer refuses a non-image logo');
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_LOGO_BYTES) {
    throw new Error('Playwright HTML renderer refuses this logo size');
  }
  return `data:${type};base64,${bytes.toString('base64')}`;
}

async function fillOrgChrome(data: InvoiceFormatPdfData): Promise<InvoiceFormatPdfData> {
  if (data.companyName?.trim()) return data;
  try {
    const { resolveReportOrgChrome } = await import('@/features/reports/utils/resolveReportOrgChrome');
    const chrome = await resolveReportOrgChrome();
    return {
      ...data,
      companyName: data.companyName || chrome.company,
      companyAddress: data.companyAddress || chrome.address,
      companyPhone: data.companyPhone || chrome.phone,
      companyEmail: data.companyEmail || chrome.email,
      logoUrl: data.logoUrl || chrome.logoUrl,
    };
  } catch {
    return data;
  }
}

async function preparePage(page: Page, html: string): Promise<void> {
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('data:') || url === 'about:blank') {
      void route.continue();
      return;
    }
    void route.abort();
  });
  await page.emulateMedia({ media: 'print' });
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: RENDER_TIMEOUT_MS });
  await page.evaluate(async () => {
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    if (fonts?.ready) await fonts.ready;
  });
}

/**
 * Print the Draft-2 HAWB face to a PDF buffer.
 * Not used by the browser catalogue. One isolated page per call.
 */
export async function renderPlaywrightHtmlPdf(input: PlaywrightHtmlRenderInput): Promise<Buffer> {
  assertPlaywrightHtmlAllowlist(input);
  const data = await fillOrgChrome({ ...(input.data || {}) });
  if (data.logoUrl?.trim()) {
    data.logoUrl = await inlineRemoteLogo(data.logoUrl);
  }
  const html = buildHawbDraft2Html(data);
  const browser = await sharedBrowser();
  const page = await browser.newPage();
  page.setDefaultTimeout(RENDER_TIMEOUT_MS);
  try {
    await preparePage(page, html);
    const pdf = await page.pdf({
      width: `${PAGE_HAWB_NEAR_A4.widthMm}mm`,
      height: `${PAGE_HAWB_NEAR_A4.heightMm}mm`,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      timeout: RENDER_TIMEOUT_MS,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => undefined);
  }
}
