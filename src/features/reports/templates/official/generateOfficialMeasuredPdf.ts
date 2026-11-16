import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import {
  assertNoFresaIdentity,
  isFresaIdentityText,
  officialCompanyName,
} from './officialBranding';
import { getOfficialMeasuredFace } from './officialFaceRegistry';
import type { OfficialFaceData, OfficialMeasuredFace } from './officialFace.types';

function ink(r = 20, g = 20, b = 24) {
  return rgb(Math.min(1, r / 255), Math.min(1, g / 255), Math.min(1, b / 255));
}

/** Jasper sometimes stores labels as HTML fragments. Draw the visible words only. */
function plainLabel(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const DOC_TITLE = /invoice|quotation|statement|draft|shipment|document|arrival|delivery|notice|manifest|receipt|bill of/i;

/** Near-black cell fills are clipped text blocks. They paint as solid bars over the data. */
function hiddenCellFill(w: number, h: number, r = 0, g = 0, b = 0): boolean {
  const dark = r < 40 && g < 40 && b < 40;
  return dark && Math.min(w, h) > 3.5;
}

function letterheadAnchor(
  face: OfficialMeasuredFace,
  texts: OfficialMeasuredFace['pages'][number]['texts'],
): { x: number; y: number; size: number; wipeWidth: number } {
  const top = texts.filter((run) => {
    const text = plainLabel(run[0] || '');
    return Boolean(text) && run[2] > face.heightPt - 64 && run[1] < face.widthPt * 0.5;
  });
  const left = [...top].sort((a, b) => a[1] - b[1] || b[2] - a[2])[0];
  const label = plainLabel(left?.[0] || '');
  const replacesTitle = label.length > 18 && DOC_TITLE.test(label);
  if (!left || replacesTitle) {
    return { x: 24, y: Math.max(8, face.heightPt - 18), size: 9, wipeWidth: 0 };
  }
  const wipeWidth = Math.min(200, Math.max(72, label.length * (left[3] || 8) * 0.62));
  return {
    x: Math.max(14, left[1] - 1),
    y: left[2],
    size: Math.max(8, Math.min(left[3] || 10, 12)),
    wipeWidth,
  };
}

function drawFacePage(
  page: ReturnType<PDFDocument['addPage']>,
  facePage: OfficialMeasuredFace['pages'][number],
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
  face: OfficialMeasuredFace,
  data: OfficialFaceData,
  pageIndex: number,
): void {
  const pageArea = face.widthPt * face.heightPt;
  for (const rect of facePage.rects) {
    const [x, y, w, h, r, g, b, kind] = rect;
    if (w < 0.4 || h < 0.4) continue;
    if (w * h > pageArea * 0.9) continue;
    if (kind === 1) {
      if (hiddenCellFill(w, h, r, g, b)) continue;
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: ink(r, g, b),
      });
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
    const [raw, x, y, size, bold] = run;
    const text = plainLabel(raw || '');
    if (!text || isFresaIdentityText(text)) continue;
    page.drawText(text.slice(0, 180), {
      x,
      y,
      size: Math.max(6, Math.min(size || 8, 18)),
      font: bold || (size || 0) >= 12 ? fontBold : font,
      color: rgb(0.05, 0.05, 0.08),
    });
  }
  if (pageIndex !== 0) return;

  const company = officialCompanyName(data.companyName);
  const slot = letterheadAnchor(face, facePage.texts);
  const nameWidth = Math.min(190, Math.max(80, company.length * 5.6));
  const wipeWidth = Math.min(Math.max(slot.wipeWidth, nameWidth), face.widthPt * 0.42);
  page.drawRectangle({
    x: slot.x,
    y: slot.y - 2,
    width: wipeWidth,
    height: (slot.size || 9) + 4,
    color: rgb(1, 1, 1),
  });
  page.drawText(company.slice(0, 60), {
    x: slot.x,
    y: slot.y,
    size: slot.size || 11,
    font: fontBold,
    color: rgb(0.05, 0.05, 0.08),
  });
  const contact = [data.companyAddress, data.companyPhone, data.companyEmail]
    .map((part) => (part || '').trim())
    .filter((part) => part && !isFresaIdentityText(part))
    .join('  ');
  if (contact && slot.wipeWidth > 0) {
    page.drawText(contact.slice(0, 90), {
      x: slot.x,
      y: Math.max(8, slot.y - 11),
      size: 7,
      font,
      color: rgb(0.15, 0.15, 0.18),
    });
  }

  const values: Record<string, string> = {
    shipper: (data.shipperLines || []).filter(Boolean).join(', '),
    consignee: (data.consigneeLines || []).filter(Boolean).join(', '),
    notify: (data.notifyLines || []).filter(Boolean).join(', '),
    jobNumber: data.jobNumber || '',
    referenceNo: data.referenceNo || '',
    invoiceNumber: data.invoiceNumber || '',
    hawbNo: data.hawbNo || '',
    hblNo: data.hblNo || '',
    mawbNo: data.mawbNo || '',
  };
  for (const field of face.fieldSlots) {
    const value = values[field.key];
    if (!value || isFresaIdentityText(value)) continue;
    page.drawText(value.slice(0, 80), {
      x: field.x,
      y: field.y,
      size: field.size || 8,
      font,
      color: rgb(0.05, 0.05, 0.08),
    });
  }
}

/**
 * Draw one measured face. Preview and download share this blob.
 * The Fresa sample is not copied into the file.
 */
export async function generateOfficialMeasuredPdf(
  code: string,
  data: OfficialFaceData = {},
): Promise<{ blob: Blob; fileName: string; face: OfficialMeasuredFace }> {
  const face = getOfficialMeasuredFace(code);
  if (!face) {
    throw new Error(`No measured native face for ${code}`);
  }
  assertNoFresaIdentity(
    face.pages.flatMap((page) => page.texts.map((run) => run[0])),
    face.code,
  );

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = face.pages.length > 0 ? face.pages : [{ rects: [], lines: [], texts: [] }];
  pages.forEach((facePage, index) => {
    const page = doc.addPage([face.widthPt, face.heightPt]);
    drawFacePage(page, facePage, font, fontBold, face, data, index);
  });
  const bytes = await doc.save();
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' });
  const fileName = formatPdfFilename(face.code, 'pdf');
  return { blob, fileName, face };
}
