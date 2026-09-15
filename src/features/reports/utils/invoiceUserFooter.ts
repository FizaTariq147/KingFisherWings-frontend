import { useAuthStore } from '@/store/authStore';
import { rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';
import { DEFAULT_PDF_BRANDING } from '../constants/invoicePreviewBranding';

const MUTED = rgb(0.39, 0.45, 0.51);
const BODY = rgb(0.15, 0.18, 0.22);
const BAND = rgb(0.98, 0.99, 1);
const RULE = rgb(0.82, 0.86, 0.9);

function hexToRgb(hex: string) {
  const n = hex.replace('#', '').trim();
  if (n.length !== 6) return rgb(0.04, 0.16, 0.26);
  return rgb(
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
  );
}

/** Logged-in user for invoice PDF/preview footers. */
export function getInvoiceFooterUserEmail(): string {
  const email = useAuthStore.getState().user?.email?.trim();
  return email || 'info@kingfisherwingsgroup.com';
}

export function getInvoiceFooterUserName(): string {
  const user = useAuthStore.getState().user;
  return user?.name?.trim() || user?.email?.trim() || 'KingFisher User';
}

/** e.g. 15-Sep-26 09:22:PM Asia/Karachi */
export function formatInvoicePrintedAt(date = new Date()): string {
  const d = date
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
    .replace(/ /g, '-');
  const t = date
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .replace(/\s/g, '');
  let tz = 'UTC';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    /* ignore */
  }
  return `${d} ${t} ${tz}`;
}

/**
 * Admin-dashboard style footer (matches `stampPdfBranding` drawFooter).
 * Kept for any remaining pdf-lib drawers; HTML preview uses InvoiceUserFooter.
 */
export function drawInvoiceUserFooter(
  page: PDFPage,
  opts: {
    font: PDFFont;
    bold: PDFFont;
    margin: number;
    pageWidth: number;
    y?: number;
    pageLabel?: string;
    documentNumber?: string;
    companyName?: string;
    footerLine?: string;
    accentHex?: string;
  },
): void {
  const {
    font,
    bold,
    margin: M,
    pageWidth: w,
    pageLabel = 'Page 1 of 1',
    documentNumber = '',
    companyName = DEFAULT_PDF_BRANDING.companyName,
    footerLine = DEFAULT_PDF_BRANDING.footerLine,
    accentHex = DEFAULT_PDF_BRANDING.accentColor,
  } = opts;
  const accent = hexToRgb(accentHex);
  const bandH = 38;
  const y0 = opts.y ?? 0;

  page.drawRectangle({ x: 0, y: y0, width: w, height: bandH, color: BAND });
  page.drawRectangle({ x: 0, y: y0 + bandH - 2, width: w, height: 2, color: accent });
  page.drawLine({
    start: { x: M, y: y0 + bandH - 8 },
    end: { x: w - M, y: y0 + bandH - 8 },
    thickness: 0.5,
    color: RULE,
  });

  const rowY = y0 + bandH - 22;
  const company = safePdfText(companyName);
  const doc = safePdfText(documentNumber);
  const pageTxt = safePdfText(pageLabel);
  const line = safePdfText(footerLine);

  if (company) {
    page.drawText(company, { x: M, y: rowY, size: 7.5, font: bold, color: accent });
  }
  if (pageTxt) {
    const pw = font.widthOfTextAtSize(pageTxt, 7.5);
    page.drawText(pageTxt, { x: w - M - pw, y: rowY, size: 7.5, font, color: MUTED });
  }
  if (doc) {
    const dw = font.widthOfTextAtSize(doc, 7.5);
    page.drawText(doc, { x: (w - dw) / 2, y: rowY, size: 7.5, font, color: BODY });
  }
  if (line) {
    const lw = font.widthOfTextAtSize(line, 6.5);
    page.drawText(line, {
      x: Math.max(M, (w - lw) / 2),
      y: y0 + 10,
      size: 6.5,
      font,
      color: accent,
    });
  }
}
