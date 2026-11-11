import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ReportOrgChrome } from './resolveReportOrgChrome';

async function embedLogoImage(
  doc: PDFDocument,
  logoUrl: string,
): Promise<{ image: Awaited<ReturnType<PDFDocument['embedPng']>>; width: number; height: number } | null> {
  try {
    const res = await fetch(logoUrl, { credentials: 'omit', mode: 'cors' });
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    const u8 = new Uint8Array(bytes);
    const isPng = u8[0] === 0x89 && u8[1] === 0x50;
    const image = isPng ? await doc.embedPng(u8) : await doc.embedJpg(u8);
    const maxH = 28;
    const maxW = 90;
    const scale = Math.min(maxW / image.width, maxH / image.height, 1);
    return { image, width: image.width * scale, height: image.height * scale };
  } catch {
    return null;
  }
}

export type StampOrgChromeOptions = {
  formatLabel?: string;
  sampleIsFallback?: boolean;
};

/** Shared pdf-lib org chrome stamp for official Fresa sample PDFs (HBL/HAWB). */
export async function stampOrgChromeOnSamplePdf(
  sampleBytes: ArrayBuffer,
  chrome: ReportOrgChrome,
  opts: StampOrgChromeOptions = {},
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(sampleBytes, { ignoreEncryption: true });
  const pages = doc.getPages();
  if (!pages.length) return new Uint8Array(sampleBytes);

  const page = pages[0];
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontSm = await doc.embedFont(StandardFonts.Helvetica);
  const logo = chrome.logoUrl ? await embedLogoImage(doc, chrome.logoUrl) : null;
  const pad = 10;
  const boxW = 130;
  const boxH = logo ? logo.height + 22 : 28;
  const x = width - boxW - pad;
  const y = height - boxH - pad;

  page.drawRectangle({
    x,
    y,
    width: boxW,
    height: boxH,
    color: rgb(1, 1, 1),
    opacity: 0.92,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.5,
  });

  let cursorY = y + boxH - 6;
  if (logo) {
    page.drawImage(logo.image, {
      x: x + (boxW - logo.width) / 2,
      y: cursorY - logo.height,
      width: logo.width,
      height: logo.height,
    });
    cursorY -= logo.height + 4;
  }

  const name = (chrome.company || 'KingFisher Wings').slice(0, 42);
  const nameSize = 7;
  const nameWidth = font.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: x + Math.max(4, (boxW - nameWidth) / 2),
    y: Math.max(y + 4, cursorY - nameSize),
    size: nameSize,
    font,
    color: rgb(0.06, 0.16, 0.26),
  });
  page.drawText('Issued via Freightnest', {
    x: x + 6,
    y: y + 3,
    size: 5.5,
    font: fontSm,
    color: rgb(0.4, 0.4, 0.4),
  });

  if (opts.formatLabel) {
    const label = opts.formatLabel.slice(0, 64);
    page.drawRectangle({
      x: pad,
      y: height - 22,
      width: Math.min(width - pad * 2 - boxW - 8, font.widthOfTextAtSize(label, 8) + 12),
      height: 14,
      color: rgb(0.06, 0.16, 0.26),
      opacity: 0.9,
    });
    page.drawText(label, {
      x: pad + 6,
      y: height - 18,
      size: 8,
      font,
      color: rgb(1, 1, 1),
    });
  }

  if (opts.sampleIsFallback) {
    page.drawText('No distinct Fresa CDN sample — closest draft layout + format label', {
      x: pad,
      y: 8,
      size: 6,
      font: fontSm,
      color: rgb(0.45, 0.2, 0.1),
    });
  }

  return doc.save();
}
