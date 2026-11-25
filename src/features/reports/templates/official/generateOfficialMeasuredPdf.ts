import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getReportBrandingSlots } from './brandingSlots';
import {
  assertNoFresaIdentity,
  isFresaIdentityText,
  officialCompanyName,
  replaceSampleCompanyPlaceholder,
} from './officialBranding';
import { getOfficialMeasuredFace } from './officialFaceRegistry';
import type {
  OfficialFaceData,
  OfficialMeasuredFace,
  ReportBrandingBox,
  ReportBrandingSlots,
} from './officialFace.types';

function ink(r = 20, g = 20, b = 24) {
  return rgb(Math.min(1, r / 255), Math.min(1, g / 255), Math.min(1, b / 255));
}

function colorFromHex(hex: string | undefined, fallback = rgb(0.06, 0.3, 0.59)) {
  if (!hex || !/^#?[0-9a-fA-F]{6}$/.test(hex)) return fallback;
  const raw = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return ink(r, g, b);
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

/** Sample checkbox ticks extracted as a radical. Helvetica has no U+221A. */
const CHECK_MARK = /[\u221a\u2713\u2714]/;
const CHECK_ONLY = /^[\s\u221a\u2713\u2714]+$/;
const HAS_ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Standard fonts encode WinAnsi only. Other characters are dropped, not thrown. */
function winAnsiLabel(text: string): string {
  return text
    .replace(new RegExp(CHECK_MARK.source, 'g'), '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadFontBytes(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

type FaceFonts = {
  latin: PDFFont;
  latinBold: PDFFont;
  arabic: PDFFont | null;
};

function pickFont(fonts: FaceFonts, text: string, bold: boolean): PDFFont {
  if (HAS_ARABIC.test(text) && fonts.arabic) return fonts.arabic;
  return bold ? fonts.latinBold : fonts.latin;
}

function drawSafeText(
  page: PDFPage,
  fonts: FaceFonts,
  text: string,
  x: number,
  y: number,
  size: number,
  bold = false,
  color = rgb(0.05, 0.05, 0.08),
  align: 'left' | 'right' = 'left',
  boxWidth?: number,
  /** Content-stream text angle. Rotated Fresa samples advance along +Y (90°). */
  textRotateDeg = 0,
): void {
  const cleaned = plainLabel(text).replace(new RegExp(CHECK_MARK.source, 'g'), '').trim();
  if (!cleaned) return;
  const font = pickFont(fonts, cleaned, bold);
  const printable =
    font === fonts.arabic
      ? cleaned.slice(0, 180)
      : winAnsiLabel(cleaned).slice(0, 180);
  if (!printable) return;
  const fontSize = Math.max(6, Math.min(size || 8, 18));
  let drawX = x;
  let drawY = y;
  if (align === 'right') {
    const textWidth = font.widthOfTextAtSize(printable, fontSize);
    if (textRotateDeg === 90) {
      // Advance is +Y: "right" = toward higher Y (visual right after /Rotate 90).
      const end = y + (boxWidth && boxWidth > 0 ? boxWidth : textWidth);
      drawY = Math.max(8, end - textWidth);
    } else if (textRotateDeg === 270) {
      const end = y - (boxWidth && boxWidth > 0 ? boxWidth : textWidth);
      drawY = end + textWidth;
    } else {
      const rightEdge = x + (boxWidth && boxWidth > 0 ? boxWidth : textWidth);
      drawX = Math.max(8, rightEdge - textWidth);
    }
  }
  page.drawText(printable, {
    x: drawX,
    y: drawY,
    size: fontSize,
    font,
    color,
    ...(textRotateDeg ? { rotate: degrees(textRotateDeg) } : {}),
  });
}

function drawCheckMark(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  textRotateDeg = 0,
): void {
  const s = Math.max(6, Math.min(size || 8, 14));
  const color = rgb(0.05, 0.05, 0.08);
  // Keep tick geometry in the text advance frame for rotated faces.
  const rot = textRotateDeg === 90;
  page.drawLine({
    start: rot ? { x: x + s * 0.28, y } : { x, y: y + s * 0.28 },
    end: rot ? { x: x + s * 0.05, y: y + s * 0.32 } : { x: x + s * 0.32, y: y + s * 0.05 },
    thickness: 0.9,
    color,
  });
  page.drawLine({
    start: rot ? { x: x + s * 0.05, y: y + s * 0.32 } : { x: x + s * 0.32, y: y + s * 0.05 },
    end: rot ? { x: x + s * 0.72, y: y + s * 0.85 } : { x: x + s * 0.85, y: y + s * 0.72 },
    thickness: 0.9,
    color,
  });
}

function wipeBox(page: PDFPage, box: ReportBrandingBox | null | undefined, pad = 1): void {
  if (!box) return;
  page.drawRectangle({
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: Math.max(4, (box.width || 40) + pad * 2),
    height: Math.max(4, (box.height || box.size || 8) + pad * 2),
    color: rgb(1, 1, 1),
  });
}

/**
 * Wipe a text slot. On /Rotate 90 faces, slot.width is the advance along +Y and
 * height/size is the glyph band along X — do not treat width as an X extent or
 * the wipe erases Client/IGM/table cells across the page.
 */
function wipeTextSlot(
  page: PDFPage,
  box: ReportBrandingBox | null | undefined,
  textRotateDeg = 0,
  pad = 1,
): void {
  if (!box) return;
  if (textRotateDeg === 90) {
    const band = Math.max(box.height || 0, box.size || 8, 8);
    const advance = Math.max(box.width || 40, 12);
    page.drawRectangle({
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: Math.max(4, band + pad * 2),
      height: Math.max(4, advance + pad * 2),
      color: rgb(1, 1, 1),
    });
    return;
  }
  if (textRotateDeg === 270) {
    const band = Math.max(box.height || 0, box.size || 8, 8);
    const advance = Math.max(box.width || 40, 12);
    page.drawRectangle({
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - advance - pad),
      width: Math.max(4, band + pad * 2),
      height: Math.max(4, advance + pad * 2),
      color: rgb(1, 1, 1),
    });
    return;
  }
  wipeBox(page, box, pad);
}

function defaultPrintedDate(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

async function loadLogoBytes(
  logoUrl: string,
): Promise<{ bytes: Uint8Array; kind: 'png' | 'jpg' } | null> {
  try {
    if (/fresa/i.test(logoUrl)) return null;
    if (logoUrl.startsWith('data:image/')) {
      const kind = logoUrl.startsWith('data:image/png')
        ? 'png'
        : /^data:image\/jpe?g/i.test(logoUrl)
          ? 'jpg'
          : null;
      if (!kind) return null;
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
    const kind = type.includes('png')
      ? 'png'
      : type.includes('jpeg') || type.includes('jpg')
        ? 'jpg'
        : null;
    if (!kind) return null;
    return { bytes: new Uint8Array(await response.arrayBuffer()), kind };
  } catch {
    return null;
  }
}

/** Fit org logo into the exact Fresa sample logo box. */
async function drawOrgLogoInSlot(
  pdf: PDFDocument,
  page: PDFPage,
  logoUrl: string | undefined,
  slot: ReportBrandingBox | null | undefined,
  fallback: { x: number; y: number; width: number; height: number },
  textRotateDeg = 0,
): Promise<boolean> {
  if (!logoUrl) return false;
  const loaded = await loadLogoBytes(logoUrl);
  if (!loaded) return false;
  const image =
    loaded.kind === 'png' ? await pdf.embedPng(loaded.bytes) : await pdf.embedJpg(loaded.bytes);
  const box = slot || fallback;
  const maxWidth = Math.max(24, box.width || 78);
  const maxHeight = Math.max(16, box.height || 36);
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = box.x + Math.max(0, (maxWidth - width) / 2);
  const y = box.y + Math.max(0, (maxHeight - height) / 2);
  wipeBox(page, { ...box, width: maxWidth, height: maxHeight }, 1);
  // Rotated Fresa samples paint chrome along +Y; rotate the logo so it reads
  // upright after the page /Rotate flag is applied by the viewer.
  page.drawImage(image, {
    x,
    y,
    width,
    height,
    ...(textRotateDeg ? { rotate: degrees(textRotateDeg) } : {}),
  });
  return true;
}

function contactLines(data: OfficialFaceData): string[] {
  return [data.companyAddress, data.companyPhone, data.companyEmail, data.companyWeb]
    .map((part) => (part || '').trim())
    .filter((part) => part && !isFresaIdentityText(part));
}

function boxesOverlap(a: ReportBrandingBox, b: ReportBrandingBox, pad = 2): boolean {
  const aw = a.width || 40;
  const ah = a.height || a.size || 8;
  const bw = b.width || 40;
  const bh = b.height || b.size || 8;
  return !(
    a.x + aw + pad < b.x ||
    b.x + bw + pad < a.x ||
    a.y + ah + pad < b.y ||
    b.y + bh + pad < a.y
  );
}

/** Wipe sample branding and redraw org logo / company / footer at measured slots. */
function applyBrandingSlots(
  page: PDFPage,
  fonts: FaceFonts,
  slots: ReportBrandingSlots,
  data: OfficialFaceData,
  pageIndex: number,
  pageCount: number,
  textRotateDeg = 0,
): void {
  // Wipe only — never stamp org company into body wipe boxes (that painted
  // "Zoyan Logistics" over Client/IGM on Format 2 and similar faces).
  for (const wipe of slots.companyWipes || []) wipeTextSlot(page, wipe, textRotateDeg, 1);
  for (const line of slots.addressLines || []) {
    if (slots.company && boxesOverlap(line, slots.company, 4)) continue;
    wipeTextSlot(page, line, textRotateDeg, 1);
  }
  wipeTextSlot(page, slots.company, textRotateDeg, 2);
  wipeBox(page, slots.footer.poweredByWipe, 2);
  wipeTextSlot(page, slots.footer.printedByValue, textRotateDeg, 1);
  wipeTextSlot(page, slots.footer.printedDateValue, textRotateDeg, 1);

  if (pageIndex !== 0) return;

  const company = officialCompanyName(data.companyName);
  const lines = contactLines(data);
  const companyAlign = slots.company?.align === 'right' ? 'right' : 'left';
  const addressSlots = (slots.addressLines || []).filter((box) => {
    if (!slots.company) return true;
    if (boxesOverlap(box, slots.company, 4)) return false;
    return (
      Math.abs(box.x - slots.company.x) > 2 ||
      Math.abs(box.y - slots.company.y) > 2
    );
  });
  if (addressSlots.length > 0 && lines.length > 0) {
    const uniqueY = [
      ...new Map(addressSlots.map((b) => [`${Math.round(b.y)}:${Math.round(b.x)}`, b])).values(),
    ].sort((a, b) => b.y - a.y || a.x - b.x);
    const belowCompany = uniqueY.filter((b) => {
      if (!slots.company) return true;
      // Rotated letterhead: "below" company is toward +X (visual down).
      if (textRotateDeg === 90) return b.x > slots.company.x + 4;
      return b.y < slots.company.y - 4;
    });
    const targets = (belowCompany.length >= 1 ? belowCompany : uniqueY).slice(0, lines.length);
    targets.forEach((box, index) => {
      const value = lines[index];
      if (!value) return;
      wipeTextSlot(page, box, textRotateDeg, 1);
      const align = box.align === 'right' || companyAlign === 'right' ? 'right' : 'left';
      drawSafeText(
        page,
        fonts,
        value.slice(0, 90),
        box.x,
        box.y,
        box.size || 7,
        false,
        rgb(0.05, 0.05, 0.08),
        align,
        box.width,
        textRotateDeg,
      );
    });
  } else if (slots.company && lines.length > 0) {
    lines.slice(0, 3).forEach((line, index) => {
      const lineX =
        textRotateDeg === 90
          ? slots.company!.x + 11 * (index + 1)
          : slots.company!.x;
      const lineY =
        textRotateDeg === 90
          ? slots.company!.y
          : Math.max(8, slots.company!.y - 11 * (index + 1));
      drawSafeText(
        page,
        fonts,
        line.slice(0, 90),
        lineX,
        lineY,
        7,
        false,
        rgb(0.05, 0.05, 0.08),
        companyAlign,
        slots.company!.width,
        textRotateDeg,
      );
    });
  }

  // Draw company last so address wipes cannot clip the letterhead name.
  if (slots.company) {
    const size = slots.company.size || slots.company.height || 11;
    const advance = Math.min(
      Math.max(slots.company.width || 0, company.length * size * 0.55) + 8,
      textRotateDeg === 90 ? slots.company.width || 420 : 280,
    );
    wipeTextSlot(
      page,
      {
        ...slots.company,
        width: advance,
        height: size + 2,
        size,
      },
      textRotateDeg,
      2,
    );
    drawSafeText(
      page,
      fonts,
      company,
      slots.company.x,
      slots.company.y,
      size,
      true,
      colorFromHex(slots.company.color),
      companyAlign,
      slots.company.width,
      textRotateDeg,
    );
  }

  const printedBy = (data.printedBy || company || '').trim();
  if (printedBy && slots.footer.printedByValue) {
    const byBox = {
      ...slots.footer.printedByValue,
      width: Math.max(slots.footer.printedByValue.width || 40, printedBy.length * 4),
    };
    wipeTextSlot(page, byBox, textRotateDeg, 1);
    drawSafeText(
      page,
      fonts,
      printedBy.slice(0, 40),
      byBox.x,
      byBox.y,
      byBox.size || 7,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      byBox.width,
      textRotateDeg,
    );
  }

  const printedDate = (data.printedDate || defaultPrintedDate()).trim();
  if (printedDate && slots.footer.printedDateValue) {
    const dateBox = {
      ...slots.footer.printedDateValue,
      width: Math.max(slots.footer.printedDateValue.width || 40, printedDate.length * 4.2),
    };
    wipeTextSlot(page, dateBox, textRotateDeg, 1);
    drawSafeText(
      page,
      fonts,
      printedDate.slice(0, 28),
      dateBox.x,
      dateBox.y,
      dateBox.size || 7,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      dateBox.width,
      textRotateDeg,
    );
  }

  if (slots.footer.pageLabel) {
    const label =
      data.pageLabel ||
      `Page ${pageIndex + 1} of ${pageCount}`;
    const pageBox = {
      ...slots.footer.pageLabel,
      width: Math.max(slots.footer.pageLabel.width || 40, label.length * 4),
    };
    wipeTextSlot(page, pageBox, textRotateDeg, 1);
    drawSafeText(
      page,
      fonts,
      label,
      pageBox.x,
      pageBox.y,
      pageBox.size || 7,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      pageBox.width,
      textRotateDeg,
    );
  }
}

const DOC_TITLE =
  /invoice|quotation|statement|draft|shipment|document|arrival|delivery|notice|manifest|receipt|bill of/i;

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

function drawHeuristicLetterhead(
  page: PDFPage,
  fonts: FaceFonts,
  face: OfficialMeasuredFace,
  facePage: OfficialMeasuredFace['pages'][number],
  data: OfficialFaceData,
  shiftForLogo: boolean,
): void {
  const company = officialCompanyName(data.companyName);
  const slot = letterheadAnchor(face, facePage.texts);
  const letterheadX = shiftForLogo ? Math.max(slot.x, 96) : slot.x;
  const nameWidth = Math.min(190, Math.max(80, company.length * 5.6));
  const wipeWidth = Math.min(Math.max(slot.wipeWidth, nameWidth), face.widthPt * 0.42);
  page.drawRectangle({
    x: letterheadX,
    y: slot.y - 2,
    width: wipeWidth,
    height: (slot.size || 9) + 4,
    color: rgb(1, 1, 1),
  });
  drawSafeText(page, fonts, company, letterheadX, slot.y, slot.size || 11, true);
  const contact = contactLines(data).join('  ');
  if (contact && slot.wipeWidth > 0) {
    drawSafeText(
      page,
      fonts,
      contact.slice(0, 90),
      letterheadX,
      Math.max(8, slot.y - 11),
      7,
      false,
    );
  }
}

function drawFacePage(
  page: PDFPage,
  facePage: OfficialMeasuredFace['pages'][number],
  fonts: FaceFonts,
  face: OfficialMeasuredFace,
  data: OfficialFaceData,
  pageIndex: number,
  pageCount: number,
  slots: ReportBrandingSlots | undefined,
  opts: { shiftLetterheadForLogo?: boolean } = {},
): void {
  const textRotateDeg = Number(face.rotateDeg) || 0;
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
  // Keep footer *labels* only — values are wiped/redrawn from org/session data.
  const footerKeep =
    /^(printed by\s*:?|printed date\s*:?|created by\b.*|powered by|this is a computer)/i;
  for (const run of facePage.texts) {
    const [raw, x, y, size, bold] = run;
    const text = plainLabel(raw || '');
    if (!text || isFresaIdentityText(text)) continue;
    // Rotated footers live on high X; drop sample values (RAM, dates, "of 1")
    // so branding can redraw without stacking on top of the sample.
    if (
      textRotateDeg === 90 &&
      x > face.widthPt - 50 &&
      !footerKeep.test(text)
    ) {
      continue;
    }
    // Portrait footer band — same idea for non-rotated faces.
    if (
      !textRotateDeg &&
      y < 55 &&
      slots?.footer &&
      !footerKeep.test(text) &&
      (/^\d{1,2}[-/][A-Za-z]{3}[-/]\d{2,4}/.test(text) ||
        /^[\w.+-]+@/.test(text) ||
        /^(ram|admin|user)$/i.test(text) ||
        /^of\s+\d+$/i.test(text) ||
        /^\d+\s*\/\s*\d+$/.test(text))
    ) {
      continue;
    }
    if (CHECK_ONLY.test(text)) {
      drawCheckMark(page, x, y, size || 8, textRotateDeg);
      continue;
    }
    // Replace demo beneficiary / letterhead placeholders with org company.
    const drawn = replaceSampleCompanyPlaceholder(text, data.companyName);
    if (!drawn.trim()) continue;
    drawSafeText(
      page,
      fonts,
      drawn,
      x,
      y,
      size || 8,
      Boolean(bold) || (size || 0) >= 12,
      rgb(0.05, 0.05, 0.08),
      'left',
      undefined,
      textRotateDeg,
    );
  }

  if (slots) {
    applyBrandingSlots(page, fonts, slots, data, pageIndex, pageCount, textRotateDeg);
  } else if (pageIndex === 0) {
    drawHeuristicLetterhead(
      page,
      fonts,
      face,
      facePage,
      data,
      Boolean(opts.shiftLetterheadForLogo),
    );
  }

  if (pageIndex !== 0) return;
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
    drawSafeText(
      page,
      fonts,
      value.slice(0, 80),
      field.x,
      field.y,
      field.size || 8,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      undefined,
      textRotateDeg,
    );
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
  doc.registerFontkit(fontkit);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const arimoBytes = await loadFontBytes('/reports-fonts/Arimo-Regular.ttf');
  const arabicBytes = await loadFontBytes('/reports-fonts/NotoNaskhArabic-Regular.ttf');
  const latin = arimoBytes ? await doc.embedFont(arimoBytes, { subset: true }) : helvetica;
  const latinBold = helveticaBold;
  const arabic = arabicBytes
    ? await doc.embedFont(arabicBytes, { subset: true })
    : null;
  const fonts: FaceFonts = { latin, latinBold, arabic };
  const pages = face.pages.length > 0 ? face.pages : [{ rects: [], lines: [], texts: [] }];
  const slots = getReportBrandingSlots(face.code) || getReportBrandingSlots(code);
  const hasLogo = Boolean(data.logoUrl && !/fresa/i.test(data.logoUrl));

  const rotateDeg = Number(face.rotateDeg) || 0;
  for (let index = 0; index < pages.length; index += 1) {
    const facePage = pages[index];
    // Geometry is in mediaBox (unrotated) space. Apply /Rotate so viewers match Fresa.
    const page = doc.addPage([face.widthPt, face.heightPt]);
    if (rotateDeg) page.setRotation(degrees(rotateDeg));
    drawFacePage(page, facePage, fonts, face, data, index, pages.length, slots, {
      shiftLetterheadForLogo: hasLogo && index === 0 && !slots?.logo,
    });
    if (index === 0) {
      await drawOrgLogoInSlot(
        doc,
        page,
        data.logoUrl,
        slots?.logo,
        {
          x: Math.max(14, Math.min(face.branding?.x ?? 20, 28)),
          y: Math.max(face.heightPt - 56, face.heightPt - 40),
          width: 78,
          height: 36,
        },
        rotateDeg,
      );
      // Re-stamp company after the logo wipe so letterhead text is never clipped.
      if (slots?.company) {
        const company = officialCompanyName(data.companyName);
        const size = slots.company.size || slots.company.height || 11;
        const align = slots.company.align === 'right' ? 'right' : 'left';
        const advance = Math.min(
          Math.max(slots.company.width || 0, company.length * size * 0.55) + 8,
          rotateDeg === 90 ? slots.company.width || 420 : 280,
        );
        wipeTextSlot(
          page,
          { ...slots.company, width: advance, height: size + 2, size },
          rotateDeg,
          2,
        );
        drawSafeText(
          page,
          fonts,
          company,
          slots.company.x,
          slots.company.y,
          size,
          true,
          colorFromHex(slots.company.color),
          align,
          slots.company.width,
          rotateDeg,
        );
      }
    }
  }
  const bytes = await doc.save();
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' });
  const fileName = formatPdfFilename(face.code, 'pdf');
  return { blob, fileName, face };
}
