import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { appendOfficialCustomerTermsPdf } from '@/features/reports/utils/appendOfficialCustomerTermsPdf';
import { getHawbOfficialLayout } from './layouts';
import { mapToHawbOfficialModel } from './mapToHawbOfficialModel';
import { mergeHawbCatalogPreviewFixture } from './hawbOfficialCatalogFixture';
import type { HawbOfficialLayoutConfig } from './hawbOfficial.types';
import {
  HAWB_ORIGINAL1_OVERLAY_SLOTS,
  type HawbOverlaySlot,
} from './overlays/hawbOriginal1.fields';
import { HAWB_ORIGINAL2_OVERLAY_SLOTS } from './overlays/hawbOriginal2.fields';
import { sparseValueForSlot } from './sparseSlotValues';

/**
 * Vector sparse Original-1 / Original-2 PDF.
 * Matches Fresa pre-printed samples: data islands only (no dense Draft grid).
 * Avoids html2canvas overlap/blur on the 737×923 / 595×845 faces.
 */

async function loadFontBytes(path: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function drawMultiline(
  page: PDFPage,
  text: string,
  x: number,
  yTop: number,
  size: number,
  font: PDFFont,
  maxWidth: number,
  align: 'left' | 'right' | 'center' = 'left',
): void {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  let y = yTop;
  for (const line of lines.slice(0, 6)) {
    let draw = line;
    while (draw.length > 1 && font.widthOfTextAtSize(draw, size) > maxWidth) {
      draw = draw.slice(0, -1);
    }
    let drawX = x;
    const w = font.widthOfTextAtSize(draw, size);
    if (align === 'right') drawX = x + maxWidth - w;
    if (align === 'center') drawX = x + (maxWidth - w) / 2;
    page.drawText(draw, {
      x: drawX,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= size * 1.15;
  }
}

export type GenerateHawbSparsePdfOptions = {
  /** Default true — same Airway T&C PDF as Draft / Draft-1 / Draft-2. */
  appendCustomerTerms?: boolean;
};

export async function generateHawbSparsePdf(
  code: string,
  data: InvoiceFormatPdfData = {},
  options: GenerateHawbSparsePdfOptions = {},
): Promise<{ blob: Blob; fileName: string; layout: HawbOfficialLayoutConfig }> {
  const layout = getHawbOfficialLayout(code);
  if (!layout || (layout.variant !== 'original1' && layout.variant !== 'original2')) {
    throw new Error(`Sparse HAWB generator only supports Original-1/2 (got ${code})`);
  }

  const pdfData = mergeHawbCatalogPreviewFixture(data);
  const model = mapToHawbOfficialModel(code, pdfData, {
    showPlaceholders: !pdfData.entityBound,
  });

  const width = layout.page.widthPt;
  const height = layout.page.heightPt;
  const slots: HawbOverlaySlot[] =
    layout.variant === 'original1' ? HAWB_ORIGINAL1_OVERLAY_SLOTS : HAWB_ORIGINAL2_OVERLAY_SLOTS;

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const arimoBytes = await loadFontBytes('/reports-fonts/Arimo-Regular.ttf');
  const arimoBoldBytes = await loadFontBytes('/reports-fonts/Arimo-Bold.ttf');
  const regular = arimoBytes
    ? await doc.embedFont(arimoBytes, { subset: true })
    : await doc.embedFont(StandardFonts.Helvetica);
  const bold = arimoBoldBytes
    ? await doc.embedFont(arimoBoldBytes, { subset: true })
    : await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([width, height]);
  // White page — Fresa Original samples are data-only (preprinted stationery provides boxes).
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });

  for (const slot of slots) {
    const value = sparseValueForSlot(slot.id, model, layout);
    if (!value || /fresa/i.test(value)) continue;

    const size = slot.fontSizePx ?? 8;
    const font = (slot.fontWeight ?? 400) >= 700 ? bold : regular;
    const x = (slot.leftPct / 100) * width;
    const maxW = (slot.widthPct / 100) * width;
    // CSS top% → PDF baseline near top of band (matches pin baselineY).
    const yTop = height - (slot.topPct / 100) * height;

    drawMultiline(page, value, x, yTop, size, font, maxW, slot.align ?? 'left');
  }

  // Optional org logo — Issued-by / right of shipper (never over shipper). Pin has none.
  if (model.logoUrl && !/fresa/i.test(model.logoUrl)) {
    try {
      const res = await fetch(model.logoUrl);
      if (res.ok) {
        const bytes = new Uint8Array(await res.arrayBuffer());
        const isPng = model.logoUrl.toLowerCase().includes('.png');
        const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const maxH = 22;
        const maxW = 84;
        const scale = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const left = layout.variant === 'original1' ? width * 0.52 : width * 0.51;
        const top = layout.variant === 'original1' ? height * 0.962 : height * 0.964;
        page.drawImage(img, { x: left, y: top - h, width: w, height: h });
      }
    } catch {
      /* logo optional */
    }
  }

  const bytes = await doc.save();
  let blob = new Blob([bytes], { type: 'application/pdf' });

  const appendTerms =
    typeof options.appendCustomerTerms === 'boolean' ? options.appendCustomerTerms : true;
  if (appendTerms) {
    blob = await appendOfficialCustomerTermsPdf(blob, {
      kind: 'airway',
      formatCode: layout.code,
    });
  }

  return {
    blob,
    fileName: formatPdfFilename(`HAWB-${layout.variant}`, layout.code),
    layout,
  };
}

export function isHawbSparseNativeCode(code: string): boolean {
  const c = code.trim().toUpperCase();
  return (
    c === 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1' ||
    c === 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2'
  );
}
