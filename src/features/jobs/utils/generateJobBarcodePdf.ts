import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';

/**
 * Physical sticker size for print-and-paste on goods.
 * 100mm × 50mm ≈ 283.46 × 141.73 pt (common warehouse label).
 */
export const STICKER_W = 283.46;
export const STICKER_H = 141.73;
const PAD = 8;

const NAVY = rgb(0.039, 0.161, 0.259);
const TEXT = rgb(0.102, 0.118, 0.141);
const MUTED = rgb(0.4, 0.43, 0.47);
const RULE = rgb(0.82, 0.84, 0.86);
const WHITE = rgb(1, 1, 1);

export type JobBarcodePdfField = { label: string; value: string };

export type JobBarcodePdfModel = {
  jobNumber: string;
  barcodeValue: string;
  barcodePngBytes?: Uint8Array;
  jobType?: string;
  status?: string;
  documentDate?: string;
  parties?: JobBarcodePdfField[];
  route?: JobBarcodePdfField[];
  cargo?: JobBarcodePdfField[];
  modeDetails?: JobBarcodePdfField[];
  other?: JobBarcodePdfField[];
  notes?: string;
  company?: { name?: string; phone?: string; email?: string; website?: string; tagline?: string };
};

function measure(font: PDFFont, text: string, size: number): number {
  try {
    return font.widthOfTextAtSize(safePdfText(text) || ' ', size);
  } catch {
    return 0;
  }
}

function fit(font: PDFFont, text: string, size: number, maxW: number): string {
  const t = safePdfText(text) || '—';
  if (measure(font, t, size) <= maxW) return t;
  let s = t;
  while (s.length > 1 && measure(font, `${s}…`, size) > maxW) s = s.slice(0, -1);
  return `${s}…`;
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

function fieldValue(fields: JobBarcodePdfField[] | undefined, labelMatch: RegExp): string {
  const hit = (fields ?? []).find((f) => labelMatch.test(f.label));
  return String(hit?.value ?? '').trim();
}

/**
 * Compact warehouse / goods sticker PDF — sticker paper size, not A4.
 * Layout: job no · barcode · shipper · pieces/weight (print & paste on cartons).
 */
export async function generateJobBarcodePdf(model: JobBarcodePdfModel): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([STICKER_W, STICKER_H]);

  const contentW = STICKER_W - PAD * 2;
  let y = STICKER_H - PAD - 2;

  // White background (label stock)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: STICKER_W,
    height: STICKER_H,
    color: WHITE,
  });

  // Thin border for cut guide
  page.drawRectangle({
    x: 2,
    y: 2,
    width: STICKER_W - 4,
    height: STICKER_H - 4,
    borderColor: RULE,
    borderWidth: 0.6,
  });

  const jobNo = safePdfText(model.jobNumber) || '—';
  const jobType = safePdfText(model.jobType) || '';
  drawText(page, fit(fontBold, jobNo, 11, contentW * 0.72), PAD, y - 10, 11, fontBold, NAVY);
  if (jobType) {
    drawText(
      page,
      fit(font, jobType, 7, contentW * 0.28),
      PAD + contentW * 0.72,
      y - 9,
      7,
      font,
      MUTED,
    );
  }
  y -= 14;
  page.drawLine({
    start: { x: PAD, y },
    end: { x: STICKER_W - PAD, y },
    thickness: 0.5,
    color: RULE,
  });
  y -= 4;

  // CODE128 — full sticker width, tall enough for handheld scanners (~14–16mm bars)
  const barcodePanelH = 58;
  const barcodeMaxW = contentW;
  /** Prefer width for module thickness; keep height ≥ ~40pt for scan reliability. */
  const barcodeMaxH = 44;

  if (model.barcodePngBytes?.length) {
    try {
      const img = await doc.embedPng(model.barcodePngBytes);
      // Fit width first so modules stay thick; never squash below scannable height.
      let scale = barcodeMaxW / img.width;
      let w = img.width * scale;
      let h = img.height * scale;
      if (h > barcodeMaxH) {
        scale = barcodeMaxH / img.height;
        w = img.width * scale;
        h = img.height * scale;
      }
      // If still too short, scale up to min height (may clip width slightly via centering)
      const minH = 38;
      if (h < minH) {
        scale = minH / img.height;
        w = img.width * scale;
        h = minH;
        if (w > barcodeMaxW) {
          scale = barcodeMaxW / img.width;
          w = barcodeMaxW;
          h = img.height * scale;
        }
      }
      page.drawImage(img, {
        x: PAD + (contentW - w) / 2,
        y: y - barcodePanelH + (barcodePanelH - h) / 2,
        width: w,
        height: h,
      });
    } catch {
      drawText(
        page,
        fit(fontBold, model.barcodeValue || jobNo, 9, contentW),
        PAD,
        y - barcodePanelH / 2,
        9,
        fontBold,
        NAVY,
      );
    }
  } else {
    drawText(
      page,
      fit(fontBold, model.barcodeValue || jobNo, 9, contentW),
      PAD,
      y - barcodePanelH / 2,
      9,
      fontBold,
      NAVY,
    );
  }
  y -= barcodePanelH + 2;

  // Human-readable barcode value (centred)
  const code = safePdfText(model.barcodeValue || jobNo);
  drawText(
    page,
    fit(font, code, 7, contentW),
    PAD + (contentW - measure(font, fit(font, code, 7, contentW), 7)) / 2,
    y - 8,
    7,
    font,
    MUTED,
  );
  y -= 14;

  page.drawLine({
    start: { x: PAD, y },
    end: { x: STICKER_W - PAD, y },
    thickness: 0.4,
    color: RULE,
  });
  y -= 11;

  const shipper =
    fieldValue(model.parties, /shipper/i) ||
    fieldValue(model.parties, /customer|billing/i) ||
    '—';
  const pieces = fieldValue(model.cargo, /pieces|pkgs|packages/i);
  const weight = fieldValue(model.cargo, /gross|weight|kg/i);
  const cbm = fieldValue(model.cargo, /cbm|volume/i);
  const commodity = fieldValue(model.cargo, /commodity|cargo/i);

  drawText(page, 'Shipper', PAD, y, 6, font, MUTED);
  drawText(page, fit(fontBold, shipper, 8, contentW - 40), PAD + 38, y, 8, fontBold, TEXT);
  y -= 11;

  const metaParts = [
    pieces ? `Pcs ${pieces}` : '',
    weight ? `Wt ${weight}` : '',
    cbm ? `CBM ${cbm}` : '',
  ].filter(Boolean);
  if (metaParts.length) {
    drawText(page, fit(font, metaParts.join('  ·  '), 7.5, contentW), PAD, y, 7.5, font, TEXT);
    y -= 10;
  }
  if (commodity) {
    drawText(page, fit(font, commodity, 7, contentW), PAD, y, 7, font, MUTED);
  }

  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
