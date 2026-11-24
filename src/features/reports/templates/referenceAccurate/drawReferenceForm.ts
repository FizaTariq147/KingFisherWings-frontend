import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { isFresaIdentityText } from '../official/officialBranding';
import type { OfficialMeasuredFace } from '../official/officialFace.types';
import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import { code128BitString } from './code128Vector';

export type PlacedText = {
  text: string;
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  /** Numeric columns. Uses Courier so the digits stay monospaced. */
  mono?: boolean;
};

export type ReferenceBarcodeBox = {
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function ink(r = 20, g = 20, b = 24) {
  return rgb(Math.min(1, r / 255), Math.min(1, g / 255), Math.min(1, b / 255));
}

/** pdf-lib standard fonts only encode WinAnsi. */
export function pdfSafe(value: string): string {
  return String(value || '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function plainLabel(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stackLines(
  lines: Array<string | undefined> | undefined,
  x: number,
  y: number,
  size: number,
  step: number,
  max = 4,
): PlacedText[] {
  return (lines || [])
    .map((line) => pdfSafe(line || ''))
    .filter(Boolean)
    .slice(0, max)
    .map((text, index) => ({ text, x, y: y - index * step, size }));
}

function drawPlaced(
  page: PDFPage,
  item: PlacedText,
  font: PDFFont,
  fontBold: PDFFont,
  fontMono: PDFFont,
): void {
  const text = pdfSafe(item.text).slice(0, 180);
  if (!text || isFresaIdentityText(text)) return;
  page.drawText(text, {
    x: item.x,
    y: item.y,
    size: item.size,
    font: item.mono ? fontMono : item.bold ? fontBold : font,
    color: rgb(0.05, 0.05, 0.08),
  });
}

/**
 * Draws one reference page: sample vectors, static labels, then live fields.
 * Sample party names, amounts and Fresa identity are not drawn.
 */
export async function drawReferenceFormPdf(options: {
  face: OfficialMeasuredFace;
  data: InvoiceFormatPdfData;
  keepLabel: (text: string) => boolean;
  fields: PlacedText[];
  letterhead?: PlacedText[];
  logoUrl?: string;
  logoBox?: { x: number; y: number; maxWidth: number; maxHeight: number };
  /** Per-template title weight. Does not change faces that omit it. */
  headingBold?: (text: string, size: number) => boolean;
  /** Per-template label x correction. Does not rewrite the measured face. */
  labelX?: (text: string, x: number) => number;
  /** Live CODE_128. Drawn as black vectors, never from a sample image. */
  barcode?: ReferenceBarcodeBox;
}): Promise<Uint8Array> {
  const { face, keepLabel, fields, letterhead, logoUrl, logoBox, headingBold, labelX, barcode } = options;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const needsMono = [...(letterhead || []), ...fields].some((item) => item.mono);
  const fontMono = needsMono ? await pdf.embedFont(StandardFonts.Courier) : font;
  const page = pdf.addPage([face.widthPt, face.heightPt]);
  const facePage = face.pages[0];
  const pageArea = face.widthPt * face.heightPt;

  if (facePage) {
    for (const rect of facePage.rects) {
      const [x, y, w, h, r, g, b, kind] = rect;
      if (w < 0.4 || h < 0.4) continue;
      if (w * h > pageArea * 0.9) continue;
      if (kind === 1) {
        // Black face fills stay omitted. On these samples they are fragments of
        // the pinned barcode, not the table. Near-white header bands are RGB 245
        // and stay, because only values above 245 are treated as blank paper.
        if (r < 40 && g < 40 && b < 40) continue;
        if (r > 245 && g > 245 && b > 245) continue;
        page.drawRectangle({ x, y, width: w, height: h, color: ink(r, g, b) });
      } else {
        page.drawRectangle({
          x,
          y,
          width: w,
          height: h,
          borderWidth: 0.6,
          borderColor: ink(r, g, b),
        });
      }
    }
    for (const line of facePage.lines) {
      const [x1, y1, x2, y2, r, g, b, width] = line;
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      if (maxX < -4 || minX > face.widthPt + 4 || maxY < -4 || minY > face.heightPt + 4) continue;
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness: Math.max(0.4, Math.min(width || 0.6, 2)),
        color: ink(r, g, b),
      });
    }
    for (const run of facePage.texts) {
      const text = plainLabel(run[0] || '').replace(/[\u2013\u2014]/g, '-');
      if (!text || isFresaIdentityText(text) || !keepLabel(text)) continue;
      const size = Math.max(6, Math.min(run[3] || 8, 16));
      drawPlaced(
        page,
        {
          text,
          x: labelX ? labelX(text, run[1]) : run[1],
          y: run[2],
          size,
          bold: Boolean(run[4]) || Boolean(headingBold?.(text, size)),
        },
        font,
        fontBold,
        fontMono,
      );
    }
  }

  for (const item of letterhead || []) drawPlaced(page, item, font, fontBold, fontMono);
  await drawLogo(pdf, page, logoUrl, logoBox);
  drawCode128(page, barcode);
  for (const item of fields) drawPlaced(page, item, font, fontBold, fontMono);

  return pdf.save();
}

/** Quiet zone stays inside the target box so the bars do not grow past it. */
const BARCODE_QUIET_MODULES = 10;

function drawCode128(page: PDFPage, box: ReferenceBarcodeBox | undefined): void {
  if (!box || box.width < 1 || box.height < 1 || /fresa/i.test(box.value)) return;
  const bits = code128BitString(box.value);
  if (!bits) return;
  const padded = `${'0'.repeat(BARCODE_QUIET_MODULES)}${bits}${'0'.repeat(BARCODE_QUIET_MODULES)}`;
  const moduleWidth = box.width / padded.length;
  let index = 0;
  while (index < padded.length) {
    if (padded[index] !== '1') {
      index += 1;
      continue;
    }
    const start = index;
    while (index < padded.length && padded[index] === '1') index += 1;
    page.drawRectangle({
      x: box.x + start * moduleWidth,
      y: box.y,
      width: (index - start) * moduleWidth,
      height: box.height,
      color: rgb(0, 0, 0),
    });
  }
}

async function drawLogo(
  pdf: PDFDocument,
  page: PDFPage,
  logoUrl: string | undefined,
  box: { x: number; y: number; maxWidth: number; maxHeight: number } | undefined,
): Promise<void> {
  if (!logoUrl || !box || /fresa/i.test(logoUrl)) return;
  const loaded = await loadLogo(logoUrl);
  if (!loaded) return;
  const image =
    loaded.kind === 'png' ? await pdf.embedPng(loaded.bytes) : await pdf.embedJpg(loaded.bytes);
  const scale = Math.min(box.maxWidth / image.width, box.maxHeight / image.height);
  page.drawImage(image, {
    x: box.x,
    y: box.y,
    width: image.width * scale,
    height: image.height * scale,
  });
}

async function loadLogo(
  logoUrl: string,
): Promise<{ bytes: Uint8Array; kind: 'png' | 'jpg' } | null> {
  try {
    if (logoUrl.startsWith('data:image/')) {
      const kind = logoUrl.startsWith('data:image/png') ? 'png' : 'jpg';
      if (kind === 'jpg' && !/^data:image\/jpe?g/i.test(logoUrl)) return null;
      const payload = logoUrl.split(',')[1] || '';
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return { bytes, kind };
    }
    if (!/^https?:/i.test(logoUrl) && !logoUrl.startsWith('/')) return null;
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    const type = (response.headers.get('content-type') || '').toLowerCase();
    const kind = type.includes('png') ? 'png' : type.includes('jpeg') || type.includes('jpg') ? 'jpg' : null;
    if (!kind) return null;
    return { bytes: new Uint8Array(await response.arrayBuffer()), kind };
  } catch {
    return null;
  }
}
