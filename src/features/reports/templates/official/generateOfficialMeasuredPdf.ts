import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { resolveCommercialPdfLogoUrl } from '../../constants/reportBranding.constants';
import {
  defaultFresaLogoSlot,
  ensureReportBrandingChrome,
  getReportBrandingSlots,
} from './brandingSlots';
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
import { code128BitString } from '../referenceAccurate/code128Vector';

function defaultLogoFallback(
  face: OfficialMeasuredFace,
  rotateDeg: number,
): { x: number; y: number; width: number; height: number } {
  const slot = defaultFresaLogoSlot(face.widthPt, face.heightPt, rotateDeg);
  return {
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
  };
}

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
  // HAWB Draft-1 pin uses 4–5pt legal/micro labels — do not clamp those up to 6.
  const fontSize = Math.max(4, Math.min(size || 8, 18));
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

type PageFrame = { left: number; right: number; top: number; bottom: number };

/** Infer the outer content box from long near-edge measured lines. */
function inferOuterFrame(
  facePage: OfficialMeasuredFace['pages'][number],
  widthPt: number,
  heightPt: number,
): PageFrame | null {
  const lines = facePage.lines || [];
  const longH = lines
    .filter((l) => Math.abs(l[1] - l[3]) < 0.75 && Math.abs(l[2] - l[0]) > widthPt * 0.55)
    .map((l) => ({ y: (l[1] + l[3]) / 2, x1: Math.min(l[0], l[2]), x2: Math.max(l[0], l[2]) }));
  const longV = lines
    .filter((l) => Math.abs(l[0] - l[2]) < 0.75 && Math.abs(l[3] - l[1]) > heightPt * 0.45)
    .map((l) => ({ x: (l[0] + l[2]) / 2, y1: Math.min(l[1], l[3]), y2: Math.max(l[1], l[3]) }));
  if (longH.length < 2 || longV.length < 2) return null;
  const top = longH.reduce((best, row) => (row.y > best.y ? row : best), longH[0]);
  const bottom = longH.reduce((best, row) => (row.y < best.y ? row : best), longH[0]);
  const left = longV.reduce((best, col) => (col.x < best.x ? col : best), longV[0]);
  const right = longV.reduce((best, col) => (col.x > best.x ? col : best), longV[0]);
  if (top.y - bottom.y < heightPt * 0.4) return null;
  if (right.x - left.x < widthPt * 0.4) return null;
  return { left: left.x, right: right.x, top: top.y, bottom: bottom.y };
}

/** Re-stroke the outer frame so branding wipes cannot leave a broken box. */
function strokeOuterFrame(page: PDFPage, frame: PageFrame, thickness = 0.6): void {
  const color = ink(0, 0, 0);
  const { left, right, top, bottom } = frame;
  page.drawLine({ start: { x: left, y: top }, end: { x: right, y: top }, thickness, color });
  page.drawLine({ start: { x: left, y: bottom }, end: { x: right, y: bottom }, thickness, color });
  page.drawLine({ start: { x: left, y: bottom }, end: { x: left, y: top }, thickness, color });
  page.drawLine({ start: { x: right, y: bottom }, end: { x: right, y: top }, thickness, color });
}

/** Re-stroke letterhead band edges after logo/company wipes nick the box. */
function strokeHeaderBandBox(
  page: PDFPage,
  band: ReportBrandingBox | null | undefined,
  thickness = 0.55,
): void {
  if (!band || (band.width || 0) < 40 || (band.height || 0) < 20) return;
  if (isRotatedTallHeader(band)) return;
  const color = ink(0, 0, 0);
  const x = band.x;
  const y = band.y;
  const w = band.width;
  const h = band.height;
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderWidth: thickness,
    borderColor: color,
  });
}

/** True when a glyph sits inside a branding chrome box (sample would double-print). */
function overlapsBrandingChromeBox(
  x: number,
  y: number,
  size: number,
  box: ReportBrandingBox | null | undefined,
  pad = 3,
): boolean {
  if (!box) return false;
  const bw = Math.max(box.width || 40, 24);
  const bh = Math.max(box.height || box.size || size || 8, size || 8);
  return x >= box.x - pad && x <= box.x + bw + pad && y >= box.y - pad && y <= box.y + bh + pad;
}

function shouldSkipSampleBrandingGlyph(
  x: number,
  y: number,
  size: number,
  text: string,
  face: OfficialMeasuredFace,
  slots: ReportBrandingSlots | undefined,
  textRotateDeg: number,
): boolean {
  if (!slots?.company && !slots?.logo) return false;
  // Keep form titles / section labels.
  if (
    /^(tax\s*invoice|invoice|quotation|bill of lading|multimodal|shipper|consignee|notify|client|bill\s*to)$/i.test(
      text,
    )
  ) {
    return false;
  }
  const boxes: Array<ReportBrandingBox | null | undefined> = [
    slots.logo,
    slots.company,
    ...(slots.addressLines || []),
    ...(slots.companyWipes || []),
    slots.issuerCompany,
    ...(slots.issuerAddressLines || []),
    slots.preparedByValue,
  ];
  if (boxes.some((b) => overlapsBrandingChromeBox(x, y, size, b))) return true;

  // Invoice / ASN letterhead: right-side sample company+address under the header band.
  // Do not drop form field labels (Invoice No., Job No., Shipper, …).
  if (!textRotateDeg && slots.company && y > face.heightPt * 0.78 && x > face.widthPt * 0.42) {
    if (
      /^(Invoice|Job|Shipper|Consignee|Bill|Client|Due|MBL|MAWB|HAWB|HBL|Shipment|Date|Department|Currency|Reference|IGM|TRN)/i.test(
        text,
      )
    ) {
      return false;
    }
    return true;
  }
  // Ocean HBL agent column sample address (MAGIC FRESA DEMO block) — not legal body.
  if (
    /^(HBL_|FG_HBL_)/i.test(face.code) &&
    x > face.widthPt * 0.48 &&
    y > face.heightPt * 0.68 &&
    y < face.heightPt * 0.92
  ) {
    return !/^(F\/Agent|Bill of Lading|B\/L No|Delivery Agent)/i.test(text);
  }
  return false;
}

/** Tall left strip used by /Rotate 90 landscape samples (Format-2 Tax Invoice India). */
function isRotatedTallHeader(band: ReportBrandingBox | null | undefined): boolean {
  return Boolean(band && (band.height || 0) > (band.width || 1) * 2);
}

/**
 * Keep logo/company inside the letterhead band and below the outer top border
 * so the page frame stays intact (Format-4 Standard Tax Invoice pattern).
 * Skips /Rotate 90 tall strips — those use X as the visual vertical axis.
 */
function fitSlotsInsideHeaderBand(
  slots: ReportBrandingSlots,
  frame: PageFrame | null,
): ReportBrandingSlots {
  const band = slots.headerBand;
  if (!band || (band.height || 0) < 24) return slots;
  // Rotated landscape letterheads are already measured in mediaBox space.
  if (isRotatedTallHeader(band)) return slots;
  const bandTop = band.y + band.height;
  const maxTop = Math.min(bandTop - 4, frame ? frame.top - 4 : bandTop - 4);
  let logo = slots.logo;
  if (logo) {
    const height = Math.min(logo.height || 40, Math.max(24, band.height - 16));
    let y = logo.y;
    if (y + height > maxTop) y = maxTop - height;
    if (y < band.y + 4) y = band.y + 4;
    const x = Math.max(logo.x, band.x + 4);
    logo = { ...logo, x, y, height };
  }
  let company = slots.company;
  if (company) {
    const size = company.size || company.height || 12;
    let y = company.y;
    if (y + size > maxTop) y = maxTop - size;
    if (logo && y > logo.y + logo.height - 2) {
      y = Math.min(y, logo.y + logo.height - 4);
    }
    if (y < band.y + 8) y = band.y + Math.min(band.height - 12, 48);
    company = { ...company, y };
  }
  return { ...slots, logo, company };
}

/**
 * Fresa footer: label then value along the footer axis, with a small gap.
 * Prevents "Printed Date :" colliding with the timestamp (Format-2 / all faces).
 */
function footerValueBox(
  label: ReportBrandingBox | null | undefined,
  value: ReportBrandingBox | null | undefined,
  text: string,
  textRotateDeg: number,
  maxAdvance?: number,
): ReportBrandingBox | null {
  if (!label && !value) return null;
  const size = value?.size || label?.size || 7;
  const needed = Math.max(36, text.length * size * 0.52 + 6);
  const advance = maxAdvance && maxAdvance > 0 ? Math.min(needed, maxAdvance) : needed;
  if (textRotateDeg === 90) {
    const x = value?.x ?? label?.x ?? 0;
    const labelEnd = label ? label.y + (label.width || Math.max(40, size * 6)) : null;
    const y = Math.max(value?.y ?? 0, labelEnd != null ? labelEnd + 3 : 0);
    return { x, y, width: advance, height: size, size };
  }
  const y = value?.y ?? label?.y ?? 0;
  const labelEnd = label ? label.x + (label.width || Math.max(40, size * 6)) : null;
  const x = Math.max(value?.x ?? 0, labelEnd != null ? labelEnd + 3 : 0);
  return { x, y, width: advance, height: size, size };
}

/** True when a wipe box sits on the footer strip (not body content). */
function isFooterStripWipe(
  box: ReportBrandingBox | null | undefined,
  textRotateDeg: number,
  pageWidth: number,
  pageHeight: number,
): boolean {
  if (!box) return false;
  if (textRotateDeg === 90) return box.x > pageWidth - 55;
  if (textRotateDeg === 270) return box.x < 55;
  return box.y < 55 || box.y + (box.height || 0) < 60;
}

/** Light title strip between two long horizontals when a centred title sits there. */
function paintTitleBands(
  page: PDFPage,
  facePage: OfficialMeasuredFace['pages'][number],
  widthPt: number,
  frame: PageFrame | null,
): void {
  const lines = facePage.lines || [];
  const horiz = lines
    .filter((l) => Math.abs(l[1] - l[3]) < 0.75 && Math.abs(l[2] - l[0]) > widthPt * 0.55)
    .map((l) => (l[1] + l[3]) / 2)
    .sort((a, b) => b - a);
  const titles = (facePage.texts || []).filter((t) =>
    /^(tax\s*invoice|invoice|quotation|delivery\s*order|arrival\s*notice|debit\s*note|credit\s*note)$/i.test(
      plainLabel(t[0] || ''),
    ),
  );
  if (!titles.length || horiz.length < 2) return;
  const left = frame?.left ?? 20;
  const right = frame?.right ?? widthPt - 20;
  for (const title of titles) {
    const ty = title[2];
    let above: number | null = null;
    let below: number | null = null;
    for (const y of horiz) {
      if (y > ty + 2 && (above === null || y < above)) above = y;
      if (y < ty - 2 && (below === null || y > below)) below = y;
    }
    if (above === null || below === null) continue;
    const height = above - below;
    if (height < 12 || height > 36) continue;
    page.drawRectangle({
      x: left,
      y: below,
      width: Math.max(40, right - left),
      height,
      color: rgb(0.953, 0.953, 0.953),
    });
  }
}

function wipeBox(
  page: PDFPage,
  box: ReportBrandingBox | null | undefined,
  pad = 1,
  clamp?: PageFrame | null,
): void {
  if (!box) return;
  let x = Math.max(0, box.x - pad);
  let y = Math.max(0, box.y - pad);
  let width = Math.max(4, (box.width || 40) + pad * 2);
  let height = Math.max(4, (box.height || box.size || 8) + pad * 2);
  // Never erase the outer page frame with branding wipes.
  if (clamp) {
    const inset = 1.25;
    const maxX = clamp.right - inset;
    const maxY = clamp.top - inset;
    const minX = clamp.left + inset;
    const minY = clamp.bottom + inset;
    x = Math.max(x, minX);
    y = Math.max(y, minY);
    width = Math.min(width, Math.max(2, maxX - x));
    height = Math.min(height, Math.max(2, maxY - y));
  }
  page.drawRectangle({
    x,
    y,
    width,
    height,
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
  clamp?: PageFrame | null,
): void {
  if (!box) return;
  if (textRotateDeg === 90) {
    const band = Math.max(box.height || 0, box.size || 8, 8);
    const advance = Math.max(box.width || 40, 12);
    wipeBox(
      page,
      { x: box.x, y: box.y, width: band, height: advance },
      pad,
      clamp,
    );
    return;
  }
  if (textRotateDeg === 270) {
    const band = Math.max(box.height || 0, box.size || 8, 8);
    const advance = Math.max(box.width || 40, 12);
    wipeBox(
      page,
      { x: box.x, y: box.y - advance, width: band, height: advance },
      pad,
      clamp,
    );
    return;
  }
  wipeBox(page, box, pad, clamp);
}

/** Fresa footer timestamps look like `28-JAN-19 01:54PM`. */
function defaultPrintedDate(): string {
  const now = new Date();
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const dd = String(now.getDate()).padStart(2, '0');
  const mon = months[now.getMonth()];
  const yy = String(now.getFullYear()).slice(-2);
  let hours = now.getHours();
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours).padStart(2, '0');
  return `${dd}-${mon}-${yy} ${hh}:${mi}${ampm}`;
}

function footerInk(colorHex?: string | null) {
  if (colorHex && /^#fff/i.test(colorHex.trim())) return rgb(1, 1, 1);
  return rgb(0.05, 0.05, 0.08);
}

/** True when face bold flag or Fresa-style emphasis (titles / company headers). */
function isEmphasizedRun(text: string, boldFlag: unknown, size: number): boolean {
  if (Boolean(boldFlag)) return true;
  if (size >= 12) return true;
  return /^(tax\s*invoice|invoice|quotation|debit\s*note|credit\s*note|bill of lading|multimodal transport|arrival notice)$/i.test(
    text.trim(),
  );
}

function absolutizeFetchUrl(logoUrl: string): string {
  const trimmed = logoUrl.trim();
  if (!trimmed) return '';
  if (/^(data:|blob:|https?:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/') && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${trimmed}`;
  }
  return trimmed;
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
    const absolute = absolutizeFetchUrl(logoUrl);
    if (!absolute) return null;
    if (!/^https?:/i.test(absolute) && !absolute.startsWith('/')) return null;
    const response = await fetch(absolute, { credentials: 'include' });
    if (!response.ok) return null;
    const type = (response.headers.get('content-type') || '').toLowerCase();
    const bytes = new Uint8Array(await response.arrayBuffer());
    const kind = type.includes('png')
      ? 'png'
      : type.includes('jpeg') || type.includes('jpg')
        ? 'jpg'
        : bytes[0] === 0x89 && bytes[1] === 0x50
          ? 'png'
          : bytes[0] === 0xff && bytes[1] === 0xd8
            ? 'jpg'
            : null;
    if (!kind) return null;
    return { bytes, kind };
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
  clamp?: PageFrame | null,
): Promise<boolean> {
  const candidates = [logoUrl, resolveCommercialPdfLogoUrl()].filter(
    (u): u is string => Boolean(u && String(u).trim() && !/fresa/i.test(String(u))),
  );
  let loaded: { bytes: Uint8Array; kind: 'png' | 'jpg' } | null = null;
  for (const candidate of candidates) {
    loaded = await loadLogoBytes(candidate);
    if (loaded) break;
  }
  if (!loaded) return false;
  const image =
    loaded.kind === 'png' ? await pdf.embedPng(loaded.bytes) : await pdf.embedJpg(loaded.bytes);
  const box = slot || fallback;
  // Fit inside the measured box with inset so the mark does not crowd borders
  // or letterhead text. Never upscale past native pixels (oversized logos overlap).
  const boxW = Math.max(24, box.width || 78);
  const boxH = Math.max(16, box.height || 36);
  const inset = 0.78;
  const maxWidth = Math.max(18, boxW * inset);
  const maxHeight = Math.max(12, boxH * inset);
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = Math.max(1, image.width * scale);
  const height = Math.max(1, image.height * scale);
  const x = box.x + Math.max(0, (boxW - width) / 2);
  const y = box.y + Math.max(0, (boxH - height) / 2);
  // Tight wipe — avoid eating the outer letterhead frame.
  wipeBox(
    page,
    { x: x - 1, y: y - 1, width: width + 2, height: height + 2 },
    0,
    clamp,
  );
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

/** Fresa letterhead shows address + web under the company name (not phone/email first). */
function contactLines(data: OfficialFaceData, letterheadStyle = false): string[] {
  const ordered = letterheadStyle
    ? [data.companyAddress, data.companyWeb, data.companyPhone, data.companyEmail]
    : [data.companyAddress, data.companyPhone, data.companyEmail, data.companyWeb];
  return ordered
    .map((part) => (part || '').trim())
    .filter((part) => part && !isFresaIdentityText(part));
}

function wipeIsInHeaderBand(
  wipe: ReportBrandingBox,
  slots: ReportBrandingSlots,
  textRotateDeg: number,
): boolean {
  const band = slots.headerBand;
  if (textRotateDeg === 90 && band) {
    return wipe.x <= band.x + band.width + 4;
  }
  if (band) {
    return wipe.y + (wipe.height || wipe.size || 8) >= band.y - 4;
  }
  return true;
}

function boxesOverlap(
  a: ReportBrandingBox,
  b: ReportBrandingBox,
  pad = 2,
  textRotateDeg = 0,
): boolean {
  // /Rotate 90: width is advance along +Y, height/size is the glyph band along X.
  if (textRotateDeg === 90) {
    const ax = a.x;
    const aw = Math.max(a.height || 0, a.size || 8, 8);
    const ay = a.y;
    const ah = Math.max(a.width || 40, 12);
    const bx = b.x;
    const bw = Math.max(b.height || 0, b.size || 8, 8);
    const by = b.y;
    const bh = Math.max(b.width || 40, 12);
    return !(
      ax + aw + pad < bx ||
      bx + bw + pad < ax ||
      ay + ah + pad < by ||
      by + bh + pad < ay
    );
  }
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
  clamp?: PageFrame | null,
  pageSize?: { width: number; height: number },
): void {
  const pageWidth = pageSize?.width ?? 595;
  const pageHeight = pageSize?.height ?? 842;
  // Wipe only letterhead branding — never body Client/IGM cells.
  for (const wipe of slots.companyWipes || []) {
    if (!wipeIsInHeaderBand(wipe, slots, textRotateDeg)) continue;
    wipeTextSlot(page, wipe, textRotateDeg, 1, clamp);
  }
  for (const line of slots.addressLines || []) {
    if (slots.company && boxesOverlap(line, slots.company, 4, textRotateDeg)) continue;
    if (!wipeIsInHeaderBand(line, slots, textRotateDeg)) continue;
    wipeTextSlot(page, line, textRotateDeg, 1, clamp);
  }
  wipeTextSlot(page, slots.company, textRotateDeg, 1, clamp);
  // Only wipe Powered By when the slot sits on the footer strip (never body cells).
  if (
    slots.footer.poweredByWipe &&
    isFooterStripWipe(slots.footer.poweredByWipe, textRotateDeg, pageWidth, pageHeight)
  ) {
    if (textRotateDeg === 90) {
      wipeTextSlot(page, slots.footer.poweredByWipe, 90, 1);
    } else {
      wipeBox(page, slots.footer.poweredByWipe, 2);
    }
  } else if (textRotateDeg === 90 && slots.footer.pageLabel && slots.footer.printedDateLabel) {
    // Synthesize a Powered By wipe between Printed Date and Page on the footer strip.
    const dateLabel = slots.footer.printedDateLabel;
    const pageLab = slots.footer.pageLabel;
    const wipeY = (dateLabel.y || 0) + (dateLabel.width || 40) + 50;
    const wipeH = Math.max(40, (pageLab.y || 0) - wipeY - 8);
    if (wipeH > 20) {
      wipeTextSlot(
        page,
        {
          x: pageLab.x,
          y: wipeY,
          width: wipeH,
          height: Math.max(pageLab.height || 8, 10),
          size: 8,
        },
        90,
        1,
      );
    }
  }
  wipeTextSlot(page, slots.footer.printedByValue, textRotateDeg, 1);
  wipeTextSlot(page, slots.footer.printedDateValue, textRotateDeg, 1);

  if (pageIndex !== 0) return;

  const company = officialCompanyName(data.companyName);
  const letterheadStyle = isRotatedTallHeader(slots.headerBand);
  const isHblFace = /^(HBL_|FG_HBL_)/i.test(slots.code || '');
  // HKG-style: F/Agent gets city only; Tel/Email sit under the logo issuer block.
  const lines =
    isHblFace && slots.issuerCompany
      ? [(data.companyAddress || '').trim()].filter(Boolean)
      : contactLines(data, letterheadStyle);
  const companyAlign = slots.company?.align === 'right' ? 'right' : 'left';
  const band = slots.headerBand;
  // Clamp company into the letterhead strip so chrome never lands on IGM/body.
  // Ocean HBL: org chrome stays in the agent/carrier column (right half).
  let companySlot =
    slots.company && band && letterheadStyle
      ? {
          ...slots.company,
          x: Math.min(
            Math.max(slots.company.x, band.x + 2),
            band.x + Math.max(8, band.width - 14),
          ),
        }
      : slots.company;
  if (isHblFace && companySlot && companySlot.x < pageWidth * 0.4) {
    companySlot = null;
  }
  const addressSlots = (slots.addressLines || []).filter((box) => {
    if (!wipeIsInHeaderBand(box, slots, textRotateDeg)) return false;
    if (!companySlot) return true;
    if (boxesOverlap(box, companySlot, 4, textRotateDeg)) return false;
    return (
      Math.abs(box.x - companySlot.x) > 2 ||
      Math.abs(box.y - companySlot.y) > 2
    );
  });
  if (addressSlots.length > 0 && lines.length > 0) {
    const uniqueY = [
      ...new Map(addressSlots.map((b) => [`${Math.round(b.y)}:${Math.round(b.x)}`, b])).values(),
    ].sort((a, b) => b.y - a.y || a.x - b.x);
    const belowCompany = uniqueY.filter((b) => {
      if (!companySlot) return true;
      // Rotated letterhead: "below" company is toward +X (visual down).
      if (textRotateDeg === 90) return b.x > companySlot.x + 4;
      return b.y < companySlot.y - 4;
    });
    const targets = (belowCompany.length >= 1 ? belowCompany : uniqueY).slice(0, lines.length);
    // One contiguous wipe clears leftover sample address fragments (overlap fix).
    if (!textRotateDeg && targets.length > 0) {
      const left = Math.min(...targets.map((b) => b.x)) - 2;
      const right = Math.max(...targets.map((b) => b.x + (b.width || 160)));
      const top = Math.max(...targets.map((b) => b.y + (b.size || 8))) + 2;
      const bottom = Math.min(...targets.map((b) => b.y)) - 2;
      wipeBox(
        page,
        {
          x: left,
          y: bottom,
          width: Math.max(40, right - left),
          height: Math.max(10, top - bottom),
        },
        1,
        clamp,
      );
    }
    let lastY = companySlot?.y ?? targets[0]?.y ?? 0;
    targets.forEach((box, index) => {
      const value = lines[index];
      if (!value) return;
      const drawBox =
        textRotateDeg === 90 && band
          ? {
              ...box,
              x: Math.min(Math.max(box.x, band.x + 2), band.x + band.width - 8),
            }
          : box;
      // Keep contact lines on distinct baselines (avoids "Dubai, UAE+971" glue).
      let drawY = drawBox.y;
      if (!textRotateDeg && index > 0 && Math.abs(drawY - lastY) < 8) {
        drawY = lastY - 9;
      }
      lastY = drawY;
      wipeTextSlot(
        page,
        { ...drawBox, y: drawY },
        textRotateDeg,
        1,
        clamp,
      );
      const align = drawBox.align === 'right' || companyAlign === 'right' ? 'right' : 'left';
      drawSafeText(
        page,
        fonts,
        value.slice(0, 90),
        drawBox.x,
        drawY,
        drawBox.size || 7,
        false,
        colorFromHex(drawBox.color || companySlot?.color, rgb(0.06, 0.3, 0.59)),
        align,
        Math.min(drawBox.width || 200, textRotateDeg === 90 ? pageHeight - drawY - 16 : 220),
        textRotateDeg,
      );
    });
  } else if (companySlot && lines.length > 0) {
    // Wipe a clean band under the company name before drawing contact lines.
    if (!textRotateDeg) {
      wipeBox(
        page,
        {
          x: companyAlign === 'right' ? companySlot.x - 40 : companySlot.x,
          y: Math.max(8, companySlot.y - 40),
          width: Math.min(260, (companySlot.width || 200) + 48),
          height: 44,
        },
        1,
        clamp,
      );
    }
    lines.slice(0, 3).forEach((line, index) => {
      let lineX =
        textRotateDeg === 90
          ? companySlot.x + 10 * (index + 1)
          : companySlot.x;
      if (textRotateDeg === 90 && band) {
        lineX = Math.min(lineX, band.x + band.width - 8);
      }
      const lineY =
        textRotateDeg === 90
          ? companySlot.y
          : Math.max(
              band ? band.y + 6 : 8,
              companySlot.y - 11 * (index + 1),
            );
      drawSafeText(
        page,
        fonts,
        line.slice(0, 90),
        lineX,
        lineY,
        7,
        false,
        colorFromHex(companySlot.color, rgb(0.06, 0.3, 0.59)),
        companyAlign,
        Math.min(companySlot.width || 200, textRotateDeg === 90 ? pageHeight - lineY - 16 : 220),
        textRotateDeg,
      );
    });
  }

  // Draw company last so address wipes cannot clip the letterhead name.
  if (companySlot) {
    const size = companySlot.size || companySlot.height || 11;
    const maxAdvance =
      textRotateDeg === 90
        ? Math.min(companySlot.width || 420, Math.max(120, pageHeight - companySlot.y - 24))
        : 280;
    const advance = Math.min(
      Math.max(companySlot.width || 0, company.length * size * 0.55) + 8,
      maxAdvance,
    );
    wipeTextSlot(
      page,
      {
        ...companySlot,
        width: advance,
        height: size + 2,
        size,
      },
      textRotateDeg,
      1,
      clamp,
    );
    drawSafeText(
      page,
      fonts,
      company,
      companySlot.x,
      companySlot.y,
      size,
      true,
      colorFromHex(companySlot.color, rgb(0, 0, 0)),
      companyAlign,
      advance,
      textRotateDeg,
    );
  }

  // Ocean HBL issuer block under the agent logo (Fresa FRESA DEMO INDIA band).
  const issuer = slots.issuerCompany;
  if (issuer && company) {
    const size = issuer.size || issuer.height || 8;
    const advance = Math.min(
      220,
      Math.max(issuer.width || 0, company.length * size * 0.55) + 8,
    );
    // Clear sample FRESA DEMO / Mumbai address so Tel/Email do not stack on it.
    wipeBox(
      page,
      {
        x: issuer.x - 2,
        y: Math.max(8, issuer.y - 48),
        width: Math.min(240, advance + 40),
        height: 56,
      },
      1,
      clamp,
    );
    wipeTextSlot(
      page,
      { ...issuer, width: advance, height: size + 2, size },
      textRotateDeg,
      1,
      clamp,
    );
    drawSafeText(
      page,
      fonts,
      company,
      issuer.x,
      issuer.y,
      size,
      true,
      colorFromHex(issuer.color, rgb(0, 0, 0)),
      'left',
      advance,
      textRotateDeg,
    );
    const issuerTexts = [
      data.companyPhone ? `Tel: ${data.companyPhone}` : '',
      data.companyEmail ? `Email: ${data.companyEmail}` : '',
    ].filter(Boolean);
    const issuerSlots = (slots.issuerAddressLines || []).slice(0, issuerTexts.length);
    if (issuerSlots.length > 0) {
      issuerSlots.forEach((box, index) => {
        const text = issuerTexts[index];
        if (!text) return;
        wipeTextSlot(page, box, textRotateDeg, 1, clamp);
        drawSafeText(
          page,
          fonts,
          text.slice(0, 90),
          box.x,
          box.y,
          box.size || 7,
          false,
          rgb(0.05, 0.05, 0.08),
          'left',
          Math.min(box.width || 200, 220),
          textRotateDeg,
        );
      });
    } else {
      issuerTexts.forEach((text, index) => {
        drawSafeText(
          page,
          fonts,
          text.slice(0, 90),
          issuer.x,
          Math.max(8, issuer.y - 11 * (index + 1)),
          7,
          false,
          rgb(0.05, 0.05, 0.08),
          'left',
          220,
          textRotateDeg,
        );
      });
    }
  }

  const preparedBy = (data.printedBy || data.companyEmail || company || '').trim();
  if (preparedBy && slots.preparedByValue) {
    const box = slots.preparedByValue;
    wipeTextSlot(page, box, textRotateDeg, 1, clamp);
    drawSafeText(
      page,
      fonts,
      preparedBy.slice(0, 48),
      box.x,
      box.y,
      box.size || 8,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      Math.min(box.width || 160, 200),
      textRotateDeg,
    );
  }

  if (company && slots.signatureBy) {
    const box = slots.signatureBy;
    const byLine = `By ${company}`;
    // Wipe static "By" label + sample issuer so we redraw a single Fresa-style line.
    wipeTextSlot(
      page,
      {
        x: 310,
        y: box.y,
        width: Math.max(box.width || 160, byLine.length * (box.size || 8) * 0.55 + 12),
        height: (box.size || 8) + 2,
        size: box.size || 8,
      },
      textRotateDeg,
      1,
      clamp,
    );
    drawSafeText(
      page,
      fonts,
      byLine.slice(0, 60),
      313,
      box.y,
      box.size || 8,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      220,
      textRotateDeg,
    );
  }

  // Fresa footer: Printed By : | Printed Date : | Page n of m (Powered By wiped).
  paintFresaFooterStrip(
    page,
    fonts,
    slots,
    data,
    company,
    pageIndex,
    pageCount,
    textRotateDeg,
    pageWidth,
    pageHeight,
  );
}

/**
 * Stamp the Fresa footer strip at measured slots so layout matches the pin:
 * `Printed By : {user}    Printed Date :{date}    Page {n} of {m}`
 * Never paints "Powered By : Fresa …" (identity wipe only).
 */
function paintFresaFooterStrip(
  page: PDFPage,
  fonts: FaceFonts,
  slots: ReportBrandingSlots,
  data: OfficialFaceData,
  company: string,
  pageIndex: number,
  pageCount: number,
  textRotateDeg: number,
  pageWidth: number,
  pageHeight: number,
): void {
  const footer = slots.footer;
  if (!footer) return;
  // Rotated faces keep measured slot geometry (advance along +Y); portrait gets
  // the Fresa one-line strip layout.
  if (textRotateDeg === 90 || textRotateDeg === 270) {
    const printedBy = (data.printedBy || company || '').trim();
    const byBox = footerValueBox(
      footer.printedByLabel,
      footer.printedByValue,
      printedBy.slice(0, 40),
      textRotateDeg,
      160,
    );
    if (printedBy && byBox) {
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
    const dateBox = footerValueBox(
      footer.printedDateLabel,
      footer.printedDateValue,
      printedDate.slice(0, 28),
      textRotateDeg,
      140,
    );
    if (printedDate && dateBox) {
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
    if (footer.pageLabel) {
      const label = data.pageLabel || `Page ${pageIndex + 1} of ${pageCount}`;
      wipeTextSlot(page, footer.pageLabel, textRotateDeg, 1);
      drawSafeText(
        page,
        fonts,
        label,
        footer.pageLabel.x,
        footer.pageLabel.y,
        footer.pageLabel.size || 7,
        false,
        rgb(0.05, 0.05, 0.08),
        'left',
        Math.max(footer.pageLabel.width || 40, label.length * 4),
        textRotateDeg,
      );
    }
    return;
  }
  const y =
    footer.printedByLabel?.y ??
    footer.printedByValue?.y ??
    footer.printedDateValue?.y ??
    footer.pageLabel?.y ??
    22;
  const size =
    footer.printedByLabel?.size ||
    footer.printedByValue?.size ||
    footer.printedDateLabel?.size ||
    7;
  const colorHint =
    footer.printedByLabel?.color ||
    footer.printedByValue?.color ||
    footer.printedDateLabel?.color ||
    '';
  const lightOnDark = /^#fff/i.test(String(colorHint).trim());
  // White slot colour often means text on a coloured footer chip (Format-1). Prefer
  // black ink on a wiped strip unless we know the chip must stay (lightOnDark).
  const ink = lightOnDark ? rgb(1, 1, 1) : rgb(0.05, 0.05, 0.08);
  // Format-1 maps sample "User :" mid-chip; Fresa pin starts "Printed By :" at the left.
  let byLabelX = footer.printedByLabel?.x ?? 22;
  let byValueX =
    footer.printedByValue?.x ?? byLabelX + (footer.printedByLabel?.width || 48) + 4;
  if (lightOnDark && byLabelX > 40) {
    byLabelX = 16;
    byValueX = 70;
  }
  const dateLabelX =
    footer.printedDateLabel?.x ??
    (footer.printedDateValue ? Math.max(200, footer.printedDateValue.x - 70) : 245);
  const dateValueX =
    footer.printedDateValue?.x ?? dateLabelX + (footer.printedDateLabel?.width || 55) + 2;
  const pageX = footer.pageLabel?.x ?? Math.max(500, pageWidth - 90);

  // Clear sample User:/emails/Powered By. Skip full wipe on coloured chip footers
  // so Format-1 blue/amber/red bars are not erased.
  if (!textRotateDeg && !lightOnDark) {
    wipeBox(
      page,
      { x: Math.min(14, byLabelX - 2), y: y - 2, width: pageWidth - 28, height: size + 6 },
      0,
    );
  }

  const stamp = (
    text: string,
    x: number,
    bold = false,
    maxW = 160,
  ) => {
    drawSafeText(
      page,
      fonts,
      text,
      x,
      y,
      size,
      bold,
      ink,
      'left',
      maxW,
      textRotateDeg,
    );
  };

  // Labels always use Fresa wording (not "User :" / "Created By :").
  stamp('Printed By :', byLabelX, false, 55);
  const printedBy = (data.printedBy || company || '').trim();
  if (printedBy) stamp(printedBy.slice(0, 42), byValueX, false, 150);

  stamp('Printed Date :', dateLabelX, false, 70);
  const printedDate = (data.printedDate || defaultPrintedDate()).trim();
  // Fresa pin: `Printed Date :28-JAN-19 01:54PM` (value follows label slot).
  if (printedDate) stamp(printedDate.slice(0, 28), dateValueX, false, 130);

  const pageLabel =
    data.pageLabel || `Page ${pageIndex + 1} of ${pageCount}`;
  stamp(pageLabel, pageX, false, 80);
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
  opts: { shiftLetterheadForLogo?: boolean; frame?: PageFrame | null } = {},
): void {
  const textRotateDeg = Number(face.rotateDeg) || 0;
  const pageArea = face.widthPt * face.heightPt;
  const frame = opts.frame ?? null;
  if (!textRotateDeg) {
    paintTitleBands(page, facePage, face.widthPt, frame);
  }
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
  // Footer strip is fully redrawn by paintFresaFooterStrip — skip all sample footer glyphs.
  const footerKeep =
    /^(printed by\s*:?|printed date\s*:?|created by\b.*|powered by|this is a computer|user\s*:)/i;
  const isHblFacePage = /^(HBL_|FG_HBL_)/i.test(face.code);
  const isHawbFacePage = /^HAWB_/i.test(face.code);
  const isInvoiceFacePage = /^INVOICE_REPORT_FORMAT_/i.test(face.code);
  const hawbDemoLeftover =
    /BABU|AL NASER|FRESA|176-?23456882|\d{3}\|[A-Z0-9]+\|\d+|[A-Z]{3}\/[A-Z]{3}\/\d+|MAA\/DXB|1,?250\.00|EK9876|18-FEB|20-FEB|STC:|CTN\s|N\.V\.D|AS PER INV|N\.C\.V|^NIL$|^INR$|^DXB$|^PP$|AS ARRANGED|^RAM$|PAPER CUPS|DIMS IN|CHENNAI, INDIA|DUBAI INTERNATIONAL|NEELANKARAI|MAKTHOOM|UNITED ARAB|SHARJAH|PHONE:|04-233|CAE190028|GLOBAL EXPORT|GULF IMPORT|^100$|^0\.00$|TOTAL\s*:\s*\(|EMIRATES|PACKAGES ONLY/i;
  // Invoice sample party/demo leftovers (Format 2/14/15/17): wipe+label skip alone
  // misses same-column Consignee blocks and rotated Format 2 value glyphs.
  const invoiceDemoLeftover =
    /BABU|AL NASER|FRESA\s*DEMO|YOUR COMPANY NAME|4G\s*LOGISTICS|GLOBAL EXPORT|GULF IMPORT/i;
  // When the job/invoice is bound, drop Fresa demo party glyphs so live stamps
  // do not stack on top of 4G / AL NASER sample lines (wipe alone is unreliable).
  const skipHblPartySamples = isHblFacePage && Boolean(data.entityBound);
  const hblPartyBands = skipHblPartySamples
    ? collectHblPartyBands(facePage, face)
    : [];
  const invoiceSampleKeys =
    isInvoiceFacePage && data.entityBound
      ? collectInvoiceSampleValueRuns(facePage, face)
      : null;
  for (const run of facePage.texts) {
    const [raw, x, y, size, bold] = run;
    const text = plainLabel(raw || '');
    if (!text || isFresaIdentityText(text)) continue;
    // HAWB measured faces: never leave pin demo cargo glyphs under live stamps.
    if (isHawbFacePage && hawbDemoLeftover.test(text)) continue;
    if (isInvoiceFacePage && data.entityBound && invoiceDemoLeftover.test(text)) continue;
    if (
      skipHblPartySamples &&
      isInsideHblPartyBand(x, y, text, face.widthPt, hblPartyBands)
    ) {
      continue;
    }
    if (
      invoiceSampleKeys?.has(
        `${Math.round(x * 10)}:${Math.round(y * 10)}:${text.slice(0, 40)}`,
      )
    ) {
      continue;
    }
    // Drop sample letterhead/agent glyphs that branding slots will redraw — prevents
    // Tamil Nadu / FRESA DEMO / Tel lines stacking under org address.
    if (
      slots &&
      shouldSkipSampleBrandingGlyph(x, y, size || 8, text, face, slots, textRotateDeg)
    ) {
      continue;
    }
    // Ocean HBL: sample Tel/Email/By/agent-city are org chrome — redraw from slots.
    if (
      isHblFacePage &&
      (/^Tel\s*:/i.test(text) ||
        /^Email\s*:/i.test(text) ||
        /^By\s*$/i.test(text) ||
        (/^DUBAI\b/i.test(text) && x > face.widthPt * 0.45))
    ) {
      continue;
    }
    // Rotated footers live on high X; drop sample values (RAM, dates, "of 1")
    // so branding can redraw without stacking on top of the sample.
    if (
      textRotateDeg === 90 &&
      x > face.widthPt - 50 &&
      !footerKeep.test(text)
    ) {
      continue;
    }
    // Portrait footer band — paintFresaFooterStrip owns this strip (no sample overlap).
    if (!textRotateDeg && y < 55 && slots?.footer) {
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
      isEmphasizedRun(drawn, bold, size || 8),
      rgb(0.05, 0.05, 0.08),
      'left',
      undefined,
      textRotateDeg,
    );
  }

  if (slots) {
    applyBrandingSlots(
      page,
      fonts,
      slots,
      data,
      pageIndex,
      pageCount,
      textRotateDeg,
      frame,
      { width: face.widthPt, height: face.heightPt },
    );
  } else if (pageIndex === 0 && !/^HAWB_/i.test(face.code)) {
    // HAWB Issued-by sits right of shipper — heuristic top-left letterhead would overlap.
    drawHeuristicLetterhead(
      page,
      fonts,
      face,
      facePage,
      data,
      Boolean(opts.shiftLetterheadForLogo),
    );
  }

  const isHawbFaceEarly = /^HAWB_/i.test(face.code);
  // HAWB Draft-1 is a 9-page copy set — stamp every face. Other formats: page 0 only.
  if (pageIndex !== 0 && !isHawbFaceEarly) return;
  // /Rotate 90 measured fieldSlots are often mediaBox-misaligned vs the visible
  // sample values (Format-2 Tax Invoice India). Stamping them double-prints and
  // can land on IGM/body cells — skip until slots are re-extracted.
  if (textRotateDeg === 90 || textRotateDeg === 270) return;
  const isHblFace = /^(HBL_|FG_HBL_)/i.test(face.code);
  const values: Record<string, string> = {
    shipper: (data.shipperLines || []).filter(Boolean).join('\n'),
    consignee: (data.consigneeLines || []).filter(Boolean).join('\n'),
    notify: (data.notifyLines || []).filter(Boolean).join('\n'),
    jobNumber: data.jobNumber || '',
    referenceNo: data.referenceNo || '',
    invoiceNumber: data.invoiceNumber || '',
    hawbNo: data.hawbNo || '',
    hblNo: data.hblNo || '',
    mawbNo: data.mawbNo || '',
    pieces: data.pieces || '',
    grossWeight: data.grossWeight || '',
    chargeableWeight: data.chargeableWeight || '',
    nature: data.nature || '',
    handling: data.handling || '',
    accounting: data.accounting || '',
    packagesLine: data.packagesLine || '',
    departure: data.departure || '',
    destination: data.destination || '',
    flightDate: data.flightDate || '',
    toCode: data.toCode || '',
    currency: data.currency || '',
    declaredCarriage: data.declaredCarriage || '',
    declaredCustoms: data.declaredCustoms || '',
    insurance: data.insurance || '',
    carrier: data.carrier || '',
    byCarrier: data.byCarrier || data.carrier || '',
    executedOn: data.executedOn || '',
    executedAt: data.executedAt || '',
    total: data.total || '',
    rateCharge: data.rateCharge || '',
    prepaidMark: data.prepaidMark || '',
    carrierSign: data.carrierSign || '',
    companyPhone: data.companyPhone || '',
    companyName: officialCompanyName(data.companyName),
    cargo: data.nature || data.handling || '',
  };

  const isHawbFace = isHawbFaceEarly;
  if (isHawbFace) {
    stampHawbMultiLine(page, fonts, face, 'shipper', data.shipperLines, textRotateDeg, frame);
    stampHawbMultiLine(page, fonts, face, 'consignee', data.consigneeLines, textRotateDeg, frame);
    stampHawbMultiLine(page, fonts, face, 'notify', data.notifyLines, textRotateDeg, frame);
    stampHawbMultiLine(
      page,
      fonts,
      face,
      'nature',
      String(data.nature || '')
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean),
      textRotateDeg,
      frame,
    );
  }

  // HBL: measured fieldSlots for parties often sit on the label row. When the
  // record is bound, stamp live parties at the sample value anchors (left column).
  if (isHblFace && data.entityBound) {
    stampHblPartyBlock(page, fonts, facePage, face, 'Shipper', data.shipperLines, frame);
    stampHblPartyBlock(page, fonts, facePage, face, 'Consignee', data.consigneeLines, frame);
    stampHblPartyBlock(page, fonts, facePage, face, 'Notify', data.notifyLines, frame);
    const blAnchor = facePage.texts.find(
      (run) =>
        /^[A-Z0-9]{6,}$/i.test(String(run[0] || '').trim()) &&
        (run[1] || 0) > face.widthPt * 0.55 &&
        (run[2] || 0) > face.heightPt * 0.9,
    );
    if (values.hblNo && blAnchor) {
      const size = blAnchor[3] || 9;
      wipeTextSlot(
        page,
        {
          x: blAnchor[1],
          y: blAnchor[2],
          width: Math.min(200, values.hblNo.length * size * 0.55 + 8),
          height: size + 2,
          size,
        },
        textRotateDeg,
        1,
        frame,
      );
      drawSafeText(
        page,
        fonts,
        values.hblNo.slice(0, 40),
        blAnchor[1],
        blAnchor[2],
        size,
        false,
        rgb(0.05, 0.05, 0.08),
        'left',
        undefined,
        textRotateDeg,
      );
    }
  }

  // Invoice portrait: stamp Bill To / Shipper / Consignee / Invoice No at sample
  // value anchors (fieldSlots often sit on the label, not the value cell).
  const isInvoiceFace = /^INVOICE_REPORT_FORMAT_/i.test(face.code);
  if (isInvoiceFace && data.entityBound) {
    const billTo =
      (data.billToLines || []).filter(Boolean).join(', ') ||
      (data.consigneeLines || []).filter(Boolean).join(', ') ||
      (data.shipperLines || []).filter(Boolean).join(', ');
    stampInvoiceLabeledValue(page, fonts, facePage, face, 'Bill\\s*To', billTo, frame);
    stampInvoiceLabeledValue(
      page,
      fonts,
      facePage,
      face,
      'Shipper',
      (data.shipperLines || []).filter(Boolean).join(', '),
      frame,
    );
    stampInvoiceLabeledValue(
      page,
      fonts,
      facePage,
      face,
      'Consignee',
      (data.consigneeLines || []).filter(Boolean).join(', '),
      frame,
    );
    stampInvoiceLabeledValue(
      page,
      fonts,
      facePage,
      face,
      'Invoice\\s*No',
      data.invoiceNumber,
      frame,
    );
    stampInvoiceLabeledValue(
      page,
      fonts,
      facePage,
      face,
      'Job\\s*No',
      data.jobNumber,
      frame,
    );
    stampInvoiceLabeledValue(
      page,
      fonts,
      facePage,
      face,
      'HBL',
      data.hblNo,
      frame,
    );
    stampInvoiceLabeledValue(
      page,
      fonts,
      facePage,
      face,
      'Client',
      billTo,
      frame,
    );
  }

  for (const field of face.fieldSlots) {
    // HBL parties / hblNo handled above via sample anchors when entity-bound.
    if (
      isHblFace &&
      (field.key === 'shipper' ||
        field.key === 'consignee' ||
        field.key === 'notify' ||
        field.key === 'hblNo')
    ) {
      continue;
    }
    // HAWB multi-line parties / nature stamped above.
    if (
      isHawbFace &&
      (field.key === 'shipper' ||
        field.key === 'consignee' ||
        field.key === 'notify' ||
        field.key === 'nature')
    ) {
      continue;
    }
    // Invoice parties/doc nos stamped at label-adjacent sample anchors above.
    if (
      isInvoiceFace &&
      data.entityBound &&
      (field.key === 'shipper' ||
        field.key === 'consignee' ||
        field.key === 'invoiceNumber' ||
        field.key === 'jobNumber' ||
        field.key === 'hblNo' ||
        field.key === 'referenceNo')
    ) {
      continue;
    }
    // HAWB: one stamp per key (first slot) except multi-line parties handled above.
    if (isHawbFace && field.key === 'companyName') {
      const first = face.fieldSlots.find((s) => s.key === 'companyName');
      if (first && (first.x !== field.x || first.y !== field.y)) continue;
    }
    if (
      isHawbFace &&
      !['shipper', 'consignee', 'notify', 'nature', 'prepaidMark'].includes(field.key)
    ) {
      const first = face.fieldSlots.find((s) => s.key === field.key);
      if (first && (first.x !== field.x || first.y !== field.y)) continue;
    }
    // Skip stray handling stamps in the cargo table (keep left CTN-under-pieces slot).
    if (
      isHawbFace &&
      field.key === 'handling' &&
      field.y < face.heightPt * 0.45 &&
      field.x > 80
    ) {
      continue;
    }
    // Misclassified "cargo" slot lands in the kg column on Draft-1 — nature already stamped.
    if (isHawbFace && field.key === 'cargo') continue;
    // Draft-1 footer HAWB NO is drawn in stampHawbDraft1Chrome at pin size 11.
    if (/HAWB_DRAFT_REPORT_FORMAT_1$/i.test(face.code) && field.key === 'hawbNo') continue;
    const value = values[field.key];
    if (!value || isFresaIdentityText(value)) continue;
    const size = field.size || 8;
    const lines = value.split(/\n/).map((l) => l.trim()).filter(Boolean);
    lines.slice(0, 3).forEach((line, lineIndex) => {
      const y = field.y - lineIndex * (size * 1.15);
      const advance = Math.min(
        isHawbFace ? 280 : 220,
        Math.max(40, line.length * size * 0.55 + 10),
      );
      wipeTextSlot(
        page,
        {
          x: Math.max(0, field.x - 1),
          y: y - 1,
          width: advance,
          height: size + (isHawbFace ? 5 : 2),
          size,
        },
        textRotateDeg,
        1,
        frame,
      );
      drawSafeText(
        page,
        fonts,
        line.slice(0, isHawbFace ? 100 : 80),
        field.x,
        y,
        size,
        false,
        rgb(0.05, 0.05, 0.08),
        'left',
        undefined,
        textRotateDeg,
      );
    });
  }

  // Draft-1 pin: top-right inverted HAWB NO badge + Issued-by company under title
  // (on every copy face — Fresa 9-page set is identical).
  if (/HAWB_DRAFT_REPORT_FORMAT_1$/i.test(face.code)) {
    stampHawbDraft1Chrome(page, fonts, face, data, textRotateDeg, frame);
  }
  // Draft / Draft-2: fill agent / Issued-by / cargo marks the fieldSlots miss.
  if (
    /^HAWB_DRAFT_REPORT_FORMAT$/i.test(face.code) ||
    /^HAWB_DRAFT_REPORT_FORMAT_2$/i.test(face.code)
  ) {
    stampHawbDraftDenseChrome(page, fonts, face, data, textRotateDeg, frame);
  }
}

/** Fresa Draft-1 chrome missing from fieldSlots: black HAWB badge + title company. */
function stampHawbDraft1Chrome(
  page: PDFPage,
  fonts: FaceFonts,
  face: OfficialMeasuredFace,
  data: OfficialFaceData,
  textRotateDeg: number,
  frame: PageFrame | null,
): void {
  const hawb = String(data.hawbNo || '').trim();
  const mawb = String(data.mawbNo || '').trim();
  const hawbLabel = hawb
    ? /^HAWB NO\./i.test(hawb)
      ? hawb
      : `HAWB NO. ${hawb}`
    : '';
  const mawbLabel = mawb
    ? /^MAWB NO\./i.test(mawb)
      ? mawb
      : `MAWB NO. ${mawb}`
    : '';

  if (hawbLabel) {
    // Pin: black inverted badge @ ~415.9,799 (11pt). Keep clear of HOUSE AIR WAYBILL.
    const size = 11;
    const x = 416;
    const y = 799;
    const padX = 6;
    const maxW = 170;
    let badge = hawbLabel;
    while (badge.length > 8 && fonts.latinBold.widthOfTextAtSize(badge, size) > maxW - padX * 2) {
      badge = badge.slice(0, -1);
    }
    if (badge.length < hawbLabel.length) badge = `${badge.slice(0, -1)}…`;
    const w = Math.min(maxW, fonts.latinBold.widthOfTextAtSize(badge, size) + padX * 2);
    const h = size + 6;
    wipeTextSlot(page, { x, y: y - 2, width: w, height: h, size }, textRotateDeg, 1, frame);
    page.drawRectangle({
      x,
      y: y - 2,
      width: w,
      height: h,
      color: rgb(0, 0, 0),
    });
    drawSafeText(
      page,
      fonts,
      badge,
      x + padX,
      y,
      size,
      true,
      rgb(1, 1, 1),
      'left',
      undefined,
      textRotateDeg,
    );
  }

  const company = officialCompanyName(data.companyName);
  if (company && !isFresaIdentityText(company)) {
    const size = 11;
    const x = 282;
    const y = 744.8;
    wipeTextSlot(
      page,
      { x, y: y - 1, width: Math.min(280, company.length * size * 0.55 + 8), height: size + 4, size },
      textRotateDeg,
      1,
      frame,
    );
    drawSafeText(page, fonts, company, x, y, size, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Pin job block: MAWB NO. / HAWB NO. under JOB NO. (285,667.6 / 285,656.6).
  if (mawbLabel) {
    drawSafeText(page, fonts, mawbLabel, 285, 667.6, 9, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }
  if (hawbLabel) {
    drawSafeText(page, fonts, hawbLabel, 285, 656.6, 9, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Second PP mark (WT/VAL PPD) — pin has PP @ 316.8 and 353.8.
  if (String(data.prepaidMark || '').trim()) {
    drawSafeText(page, fonts, 'PP', 316.8, 509.3, 10, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Pin cargo kg column "K" @ 149,383.7
  if (data.pieces || data.grossWeight) {
    drawSafeText(page, fonts, 'K', 149, 383.7, 9, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Pin Weight Charge + Total Prepaid "AS ARRANGED" when rate/total use that convention.
  const arranged = /AS ARRANGED/i.test(`${data.total || ''} ${data.rateCharge || ''}`);
  if (arranged) {
    drawSafeText(page, fonts, 'AS ARRANGED', 46.9, 203.4, 8, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
    drawSafeText(page, fonts, 'AS ARRANGED', 44.4, 60.4, 8, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Footer HAWB badge text — pin size 11 @ 392,29.9
  if (hawbLabel) {
    drawSafeText(page, fonts, hawbLabel, 392, 29.9, 11, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }
}

/**
 * Draft / Draft-2 chrome the promote pass left thin: top AWB strip, Issued-by
 * carrier, agent name, kg/rate-class marks, CTN under pieces, charge zeros.
 */
function stampHawbDraftDenseChrome(
  page: PDFPage,
  fonts: FaceFonts,
  face: OfficialMeasuredFace,
  data: OfficialFaceData,
  textRotateDeg: number,
  frame: PageFrame | null,
): void {
  const isDraft2 = /FORMAT_2$/i.test(face.code);
  const mawb = String(data.mawbNo || '').trim();
  const hawb = String(data.hawbNo || '').trim();
  const company = officialCompanyName(data.companyName);
  const carrier = String(data.carrier || '').trim();

  // Top AWB strip (Draft pin: left pipe form + right dashed). Skip Draft-2 badges.
  if (!isDraft2 && (mawb || hawb)) {
    const digits = (mawb || hawb).replace(/\D/g, '');
    const left =
      digits.length >= 11
        ? `${digits.slice(0, 3)}|${(data.toCode || 'MAA').slice(0, 5)}|${digits.slice(3)}`
        : (mawb || hawb).replace(/-/g, '|');
    const right = mawb || hawb;
    drawSafeText(page, fonts, left, 13, 828.1, 11, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
    drawSafeText(page, fonts, right, 513.1, 828.1, 11, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Issued by — Draft carrier @ 345,786.3; Draft-2 title company @ 353.9,772.2
  if (!isDraft2 && carrier) {
    drawSafeText(page, fonts, carrier, 345, 786.3, 10, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }
  if (isDraft2 && company && !isFresaIdentityText(company)) {
    drawSafeText(page, fonts, company, 353.9, 772.2, 12, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Agent name under "Issuing Carrier's Agent" (both Draft + Draft-2 pin @ 13,617.5)
  if (company && !isFresaIdentityText(company)) {
    drawSafeText(page, fonts, company, 13, 617.5, 8, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Cargo marks: K + rate class S (Draft S@138; Draft-2 S@140) + charge zeros
  if (data.pieces || data.grossWeight) {
    drawSafeText(page, fonts, 'K', 124, 403.4, 8, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
    if (data.nature) {
      drawSafeText(
        page,
        fonts,
        'S',
        isDraft2 ? 140 : 138,
        403.4,
        8,
        false,
        rgb(0.05, 0.05, 0.08),
        'left',
        undefined,
        textRotateDeg,
      );
    }
    const zero = data.total?.trim() || '0.00';
    drawSafeText(page, fonts, zero, 64.9, 215.9, 7, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
    drawSafeText(page, fonts, zero, 64.9, 76.9, 7, false, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
  }

  // Draft-2 HAWB ref beside "HAWB NO." (pin @ 458,829.9 / 458,37.9)
  if (isDraft2 && hawb) {
    const ref = hawb.replace(/^HAWB NO\.\s*/i, '').trim();
    if (ref) {
      drawSafeText(page, fonts, ref, 458, 829.9, 9, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
      drawSafeText(page, fonts, ref, 458, 37.9, 9, true, rgb(0.05, 0.05, 0.08), 'left', undefined, textRotateDeg);
    }
  }

  void face;
  void frame;
}

/** Stamp successive HAWB party/nature lines onto measured fieldSlots (top→bottom). */
function stampHawbMultiLine(
  page: PDFPage,
  fonts: FaceFonts,
  face: OfficialMeasuredFace,
  key: string,
  lines: string[] | undefined,
  textRotateDeg: number,
  frame: PageFrame | null,
): void {
  const rows = (lines || []).map((l) => String(l || '').trim()).filter(Boolean);
  if (!rows.length) return;
  const slots = face.fieldSlots
    .filter((s) => s.key === key)
    .sort((a, b) => b.y - a.y);
  if (!slots.length) return;
  // Never stack multiple lines on the same baseline (was causing phone/email
  // to paint over city on the last shipper/consignee slot).
  const capped = rows.slice(0, slots.length);
  // Left party column must not spill into JOB/AGENT (≈ x 280).
  const maxWidth =
    key === 'shipper' || key === 'consignee' || key === 'notify' ? 250 : 280;
  capped.forEach((line, index) => {
    const slot = slots[index];
    if (!slot || isFresaIdentityText(line)) return;
    const size = slot.size || 8;
    let draw = line;
    while (draw.length > 4 && fonts.latin.widthOfTextAtSize(draw, size) > maxWidth - 4) {
      draw = draw.slice(0, -1);
    }
    if (draw.length < line.length) draw = `${draw.slice(0, -1)}…`;
    const advance = Math.min(maxWidth, Math.max(40, draw.length * size * 0.55 + 8));
    wipeTextSlot(
      page,
      { x: slot.x, y: slot.y, width: advance, height: size + 2, size },
      textRotateDeg,
      1,
      frame,
    );
    drawSafeText(
      page,
      fonts,
      draw.slice(0, 90),
      slot.x,
      slot.y,
      size,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      undefined,
      textRotateDeg,
    );
  });
}

type HblPartyBand = { topY: number; bottomY: number };

const HBL_PARTY_KEYS = ['shipper', 'consignee', 'notify'] as const;

/** Left-column party value bands — labels and/or measured fieldSlots (MAGIC has no Shipper label). */
function collectHblPartyBands(
  facePage: OfficialMeasuredFace['pages'][number],
  face: OfficialMeasuredFace,
): HblPartyBand[] {
  const anchors: number[] = [];
  for (const run of facePage.texts) {
    if (
      /^(Shipper|Consignee|Notify)/i.test(String(run[0] || '')) &&
      (run[1] || 0) < face.widthPt * 0.45
    ) {
      anchors.push(run[2] || 0);
    }
  }
  for (const slot of face.fieldSlots || []) {
    if (HBL_PARTY_KEYS.includes(slot.key as (typeof HBL_PARTY_KEYS)[number])) {
      anchors.push(slot.y);
    }
  }
  // DEMO-* sample party lines with no nearby label (MAGIC shipper cell).
  for (const run of facePage.texts) {
    if (
      (run[1] || 0) < face.widthPt * 0.48 &&
      /^(DEMO[- ]|LIVE )/i.test(String(run[0] || ''))
    ) {
      anchors.push((run[2] || 0) + 12);
    }
  }
  const tops = [...new Set(anchors.map((y) => Math.round(y * 10) / 10))].sort(
    (a, b) => b - a,
  );
  const bands: HblPartyBand[] = [];
  for (let i = 0; i < tops.length; i++) {
    const topY = tops[i] + 2;
    const next = tops[i + 1];
    const bottomY = next != null ? next + 2 : tops[i] - 95;
    bands.push({ topY, bottomY: Math.min(bottomY, tops[i] - 8) });
  }
  return bands;
}

function isInsideHblPartyBand(
  x: number,
  y: number,
  text: string,
  pageWidth: number,
  bands: HblPartyBand[],
): boolean {
  if (x >= pageWidth * 0.48) return false;
  if (/^(Shipper|Consignee|Notify)/i.test(text)) return false;
  return bands.some((b) => y < b.topY && y > b.bottomY);
}

function hblPartyFieldKey(labelWord: string): (typeof HBL_PARTY_KEYS)[number] | null {
  const lower = labelWord.toLowerCase();
  if (lower.startsWith('ship')) return 'shipper';
  if (lower.startsWith('consign')) return 'consignee';
  if (lower.startsWith('notify')) return 'notify';
  return null;
}

/** Draw live multi-line party text under a HBL label (sample glyphs already skipped). */
function stampHblPartyBlock(
  page: PDFPage,
  fonts: FaceFonts,
  facePage: OfficialMeasuredFace['pages'][number],
  face: OfficialMeasuredFace,
  labelWord: string,
  lines: string[] | undefined,
  frame?: PageFrame | null,
): void {
  const live = (lines || []).map((l) => String(l || '').trim()).filter(Boolean);
  if (!live.length) return;
  const labelRe = new RegExp(`^${labelWord}`, 'i');
  const label = facePage.texts.find(
    (run) => labelRe.test(String(run[0] || '')) && (run[1] || 0) < face.widthPt * 0.45,
  );
  const slotKey = hblPartyFieldKey(labelWord);
  const slot = slotKey
    ? face.fieldSlots.find((f) => f.key === slotKey)
    : undefined;
  // MAGIC has no "Shipper" label — fall back to the measured fieldSlot / DEMO sample.
  const labelY = label?.[2] ?? (slot ? slot.y + 12 : 0);
  if (!labelY && !slot) return;
  const sampleLines = facePage.texts
    .filter(
      (run) =>
        (run[1] || 0) < face.widthPt * 0.48 &&
        (run[2] || 0) <= labelY - 1 &&
        (run[2] || 0) > labelY - 95 &&
        !/^(Shipper|Consignee|Notify|Place of|Vessel|Port|Container|Job)/i.test(
          String(run[0] || ''),
        ),
    )
    .sort((a, b) => (b[2] || 0) - (a[2] || 0));
  const top = sampleLines[0];
  const x = top?.[1] ?? slot?.x ?? (label?.[1] ?? 20) + 1;
  const y0 = top?.[2] ?? slot?.y ?? labelY - 14;
  const size = top?.[3] || slot?.size || 8;
  // Clear residual ink across the party cell before redrawing live lines.
  wipeTextSlot(
    page,
    {
      x: Math.max(14, x - 1),
      y: y0 - 42,
      width: face.widthPt * 0.42,
      height: 56,
      size,
    },
    0,
    1,
    frame,
  );
  live.slice(0, 4).forEach((line, index) => {
    drawSafeText(
      page,
      fonts,
      line.slice(0, 70),
      x,
      y0 - index * (size + 3),
      size,
      false,
      rgb(0.05, 0.05, 0.08),
      'left',
      face.widthPt * 0.42,
      0,
    );
  });
}

/**
 * Invoice faces: sample party/doc values sit to the right of labels OR in the
 * same column under Shipper/Consignee headers (Format 14/15/17). fieldSlots
 * often land on the label. Skip those sample glyphs when bound, then stamp
 * live values at the sample anchors.
 */
function isInvoiceSampleNearLabel(
  lx: number,
  ly: number,
  tx: number,
  ty: number,
  labelText: string,
): boolean {
  const partyHeader = /^(Shipper|Consignee|Bill\s*To|Client)\b/i.test(labelText);
  // Same row, value to the right of the label.
  if (tx > lx + 8 && tx < lx + 240 && Math.abs(ty - ly) <= 3) return true;
  // Value block under the label (multi-line Bill To / Client).
  if (tx > lx + 8 && tx < lx + 240 && ty < ly - 2 && ty > ly - 52) return true;
  // Same-column party block under SHIPPER / CONSIGNEE headers (Format 14 family).
  if (
    partyHeader &&
    Math.abs(tx - lx) <= 6 &&
    ty < ly - 2 &&
    ty > ly - 56
  ) {
    return true;
  }
  return false;
}

function collectInvoiceSampleValueRuns(
  facePage: OfficialMeasuredFace['pages'][number],
  face: OfficialMeasuredFace,
): Set<string> {
  const keys = new Set<string>();
  const labelRe =
    /^(Bill\s*To|Client|Shipper|Consignee|Invoice\s*No|Job\s*No|MBL|MAWB|HAWB|HBL|Shipment\s*No)/i;
  const labels = facePage.texts.filter(
    (run) => labelRe.test(String(run[0] || '')) && (run[1] || 0) < face.widthPt * 0.92,
  );
  for (const label of labels) {
    const lx = label[1] || 0;
    const ly = label[2] || 0;
    const labelText = String(label[0] || '');
    for (const run of facePage.texts) {
      const tx = run[1] || 0;
      const ty = run[2] || 0;
      const text = String(run[0] || '');
      if (labelRe.test(text)) continue;
      if (!isInvoiceSampleNearLabel(lx, ly, tx, ty, labelText)) continue;
      keys.add(`${Math.round(tx * 10)}:${Math.round(ty * 10)}:${text.slice(0, 40)}`);
    }
  }
  return keys;
}

function stampInvoiceLabeledValue(
  page: PDFPage,
  fonts: FaceFonts,
  facePage: OfficialMeasuredFace['pages'][number],
  face: OfficialMeasuredFace,
  labelWord: string,
  value: string | undefined,
  frame?: PageFrame | null,
): void {
  const live = String(value || '').trim();
  if (!live) return;
  const labelRe = new RegExp(`^${labelWord}`, 'i');
  const label = facePage.texts.find((run) => labelRe.test(String(run[0] || '')));
  if (!label) return;
  const lx = label[1] || 0;
  const ly = label[2] || 0;
  const labelText = String(label[0] || '');
  const samples = facePage.texts
    .filter(
      (run) =>
        !labelRe.test(String(run[0] || '')) &&
        isInvoiceSampleNearLabel(lx, ly, run[1] || 0, run[2] || 0, labelText),
    )
    .sort((a, b) => (b[2] || 0) - (a[2] || 0) || (a[1] || 0) - (b[1] || 0));
  const sample = samples[0];
  const sameColumn = sample != null && Math.abs((sample[1] || 0) - lx) <= 6;
  const x = sample?.[1] ?? (sameColumn ? lx : lx + 110);
  const y = sample?.[2] ?? ly;
  const size = sample?.[3] || 8;
  const wipeBottom = Math.min(y, ...samples.map((s) => s[2] || y)) - 2;
  const wipeTop = Math.max(y + size, ly + 2);
  // Stop before the next label on the same row (Bill To must not erase Invoice No.).
  const nextLabelX = facePage.texts
    .filter(
      (run) =>
        Math.abs((run[2] || 0) - ly) <= 4 &&
        (run[1] || 0) > x + 24 &&
        /^(Invoice|Job|Shipper|Consignee|Due|MBL|MAWB|HAWB|HBL|Shipment|Date|Department|Client|Bill)/i.test(
          String(run[0] || ''),
        ),
    )
    .map((run) => run[1] || 0)
    .sort((a, b) => a - b)[0];
  const wipeW = Math.max(
    48,
    Math.min(
      sameColumn ? 220 : 180,
      face.widthPt * 0.34,
      nextLabelX != null ? nextLabelX - x - 6 : sameColumn ? 220 : 180,
    ),
  );
  wipeBox(
    page,
    {
      x: x - 1,
      y: wipeBottom,
      width: wipeW,
      height: Math.max(size + 4, wipeTop - wipeBottom),
    },
    1,
    frame,
  );
  drawSafeText(
    page,
    fonts,
    live.slice(0, 55),
    x,
    y,
    size,
    false,
    rgb(0.05, 0.05, 0.08),
    'left',
    wipeW,
    0,
  );
}

function drawMeasuredBarcode(
  page: PDFPage,
  box: ReportBrandingBox | null | undefined,
  value: string | undefined,
): void {
  if (!box || box.width < 1 || box.height < 1) return;
  const payload = String(value || '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!payload || /fresa/i.test(payload)) return;
  const bits = code128BitString(payload);
  if (!bits) return;
  const quiet = 10;
  const padded = `${'0'.repeat(quiet)}${bits}${'0'.repeat(quiet)}`;
  const moduleWidth = box.width / padded.length;
  page.drawRectangle({
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    color: rgb(1, 1, 1),
  });
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
  const arimoBoldBytes = await loadFontBytes('/reports-fonts/Arimo-Bold.ttf');
  const arabicBytes = await loadFontBytes('/reports-fonts/NotoNaskhArabic-Regular.ttf');
  const latin = arimoBytes ? await doc.embedFont(arimoBytes, { subset: true }) : helvetica;
  const latinBold = arimoBoldBytes
    ? await doc.embedFont(arimoBoldBytes, { subset: true })
    : helveticaBold;
  const arabic = arabicBytes
    ? await doc.embedFont(arabicBytes, { subset: true })
    : null;
  const fonts: FaceFonts = { latin, latinBold, arabic };
  const pages = face.pages.length > 0 ? face.pages : [{ rects: [], lines: [], texts: [] }];
  const isHawbFaceDoc = /^HAWB_/i.test(face.code);
  // HAWB Fresa samples have no invoice Printed-By footer / blue letterhead chrome.
  const rawSlots = isHawbFaceDoc
    ? null
    : getReportBrandingSlots(face.code) || getReportBrandingSlots(code);
  const rotateDeg = Number(face.rotateDeg) || 0;
  const firstPage = pages[0];
  const frame =
    !rotateDeg && firstPage
      ? inferOuterFrame(firstPage, face.widthPt, face.heightPt)
      : null;
  const slots = isHawbFaceDoc
    ? undefined
    : fitSlotsInsideHeaderBand(ensureReportBrandingChrome(rawSlots, face), frame);
  const hasLogo = Boolean(data.logoUrl && !/fresa/i.test(data.logoUrl));

  for (let index = 0; index < pages.length; index += 1) {
    const facePage = pages[index];
    // Geometry is in mediaBox (unrotated) space. Apply /Rotate so viewers match Fresa.
    const page = doc.addPage([face.widthPt, face.heightPt]);
    if (rotateDeg) page.setRotation(degrees(rotateDeg));
    drawFacePage(page, facePage, fonts, face, data, index, pages.length, slots, {
      shiftLetterheadForLogo: hasLogo && index === 0 && !rawSlots?.logo,
      frame: index === 0 ? frame : null,
    });
    if (index === 0) {
      const isHblFace = /^(HBL_|FG_HBL_)/i.test(face.code);
      const isHawbFace = /^HAWB_/i.test(face.code);
      // HBL/HAWB: never invent a top-left invoice logo (lands in Shipper). Measured
      // agent/carrier / Issued-by logo slots are still painted when present.
      if (slots?.logo || (!isHblFace && !isHawbFace)) {
        await drawOrgLogoInSlot(
          doc,
          page,
          data.logoUrl,
          slots?.logo ?? null,
          isHblFace || isHawbFace
            ? {
                x: slots!.logo!.x,
                y: slots!.logo!.y,
                width: slots!.logo!.width,
                height: slots!.logo!.height,
              }
            : defaultLogoFallback(face, rotateDeg),
          rotateDeg,
          frame,
        );
      }
      // Re-stamp company after the logo wipe so letterhead text is never clipped.
      if (slots?.company) {
        const company = officialCompanyName(data.companyName);
        const band = slots.headerBand;
        const companySlot =
          band && isRotatedTallHeader(band)
            ? {
                ...slots.company,
                x: Math.min(
                  Math.max(slots.company.x, band.x + 2),
                  band.x + Math.max(8, band.width - 14),
                ),
              }
            : slots.company;
        const size = companySlot.size || companySlot.height || 11;
        const align = companySlot.align === 'right' ? 'right' : 'left';
        const maxAdvance =
          rotateDeg === 90
            ? Math.min(
                companySlot.width || 420,
                Math.max(120, face.heightPt - companySlot.y - 24),
              )
            : 280;
        const advance = Math.min(
          Math.max(companySlot.width || 0, company.length * size * 0.55) + 8,
          maxAdvance,
        );
        wipeTextSlot(
          page,
          { ...companySlot, width: advance, height: size + 2, size },
          rotateDeg,
          1,
          frame,
        );
        drawSafeText(
          page,
          fonts,
          company,
          companySlot.x,
          companySlot.y,
          size,
          true,
          colorFromHex(companySlot.color),
          align,
          advance,
          rotateDeg,
        );
      }
      if (slots?.barcode) {
        const fromFace = facePage.texts.find((run) =>
          /^[A-Z0-9]{8,}$/i.test(String(run[0] || '').trim()),
        );
        const barcodeValue =
          data.hblNo ||
          data.referenceNo ||
          data.hawbNo ||
          String(fromFace?.[0] || '').trim();
        drawMeasuredBarcode(page, slots.barcode, barcodeValue);
      }
      // Branding wipes can nick letterhead / page boxes — restore frames last.
      strokeHeaderBandBox(page, slots?.headerBand, 0.55);
      if (frame) strokeOuterFrame(page, frame, 0.55);
    }
  }
  const bytes = await doc.save();
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' });
  const fileName = formatPdfFilename(face.code, 'pdf');
  return { blob, fileName, face };
}
