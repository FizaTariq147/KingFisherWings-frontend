import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from 'pdf-lib';
import logoAsset from '@/assets/logo.png';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';

const NAVY = rgb(0.039, 0.161, 0.259);
const ORANGE = rgb(0.957, 0.447, 0.078);
const TEXT = rgb(0.102, 0.118, 0.141);
const MUTED = rgb(0.45, 0.48, 0.52);
const LABEL = rgb(0.5, 0.53, 0.56);
const RULE = rgb(0.82, 0.84, 0.86);
const WHITE = rgb(1, 1, 1);

/** Matches invoice PDF footer band + bottom accent. */
const FOOTER_PT = 62;
/** First page: accent + logo + company contact (no title/panels). */
const HEADER_FIRST_PT = 88;
/** Continuation pages: thin accent only. */
const HEADER_OTHER_PT = 12;
const PAD_X = 32;
const PAD_Y = 8;

export type InvoiceChromeCompany = {
  name?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  website?: string;
};

function measure(font: PDFFont, text: string, size: number): number {
  return font.widthOfTextAtSize(safePdfText(text) || ' ', size);
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = TEXT,
): void {
  const t = safePdfText(text);
  if (!t) return;
  page.drawText(t, { x, y, size, font, color });
}

function drawRight(
  page: PDFPage,
  text: string,
  xRight: number,
  y: number,
  size: number,
  font: PDFFont,
  color = TEXT,
): void {
  const t = safePdfText(text);
  if (!t) return;
  page.drawText(t, { x: xRight - measure(font, t, size), y, size, font, color });
}

function drawMiniIcon(page: PDFPage, kind: 'phone' | 'mail' | 'web', x: number, y: number): void {
  page.drawCircle({ x: x + 4, y: y + 3, size: 4.2, color: NAVY });
  page.drawCircle({
    x: x + 4,
    y: y + 3,
    size: 2.2,
    color: kind === 'phone' ? ORANGE : WHITE,
  });
}

function drawTopAccent(page: PDFPage, pageW: number, yTop: number, thin = false): void {
  const h = thin ? 4 : 6;
  page.drawRectangle({ x: 0, y: yTop - h, width: pageW * 0.7, height: h, color: NAVY });
  page.drawRectangle({
    x: pageW * 0.7,
    y: yTop - h,
    width: pageW * 0.3,
    height: h,
    color: ORANGE,
  });
}

function drawInvoiceFooter(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  pageW: number,
  company: Required<InvoiceChromeCompany>,
): void {
  const contentW = pageW - PAD_X * 2;
  const top = 48;
  page.drawLine({
    start: { x: PAD_X, y: top + 16 },
    end: { x: pageW - PAD_X, y: top + 16 },
    thickness: 0.6,
    color: RULE,
  });

  const colW = contentW / 3;
  const items: Array<{ label: string; value: string; kind: 'phone' | 'mail' | 'web' }> = [
    { label: 'CALL US ANYTIME', value: company.phone, kind: 'phone' },
    { label: 'MAIL TO US', value: company.email, kind: 'mail' },
    { label: 'WEBSITE', value: company.website, kind: 'web' },
  ];
  items.forEach((item, i) => {
    const x = PAD_X + i * colW;
    drawText(page, item.label, x + 14, top + 4, 5.5, fontBold, LABEL);
    drawMiniIcon(page, item.kind, x, top - 10);
    const val = item.value;
    const maxW = colW - 20;
    let t = val;
    if (measure(font, t, 7.5) > maxW) {
      while (t.length > 1 && measure(font, `${t}…`, 7.5) > maxW) t = t.slice(0, -1);
      t = `${t}…`;
    }
    drawText(page, t, x + 14, top - 8, 7.5, font, TEXT);
  });

  page.drawRectangle({ x: 0, y: 0, width: pageW, height: 8, color: NAVY });
  page.drawRectangle({
    x: pageW * 0.78,
    y: 0,
    width: pageW * 0.22,
    height: 8,
    color: ORANGE,
  });
}

function drawInvoiceHeaderFirst(
  page: PDFPage,
  pageW: number,
  headerTop: number,
  font: PDFFont,
  fontBold: PDFFont,
  logo: { image: PDFImage | null; width: number; height: number },
  company: Required<InvoiceChromeCompany>,
): void {
  drawTopAccent(page, pageW, headerTop, false);
  let y = headerTop - 20;

  if (logo.image) {
    page.drawImage(logo.image, {
      x: PAD_X,
      y: y - logo.height,
      width: logo.width,
      height: logo.height,
    });
  } else {
    drawText(page, 'KingFisher', PAD_X, y - 14, 13, fontBold, NAVY);
    drawText(page, 'WINGS GROUP', PAD_X, y - 28, 9, fontBold, ORANGE);
  }

  let rightY = y - 8;
  drawRight(page, company.name, pageW - PAD_X, rightY, 10.5, fontBold, NAVY);
  rightY -= 11;
  drawRight(page, company.tagline, pageW - PAD_X, rightY, 6.5, fontBold, ORANGE);
  rightY -= 13;
  const phoneW = measure(font, company.phone, 7.5);
  drawMiniIcon(page, 'phone', pageW - PAD_X - phoneW - 14, rightY - 1);
  drawRight(page, company.phone, pageW - PAD_X, rightY, 7.5, font, MUTED);
  rightY -= 12;
  const emailW = measure(font, company.email, 7.5);
  drawMiniIcon(page, 'mail', pageW - PAD_X - emailW - 14, rightY - 1);
  drawRight(page, company.email, pageW - PAD_X, rightY, 7.5, font, MUTED);
}

async function embedLogo(doc: PDFDocument, logoUrl?: string): Promise<{
  image: PDFImage | null;
  width: number;
  height: number;
}> {
  const candidates = [
    logoUrl,
    typeof logoAsset === 'string' ? logoAsset : undefined,
    '/kingfisher-logo.png',
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    try {
      const url =
        raw.startsWith('data:') || /^https?:\/\//i.test(raw) || raw.startsWith('blob:')
          ? raw
          : new URL(raw, window.location.origin).href;
      const res = await fetch(url);
      if (!res.ok) continue;
      const bytes = await res.arrayBuffer();
      let image: PDFImage;
      try {
        image = await doc.embedPng(bytes);
      } catch {
        image = await doc.embedJpg(bytes);
      }
      const maxH = 48;
      const scale = maxH / image.height;
      return { image, width: image.width * scale, height: maxH };
    } catch {
      /* try next */
    }
  }
  return { image: null, width: 0, height: 0 };
}

/**
 * Wrap an API-generated PDF with invoice header/footer chrome only.
 * Inner pages are scaled — layout/content from the API is preserved.
 */
export async function stampPdfInvoiceChrome(
  input: Blob,
  options?: { company?: InvoiceChromeCompany; logoUrl?: string },
): Promise<Blob> {
  const company: Required<InvoiceChromeCompany> = {
    name: safePdfText(options?.company?.name || 'KINGFISHER WINGS GROUP').toUpperCase(),
    tagline: safePdfText(
      options?.company?.tagline || 'FREIGHT - LOGISTICS - GENERAL TRADING',
    ).toUpperCase(),
    phone: safePdfText(options?.company?.phone || '+971 55 5355 286'),
    email: safePdfText(options?.company?.email || 'inquiry@kingfishertec.com'),
    website: safePdfText(options?.company?.website || 'www.kingfisherwingsgroup.com'),
  };

  try {
    const sourceBytes = await input.arrayBuffer();
    const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const pageCount = sourcePdf.getPageCount();
    if (pageCount === 0) return input;

    const outPdf = await PDFDocument.create();
    const font = await outPdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await outPdf.embedFont(StandardFonts.HelveticaBold);
    const logo = await embedLogo(outPdf, options?.logoUrl);
    const embeddedPages = await outPdf.embedPdf(sourcePdf);

    for (let index = 0; index < pageCount; index += 1) {
      const { width, height } = sourcePdf.getPage(index).getSize();
      const headerPt = index === 0 ? HEADER_FIRST_PT : HEADER_OTHER_PT;
      const footerPt = FOOTER_PT;
      const innerH = height - PAD_Y * 2;
      const innerW = width - PAD_X * 2;
      const scale = Math.min(innerW / width, innerH / height, 1);
      const drawW = width * scale;
      const drawH = height * scale;
      const drawX = PAD_X + (innerW - drawW) / 2;
      const contentY = footerPt + PAD_Y;
      const pageHeight = contentY + drawH + PAD_Y + headerPt;

      const page = outPdf.addPage([width, pageHeight]);
      const headerTop = pageHeight;

      drawInvoiceFooter(page, font, fontBold, width, company);

      page.drawPage(embeddedPages[index], {
        x: drawX,
        y: contentY,
        width: drawW,
        height: drawH,
      });

      if (index === 0) {
        drawInvoiceHeaderFirst(page, width, headerTop, font, fontBold, logo, company);
      } else {
        drawTopAccent(page, width, headerTop, true);
      }
    }

    const stamped = await outPdf.save();
    return new Blob([stamped], { type: 'application/pdf' });
  } catch {
    return input;
  }
}
