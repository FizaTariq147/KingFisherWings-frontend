import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import {
  assertNoFresaIdentity,
  isFresaIdentityText,
  officialCompanyName,
} from './officialBranding';
import { getOfficialMeasuredFace } from './officialFaceRegistry';
import type { OfficialFaceData, OfficialMeasuredFace } from './officialFace.types';

function drawFacePage(
  page: ReturnType<PDFDocument['addPage']>,
  facePage: OfficialMeasuredFace['pages'][number],
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  face: OfficialMeasuredFace,
  data: OfficialFaceData,
  pageIndex: number,
): void {
  const pageArea = face.widthPt * face.heightPt;
  for (const [x, y, w, h] of facePage.rects) {
    if (w < 0.4 || h < 0.4) continue;
    if (w * h > pageArea * 0.85) continue;
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderWidth: 0.4,
      borderColor: rgb(0.1, 0.1, 0.12),
    });
  }
  for (const [x1, y1, x2, y2] of facePage.lines) {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 0.4,
      color: rgb(0.1, 0.1, 0.12),
    });
  }
  for (const [text, x, y, size] of facePage.texts) {
    if (!text || isFresaIdentityText(text)) continue;
    page.drawText(text.slice(0, 180), {
      x,
      y,
      size: Math.max(6, Math.min(size || 8, 18)),
      font,
      color: rgb(0.05, 0.05, 0.08),
    });
  }
  if (pageIndex !== 0) return;

  const company = officialCompanyName(data.companyName);
  const slot = face.branding;
  page.drawRectangle({
    x: slot.x,
    y: slot.y - 2,
    width: Math.min(260, face.widthPt - slot.x - 12),
    height: 14,
    color: rgb(1, 1, 1),
  });
  page.drawText(company.slice(0, 60), {
    x: slot.x,
    y: slot.y,
    size: slot.size || 11,
    font,
    color: rgb(0.05, 0.05, 0.08),
  });
  const contact = [data.companyAddress, data.companyPhone, data.companyEmail]
    .map((part) => (part || '').trim())
    .filter((part) => part && !isFresaIdentityText(part))
    .join('  ');
  if (contact) {
    page.drawText(contact.slice(0, 90), {
      x: slot.x,
      y: Math.max(8, slot.y - 12),
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
  const pages = face.pages.length > 0 ? face.pages : [{ rects: [], lines: [], texts: [] }];
  pages.forEach((facePage, index) => {
    const page = doc.addPage([face.widthPt, face.heightPt]);
    drawFacePage(page, facePage, font, face, data, index);
  });
  const bytes = await doc.save();
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' });
  const fileName = formatPdfFilename(face.code, 'pdf');
  return { blob, fileName, face };
}
