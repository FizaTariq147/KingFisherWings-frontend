import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB } from 'pdf-lib';
import { resolvePdfBranding, type PdfBrandingOptions, type ResolvedPdfBranding } from './pdfBranding';

const HEADER_FIRST_PT = 78;
const HEADER_OTHER_PT = 40;
const FOOTER_BAND_PT = 38;
/** Extra gap between header and quotation body. */
const CONTENT_SHIFT_FIRST_PT = 28;
const CONTENT_SHIFT_OTHER_PT = 14;
/** Inset around quotation body (uniform scale + margins). */
const CONTENT_PAD_X = 28;
const CONTENT_PAD_Y = 16;
const MARGIN_X = 36;
const MUTED = rgb(0.39, 0.45, 0.51);
const RULE = rgb(0.82, 0.86, 0.9);
const BODY = rgb(0.15, 0.18, 0.22);

let logoBytesPromise: Promise<ArrayBuffer> | null = null;

function hexToRgb(hex: string): RGB {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return rgb(0.04, 0.16, 0.26);
  return rgb(
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  );
}

async function loadLogoBytes(logoUrl: string): Promise<ArrayBuffer> {
  if (!logoBytesPromise) {
    const absolute = logoUrl.startsWith('data:')
      ? logoUrl
      : new URL(logoUrl, window.location.origin).href;
    logoBytesPromise = fetch(absolute).then(async (res) => {
      if (!res.ok) throw new Error('Logo fetch failed');
      return res.arrayBuffer();
    });
  }
  try {
    return await logoBytesPromise;
  } catch {
    logoBytesPromise = null;
    throw new Error('Logo fetch failed');
  }
}

function drawRightText(
  page: PDFPage,
  text: string,
  xRight: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB,
): void {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - w, y, size, font, color });
}

function drawHeader(
  page: PDFPage,
  opts: {
    width: number;
    baseY: number;
    headerPt: number;
    accent: RGB;
    branding: ResolvedPdfBranding;
    logo: { image: Awaited<ReturnType<PDFDocument['embedPng']>>; width: number; height: number };
    titleFont: PDFFont;
    bodyFont: PDFFont;
    pageIndex: number;
  },
): void {
  const { width, baseY, headerPt, accent, branding, logo, titleFont, bodyFont, pageIndex } = opts;
  const topY = baseY + headerPt;

  page.drawRectangle({ x: 0, y: baseY, width, height: headerPt, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: topY - 3, width, height: 3, color: accent });

  if (pageIndex === 0) {
    const logoW = Math.min(160, logo.width, width - MARGIN_X * 2);
    const logoH = logo.image.height * (logoW / logo.image.width);
    const logoX = (width - logoW) / 2;
    const logoY = topY - 14 - logoH;
    page.drawImage(logo.image, { x: logoX, y: logoY, width: logoW, height: logoH });

    const companyY = logoY - 14;
    const companyW = titleFont.widthOfTextAtSize(branding.companyName, 10);
    page.drawText(branding.companyName, {
      x: (width - companyW) / 2,
      y: companyY,
      size: 10,
      font: titleFont,
      color: accent,
    });

    const subW = bodyFont.widthOfTextAtSize(branding.subtitle, 7.5);
    page.drawText(branding.subtitle, {
      x: (width - subW) / 2,
      y: companyY - 11,
      size: 7.5,
      font: bodyFont,
      color: MUTED,
    });

    page.drawLine({
      start: { x: MARGIN_X, y: baseY + 28 },
      end: { x: width - MARGIN_X, y: baseY + 28 },
      thickness: 0.5,
      color: RULE,
    });

    const docType = (branding.documentType || 'DOCUMENT').toUpperCase();
    const quoteLabel = `Quote No: ${branding.documentNumber || branding.title}`;
    page.drawText(docType, { x: MARGIN_X, y: baseY + 14, size: 8.5, font: titleFont, color: accent });
    drawRightText(page, quoteLabel, width - MARGIN_X, baseY + 14, 8.5, bodyFont, BODY);
    if (branding.documentDate) {
      drawRightText(page, branding.documentDate, width - MARGIN_X, baseY + 4, 7.5, bodyFont, MUTED);
    }
    return;
  }

  const smallW = Math.min(56, logo.width);
  const smallH = logo.image.height * (smallW / logo.image.width);
  const logoY = baseY + (headerPt - smallH) / 2;
  page.drawImage(logo.image, { x: MARGIN_X, y: logoY, width: smallW, height: smallH });

  page.drawText(branding.companyName, {
    x: MARGIN_X + smallW + 8,
    y: baseY + headerPt / 2 - 4,
    size: 8.5,
    font: titleFont,
    color: accent,
  });

  const quoteLabel = `Quote No: ${branding.documentNumber || branding.title}`;
  drawRightText(page, quoteLabel, width - MARGIN_X, baseY + headerPt / 2 - 4, 8, bodyFont, MUTED);
}

function drawFooter(
  page: PDFPage,
  opts: {
    width: number;
    accent: RGB;
    branding: ResolvedPdfBranding;
    titleFont: PDFFont;
    bodyFont: PDFFont;
    pageIndex: number;
    pageCount: number;
  },
): void {
  const { width, accent, branding, titleFont, bodyFont, pageIndex, pageCount } = opts;

  page.drawRectangle({ x: 0, y: 0, width, height: FOOTER_BAND_PT, color: rgb(0.98, 0.99, 1) });
  page.drawRectangle({ x: 0, y: FOOTER_BAND_PT - 2, width, height: 2, color: accent });

  page.drawLine({
    start: { x: MARGIN_X, y: FOOTER_BAND_PT - 8 },
    end: { x: width - MARGIN_X, y: FOOTER_BAND_PT - 8 },
    thickness: 0.5,
    color: RULE,
  });

  page.drawText(branding.companyName, {
    x: MARGIN_X,
    y: FOOTER_BAND_PT - 22,
    size: 7.5,
    font: titleFont,
    color: accent,
  });

  const pageLabel = `Page ${pageIndex + 1} of ${pageCount}`;
  drawRightText(page, pageLabel, width - MARGIN_X, FOOTER_BAND_PT - 22, 7.5, bodyFont, MUTED);

  const quoteLabel = branding.documentNumber || branding.title;
  const quoteW = bodyFont.widthOfTextAtSize(quoteLabel, 7.5);
  page.drawText(quoteLabel, {
    x: (width - quoteW) / 2,
    y: FOOTER_BAND_PT - 22,
    size: 7.5,
    font: bodyFont,
    color: BODY,
  });

  const lineW = bodyFont.widthOfTextAtSize(branding.footerLine, 6.5);
  page.drawText(branding.footerLine, {
    x: Math.max(MARGIN_X, (width - lineW) / 2),
    y: 10,
    size: 6.5,
    font: bodyFont,
    color: accent,
  });
}

/**
 * Add header/footer bands and shift quotation body slightly downward.
 * Falls back to the original blob if stamping fails.
 */
export async function stampPdfWithBranding(
  input: Blob,
  options?: PdfBrandingOptions,
): Promise<Blob> {
  try {
    const branding = resolvePdfBranding(options);
    const sourceBytes = await input.arrayBuffer();
    const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const pageCount = sourcePdf.getPageCount();
    if (pageCount === 0) return input;

    const logoBytes = await loadLogoBytes(branding.logoUrl);
    const outPdf = await PDFDocument.create();
    const embeddedLogo = await outPdf.embedPng(logoBytes);
    const titleFont = await outPdf.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await outPdf.embedFont(StandardFonts.Helvetica);
    const accent = hexToRgb(branding.accentColor);
    const embeddedPages = await outPdf.embedPdf(sourcePdf);

    const logoScale = Math.min(160 / embeddedLogo.width, 32 / embeddedLogo.height);
    const logoDims = {
      image: embeddedLogo,
      width: embeddedLogo.width * logoScale,
      height: embeddedLogo.height * logoScale,
    };

    for (let index = 0; index < pageCount; index += 1) {
      const { width, height } = sourcePdf.getPage(index).getSize();
      const headerPt = index === 0 ? HEADER_FIRST_PT : HEADER_OTHER_PT;
      const contentShift = index === 0 ? CONTENT_SHIFT_FIRST_PT : CONTENT_SHIFT_OTHER_PT;
      const innerWidth = width - CONTENT_PAD_X * 2;
      const scale = innerWidth / width;
      const drawWidth = innerWidth;
      const drawHeight = height * scale;
      const drawX = CONTENT_PAD_X;

      const contentY = FOOTER_BAND_PT + contentShift + CONTENT_PAD_Y;
      const contentTop = contentY + drawHeight + CONTENT_PAD_Y;
      const pageHeight = contentTop + headerPt;

      const page = outPdf.addPage([width, pageHeight]);

      drawFooter(page, {
        width,
        accent,
        branding,
        titleFont,
        bodyFont,
        pageIndex: index,
        pageCount,
      });

      page.drawPage(embeddedPages[index], {
        x: drawX,
        y: contentY,
        width: drawWidth,
        height: drawHeight,
      });

      drawHeader(page, {
        width,
        baseY: contentTop,
        headerPt,
        accent,
        branding,
        logo: logoDims,
        titleFont,
        bodyFont,
        pageIndex: index,
      });
    }

    const stamped = await outPdf.save();
    return new Blob([Uint8Array.from(stamped)], { type: 'application/pdf' });
  } catch {
    return input;
  }
}

export async function ensureBrandedPdfBlob(
  blob: Blob,
  options?: PdfBrandingOptions,
): Promise<Blob> {
  return stampPdfWithBranding(blob, options);
}
