import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { embedOrganizationPdfLogo } from '@/features/organization/utils/embedOrganizationPdfLogo';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';

/** A4 portrait defaults — Letter override via model.pageSize. */
const A4_W = 595.28;
const A4_H = 841.89;
const LETTER_W = 612;
const LETTER_H = 792;
const MARGIN = 32;

const NAVY = rgb(0.039, 0.161, 0.259); // #0A2942
const ORANGE = rgb(0.957, 0.447, 0.078); // #F47214
const TEXT = rgb(0.102, 0.118, 0.141);
const MUTED = rgb(0.45, 0.48, 0.52);
const LABEL = rgb(0.5, 0.53, 0.56);
const RULE = rgb(0.82, 0.84, 0.86);
const PANEL_BG = rgb(0.965, 0.968, 0.973);
const PANEL_BORDER = rgb(0.88, 0.895, 0.91);
const BALANCE_BG = rgb(1, 0.925, 0.85);
const WORDS_BG = rgb(0.925, 0.945, 0.965);
const WHITE = rgb(1, 1, 1);
const ROW_ALT = rgb(0.988, 0.99, 0.992);

export type InvoicePdfBillTo = {
  client?: string;
  attn?: string;
  phone?: string;
  email?: string;
  addressLines?: string[];
  vatNumber?: string;
};

export type InvoicePdfShipment = {
  blAwb?: string;
  vesselFlight?: string;
  pol?: string;
  pod?: string;
  containerNo?: string;
  etdEta?: string;
  commodity?: string;
  grossWtCbm?: string;
};

export type InvoicePdfChargeLine = {
  description: string;
  detail?: string;
  qty?: number;
  unit?: string;
  rate?: number;
  amount?: number;
};

export type InvoicePdfCompany = {
  name?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  website?: string;
  /** Tenant organization logo URL (preferred over bundled product asset). */
  logoUrl?: string;
};

/** Organization → Bank Accounts row for the tax-invoice payment block. */
export type InvoicePdfBankAccount = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  currencyCode?: string;
  isDefault?: boolean;
};

export type InvoicePdfModel = {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  jobRef?: string;
  currencyCode?: string;
  vatRate?: number;
  copyLabel?: string;
  /** Large header title — default `INVOICE`. Use `CREDIT NOTE` / `DEBIT NOTE` for notes. */
  documentTitle?: string;
  /** Muted line under title — default tax-invoice subtitle. */
  documentSubtitle?: string;
  /** Right meta panel heading — default `INVOICE DETAILS`. */
  detailsSectionTitle?: string;
  /** Meta row label for document number — default `Invoice No.`. */
  numberLabel?: string;
  /** Meta row label for document date — default `Invoice Date`. */
  dateLabel?: string;
  /** Meta row label for due/validity — default `Due Date`. Use `Valid Until` for quotations. */
  dueDateLabel?: string;
  /** Meta row label for job/ref — default `Job / Ref No.`. */
  jobRefLabel?: string;
  /** When true, omit Advance Received / Balance Due (quotations). */
  hideAdvanceBalance?: boolean;
  /**
   * `statement` = tax-invoice / quotation face (default).
   * `commercial_note` = credit/debit body (CUSTOMER | SHIP TO | meta + QTY table)
   * while keeping the same KingFisher header/footer chrome.
   */
  layout?: 'statement' | 'commercial_note';
  /** Page size — default A4. USA formats may use Letter. */
  pageSize?: 'A4' | 'Letter';
  billTo: InvoicePdfBillTo;
  /** Optional ship-to block for commercial_note layout (falls back to billTo). */
  shipTo?: InvoicePdfBillTo;
  shipment?: InvoicePdfShipment;
  lines: InvoicePdfChargeLine[];
  subtotal?: number;
  discount?: number;
  taxableAmount?: number;
  vatAmount?: number;
  otherCharges?: number;
  grandTotal?: number;
  advanceReceived?: number;
  balanceDue?: number;
  remarks?: string;
  company?: InvoicePdfCompany;
  /** Active organization bank accounts (default first) for remittance details. */
  bankAccounts?: InvoicePdfBankAccount[];
  /**
   * Quotations pass this so they keep their own native face instead of the
   * default tax-invoice face.
   */
  skipNativeFresaFace?: boolean;
};

function money(value: number | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '0.00';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtDate(raw?: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return safePdfText(raw) || '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function onesWords(n: number): string {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (n < 20) return ones[n] ?? '';
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${tens[t]}${o ? `-${ones[o]}` : ''}`;
}

function chunkToWords(n: number): string {
  if (n === 0) return '';
  if (n < 100) return onesWords(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return `${onesWords(h)} Hundred${rest ? ` ${onesWords(rest)}` : ''}`;
}

/** e.g. "AED Eight Thousand Eighty-Five Dirhams Only" */
export function invoiceAmountInWords(amount: number, currencyCode?: string): string {
  if (!Number.isFinite(amount)) return '';
  const abs = Math.abs(amount);
  const whole = Math.floor(abs);
  const fils = Math.round((abs - whole) * 100);
  const parts: string[] = [];
  const billions = Math.floor(whole / 1_000_000_000);
  const millions = Math.floor((whole % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((whole % 1_000_000) / 1000);
  const rem = whole % 1000;
  if (billions) parts.push(`${chunkToWords(billions)} Billion`);
  if (millions) parts.push(`${chunkToWords(millions)} Million`);
  if (thousands) parts.push(`${chunkToWords(thousands)} Thousand`);
  if (rem || parts.length === 0) parts.push(chunkToWords(rem) || 'Zero');
  let words = parts.join(' ');
  const cur = (currencyCode || 'AED').trim().toUpperCase();
  if (cur === 'AED') {
    words = `${cur} ${words} Dirhams`;
    if (fils > 0) words += ` and ${onesWords(fils) || String(fils)} Fils`;
    return `${words} Only`;
  }
  if (fils > 0) words += ` and ${onesWords(fils) || String(fils)}/100`;
  return `${cur} ${words} Only`;
}

function measure(font: PDFFont, text: string, size: number): number {
  if (!text) return 0;
  return font.widthOfTextAtSize(text, size);
}

function fit(font: PDFFont, text: string, size: number, maxW: number): string {
  const t = safePdfText(text);
  if (!t || measure(font, t, size) <= maxW) return t;
  let out = t;
  while (out.length > 1 && measure(font, `${out}...`, size) > maxW) out = out.slice(0, -1);
  return out ? `${out}...` : '';
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

function drawRoundedRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  opts: { color?: ReturnType<typeof rgb>; borderColor?: ReturnType<typeof rgb>; borderWidth?: number },
): void {
  const radius = Math.min(r, h / 2, w / 2);
  // Approximate pill/rounded rect with overlapping shapes (pdf-lib has no native roundRect).
  page.drawRectangle({
    x: x + radius,
    y,
    width: w - radius * 2,
    height: h,
    color: opts.color,
    borderColor: opts.borderColor,
    borderWidth: opts.borderWidth,
  });
  page.drawRectangle({
    x,
    y: y + radius,
    width: w,
    height: h - radius * 2,
    color: opts.color,
  });
  page.drawCircle({
    x: x + radius,
    y: y + radius,
    size: radius,
    color: opts.color,
  });
  page.drawCircle({
    x: x + w - radius,
    y: y + radius,
    size: radius,
    color: opts.color,
  });
  page.drawCircle({
    x: x + radius,
    y: y + h - radius,
    size: radius,
    color: opts.color,
  });
  page.drawCircle({
    x: x + w - radius,
    y: y + h - radius,
    size: radius,
    color: opts.color,
  });
}

function sectionTitle(page: PDFPage, title: string, x: number, y: number, fontBold: PDFFont): void {
  page.drawRectangle({ x, y: y - 1, width: 2.8, height: 9, color: ORANGE });
  drawText(page, title, x + 8, y, 8, fontBold, NAVY);
}

function drawPanel(
  page: PDFPage,
  x: number,
  yBottom: number,
  w: number,
  h: number,
): void {
  page.drawRectangle({
    x,
    y: yBottom,
    width: w,
    height: h,
    color: PANEL_BG,
    borderColor: PANEL_BORDER,
    borderWidth: 0.6,
  });
}

function labeledValue(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  labelW: number,
  valueMaxW: number,
  font: PDFFont,
  fontBold: PDFFont,
): void {
  drawText(page, `${label}:`, x, y, 7.5, font, LABEL);
  drawText(page, fit(fontBold, value || '—', 8, valueMaxW), x + labelW, y, 8, fontBold, TEXT);
}

function wrapLines(font: PDFFont, text: string, size: number, maxW: number, maxLines = 8): string[] {
  const raw = safePdfText(text);
  if (!raw) return [];
  const words = raw.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (measure(font, next, size) <= maxW) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

function drawMiniIcon(
  page: PDFPage,
  kind: 'phone' | 'mail' | 'web',
  x: number,
  y: number,
): void {
  page.drawCircle({ x: x + 4, y: y + 3, size: 5, color: NAVY });
  // Tiny glyph marker inside (WinAnsi-safe letters)
  // letter drawn by caller if needed — keep as solid navy disc with orange center
  page.drawCircle({ x: x + 4, y: y + 3, size: 2.2, color: kind === 'phone' ? ORANGE : WHITE });
}

/**
 * Client-side KingFisher tax invoice PDF (portrait A4).
 * Default Generate PDF face: TAX INVOICE / STATEMENT OF CHARGES
 * (logo, company, bill-to, shipment, charges, totals from live record + org profile).
 * Catalogue Formats still open India / other measured layouts separately.
 */
export async function generateInvoicePdf(model: InvoicePdfModel): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedOrganizationPdfLogo(doc, model.company?.logoUrl, {
    maxHeight: 48,
  });

  const PAGE_W = model.pageSize === 'Letter' ? LETTER_W : A4_W;
  const PAGE_H = model.pageSize === 'Letter' ? LETTER_H : A4_H;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const currency = model.currencyCode?.trim().toUpperCase() || 'AED';
  const companyName = safePdfText(model.company?.name || 'KINGFISHER WINGS GROUP').toUpperCase();
  const tagline = safePdfText(
    model.company?.tagline || 'FREIGHT - LOGISTICS - GENERAL TRADING',
  ).toUpperCase();
  // Prefer org profile; soft template defaults keep the reference face when profile fields are empty.
  const companyPhone = safePdfText(model.company?.phone || '+971 55 5355 286');
  const companyEmail = safePdfText(model.company?.email || 'info@kingfisherwingsgroup.com');
  const companyWeb = safePdfText(model.company?.website || 'www.kingfisherwingsgroup.com');
  const copyLabel = safePdfText(model.copyLabel || 'ORIGINAL');
  const vatPct =
    model.vatRate != null && Number.isFinite(model.vatRate) ? Number(model.vatRate) : 0;

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H;

  const FOOTER_RESERVE = 62;

  const ensureSpace = (need: number) => {
    if (y - need >= FOOTER_RESERVE + 8) return false;
    drawPageFooter(page, font, fontBold, companyPhone, companyEmail, companyWeb, PAGE_W, CONTENT_W);
    page = doc.addPage([PAGE_W, PAGE_H]);
    // Continuation top bar
    page.drawRectangle({ x: 0, y: PAGE_H - 4, width: PAGE_W * 0.72, height: 4, color: NAVY });
    page.drawRectangle({
      x: PAGE_W * 0.72,
      y: PAGE_H - 4,
      width: PAGE_W * 0.28,
      height: 4,
      color: ORANGE,
    });
    y = PAGE_H - 20;
    return true;
  };

  // ——— Top accent bar ———
  page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W * 0.7, height: 6, color: NAVY });
  page.drawRectangle({
    x: PAGE_W * 0.7,
    y: PAGE_H - 6,
    width: PAGE_W * 0.3,
    height: 6,
    color: ORANGE,
  });
  y = PAGE_H - 20;

  // ——— Header ———
  if (logo.image) {
    page.drawImage(logo.image, {
      x: MARGIN,
      y: y - logo.height,
      width: logo.width,
      height: logo.height,
    });
  } else {
    drawText(page, 'KingFisher', MARGIN, y - 14, 13, fontBold, NAVY);
    drawText(page, 'WINGS GROUP', MARGIN, y - 28, 9, fontBold, ORANGE);
  }

  let rightY = y - 8;
  drawRight(page, companyName, PAGE_W - MARGIN, rightY, 10.5, fontBold, NAVY);
  rightY -= 11;
  drawRight(page, tagline, PAGE_W - MARGIN, rightY, 6.5, fontBold, ORANGE);
  rightY -= 13;
  // Phone + email with mini icons
  const phoneW = measure(font, companyPhone, 7.5);
  drawMiniIcon(page, 'phone', PAGE_W - MARGIN - phoneW - 14, rightY - 1);
  drawRight(page, companyPhone, PAGE_W - MARGIN, rightY, 7.5, font, MUTED);
  rightY -= 12;
  const emailW = measure(font, companyEmail, 7.5);
  drawMiniIcon(page, 'mail', PAGE_W - MARGIN - emailW - 14, rightY - 1);
  drawRight(page, companyEmail, PAGE_W - MARGIN, rightY, 7.5, font, MUTED);

  y = Math.min(y - (logo.height || 40), rightY) - 16;

  // ——— Title + ORIGINAL badge ———
  const documentTitle = safePdfText(model.documentTitle || 'INVOICE');
  const documentSubtitle = safePdfText(
    model.documentSubtitle || 'TAX INVOICE / STATEMENT OF CHARGES',
  );
  const detailsSectionTitle = safePdfText(model.detailsSectionTitle || 'INVOICE DETAILS');
  const numberLabel = safePdfText(model.numberLabel || 'Invoice No.');
  const dateLabel = safePdfText(model.dateLabel || 'Invoice Date');
  const dueDateLabel = safePdfText(model.dueDateLabel || 'Due Date');
  const jobRefLabel = safePdfText(model.jobRefLabel || 'Job / Ref No.');

  // Fixed title size for INVOICE / QUOTATION / CREDIT NOTE / DEBIT NOTE (identical face).
  const TITLE_SIZE = 18;
  const badgeH = 15;
  const badgePad = 14;
  const badgeW = Math.max(58, measure(fontBold, copyLabel, 7.5) + badgePad);
  const badgeX = PAGE_W - MARGIN - badgeW;
  drawText(page, documentTitle, MARGIN, y, TITLE_SIZE, fontBold, NAVY);

  const badgeY = y - 2;
  drawRoundedRect(page, badgeX, badgeY, badgeW, badgeH, 7.5, { color: NAVY });
  drawText(
    page,
    copyLabel,
    badgeX + (badgeW - measure(fontBold, copyLabel, 7.5)) / 2,
    badgeY + 4.5,
    7.5,
    fontBold,
    WHITE,
  );

  y -= 12;
  drawText(page, documentSubtitle, MARGIN, y, 7.5, font, MUTED);
  y -= 10;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: NAVY,
  });
  y -= 14;

  if (model.layout === 'commercial_note') {
    const drawn = drawCommercialNoteBody({
      page,
      doc,
      model,
      font,
      fontBold,
      y,
      pageW: PAGE_W,
      pageH: PAGE_H,
      contentW: CONTENT_W,
      currency,
      vatPct,
      companyPhone,
      companyEmail,
      companyWeb,
      numberLabel,
      dateLabel,
      dueDateLabel,
      jobRefLabel,
    });
    drawPageFooter(
      drawn.page,
      font,
      fontBold,
      companyPhone,
      companyEmail,
      companyWeb,
      PAGE_W,
      CONTENT_W,
    );
    const noteBytes = await doc.save();
    return new Blob([new Uint8Array(noteBytes)], { type: 'application/pdf' });
  }

  // ——— Bill To | Invoice Details ———
  const gap = 10;
  const colW = (CONTENT_W - gap) / 2;
  const infoH = 86;
  drawPanel(page, MARGIN, y - infoH, colW, infoH);
  drawPanel(page, MARGIN + colW + gap, y - infoH, colW, infoH);

  let leftY = y - 13;
  sectionTitle(page, 'BILL TO', MARGIN + 10, leftY, fontBold);
  leftY -= 15;
  const billRows: Array<[string, string]> = [
    ['Client', model.billTo.client || '—'],
    ['Attn', model.billTo.attn || '—'],
    ['Phone', model.billTo.phone || '—'],
    ['Email', model.billTo.email || '—'],
  ];
  for (const [label, value] of billRows) {
    labeledValue(page, label, value, MARGIN + 10, leftY, 42, colW - 58, font, fontBold);
    leftY -= 13;
  }

  let detY = y - 13;
  const detX = MARGIN + colW + gap;
  sectionTitle(page, detailsSectionTitle, detX + 10, detY, fontBold);
  detY -= 14;
  const detailRows: Array<[string, string, number]> = [
    [numberLabel, model.invoiceNumber || '—', 68],
    [dateLabel, fmtDate(model.invoiceDate), 68],
    [dueDateLabel, fmtDate(model.dueDate), 68],
    [jobRefLabel, model.jobRef || '—', 68],
    ['Currency', currency, 68],
  ];
  for (const [label, value, lw] of detailRows) {
    labeledValue(page, label, value, detX + 10, detY, lw, colW - lw - 20, font, fontBold);
    detY -= 12;
  }
  y -= infoH + 12;

  // ——— Shipment Details (2 columns × 4 rows) ———
  const ship = model.shipment ?? {};
  const shipH = 92;
  drawPanel(page, MARGIN, y - shipH, CONTENT_W, shipH);
  sectionTitle(page, 'SHIPMENT DETAILS', MARGIN + 10, y - 13, fontBold);

  const leftShip: Array<[string, string]> = [
    ['BL / AWB No.', ship.blAwb || '—'],
    ['Vessel / Flight', ship.vesselFlight || '—'],
    ['POL', ship.pol || '—'],
    ['Commodity', ship.commodity || '—'],
  ];
  const rightShip: Array<[string, string]> = [
    ['Container No.', ship.containerNo || '—'],
    ['ETD / ETA', ship.etdEta || '—'],
    ['POD', ship.pod || '—'],
    ['Gross Wt / CBM', ship.grossWtCbm || '—'],
  ];
  const half = CONTENT_W / 2;
  let sy = y - 28;
  for (let i = 0; i < 4; i += 1) {
    const [ll, lv] = leftShip[i]!;
    const [rl, rv] = rightShip[i]!;
    labeledValue(page, ll, lv, MARGIN + 10, sy, 78, half - 98, font, fontBold);
    labeledValue(page, rl, rv, MARGIN + half + 4, sy, 82, half - 100, font, fontBold);
    sy -= 14;
  }
  y -= shipH + 14;

  // ——— Charges table ———
  const headerH = 20;
  const cols = {
    idx: { x: MARGIN, w: 24 },
    desc: { x: MARGIN + 24, w: 228 },
    qty: { x: MARGIN + 252, w: 42 },
    unit: { x: MARGIN + 294, w: 50 },
    rate: { x: MARGIN + 344, w: 78 },
    amount: { x: MARGIN + 422, w: CONTENT_W - 422 },
  };

  const drawTableHeader = () => {
    page.drawRectangle({
      x: MARGIN,
      y: y - headerH,
      width: CONTENT_W,
      height: headerH,
      color: NAVY,
    });
    const hy = y - 13;
    drawText(page, '#', cols.idx.x + 7, hy, 7, fontBold, WHITE);
    drawText(page, 'DESCRIPTION OF CHARGES', cols.desc.x + 4, hy, 7, fontBold, WHITE);
    drawRight(page, 'QTY', cols.qty.x + cols.qty.w - 4, hy, 7, fontBold, WHITE);
    drawText(page, 'UNIT', cols.unit.x + 4, hy, 7, fontBold, WHITE);
    drawRight(page, 'RATE', cols.rate.x + cols.rate.w - 4, hy, 7, fontBold, WHITE);
    drawRight(page, 'AMOUNT', cols.amount.x + cols.amount.w - 6, hy, 7, fontBold, WHITE);
    y -= headerH;
  };

  drawTableHeader();

  const lines = model.lines.length
    ? model.lines
    : [
        {
          description: 'No charge lines',
          qty: undefined,
          unit: '',
          rate: undefined,
          amount: undefined,
        },
      ];

  lines.forEach((line, index) => {
    const hasDetail = Boolean(line.detail?.trim());
    const h = hasDetail ? 30 : 22;
    if (ensureSpace(h + headerH + 10)) {
      drawTableHeader();
    }

    // Alternating subtle row background
    if (index % 2 === 1) {
      page.drawRectangle({
        x: MARGIN,
        y: y - h,
        width: CONTENT_W,
        height: h,
        color: ROW_ALT,
      });
    }

    const baseY = y - (hasDetail ? 11 : 14);
    drawText(page, String(index + 1), cols.idx.x + 7, baseY, 8, font, TEXT);
    drawText(
      page,
      fit(fontBold, line.description || '—', 8, cols.desc.w - 8),
      cols.desc.x + 4,
      baseY,
      8,
      fontBold,
      TEXT,
    );
    if (hasDetail) {
      drawText(
        page,
        fit(font, line.detail || '', 6.5, cols.desc.w - 8),
        cols.desc.x + 4,
        baseY - 11,
        6.5,
        font,
        MUTED,
      );
    }
    if (line.qty != null) {
      drawRight(page, String(line.qty), cols.qty.x + cols.qty.w - 4, baseY, 8, font, TEXT);
    }
    drawText(
      page,
      fit(font, line.unit || '', 7.5, cols.unit.w - 4),
      cols.unit.x + 4,
      baseY,
      7.5,
      font,
      TEXT,
    );
    if (line.rate != null) {
      drawRight(page, money(line.rate), cols.rate.x + cols.rate.w - 4, baseY, 8, font, TEXT);
    }
    if (line.amount != null) {
      drawRight(
        page,
        money(line.amount),
        cols.amount.x + cols.amount.w - 6,
        baseY,
        8,
        fontBold,
        TEXT,
      );
    }
    y -= h;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.45,
      color: RULE,
    });
  });

  // Table bottom accent
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1.2,
    color: NAVY,
  });
  y -= 14;

  ensureSpace(175);

  // ——— Notes + Totals ———
  const notesW = CONTENT_W * 0.5;
  const totalsW = CONTENT_W * 0.46;
  const totalsX = PAGE_W - MARGIN - totalsW;

  const subtotal = model.subtotal ?? 0;
  const discount = model.discount ?? 0;
  const taxable = model.taxableAmount ?? Math.max(0, subtotal - discount);
  const vatAmount = model.vatAmount ?? 0;
  const other = model.otherCharges ?? 0;
  const grand = model.grandTotal ?? taxable + vatAmount + other;
  const advance = model.advanceReceived ?? 0;
  const balance =
    model.balanceDue ?? Math.max(0, grand - advance);

  type TotRow = {
    label: string;
    value: string;
    kind?: 'normal' | 'grand' | 'balance' | 'advance';
  };
  const totRows: TotRow[] = [
    { label: 'Subtotal', value: money(subtotal) },
    { label: 'Discount', value: money(discount) },
    { label: 'Taxable Amount', value: money(taxable) },
    { label: `VAT @ ${vatPct}%`, value: money(vatAmount) },
    { label: 'Other Charges', value: money(other) },
    { label: 'Grand Total', value: `${currency} ${money(grand)}`, kind: 'grand' },
  ];
  if (!model.hideAdvanceBalance) {
    totRows.push(
      { label: 'Advance Received', value: money(advance), kind: 'advance' },
      { label: 'Balance Due', value: `${currency} ${money(balance)}`, kind: 'balance' },
    );
  }

  let totalsH = 0;
  for (const row of totRows) {
    totalsH += row.kind === 'grand' || row.kind === 'balance' ? 20 : 15;
  }
  const wordsH = 34;
  const blockH = Math.max(totalsH + wordsH + 8, 128);

  drawPanel(page, MARGIN, y - blockH, notesW, blockH);
  sectionTitle(page, 'NOTES / REMARKS', MARGIN + 10, y - 13, fontBold);

  const defaultRemarks =
    model.hideAdvanceBalance
      ? 'This is a computer-generated quotation. Rates are subject to carrier space and equipment availability. Please confirm acceptance before the validity date. Quote the quotation number on all correspondence.'
      : 'This is a computer-generated tax invoice / statement of charges. Payment is due by the due date. Please quote the invoice number as payment reference. Bank charges, if any, are for the remitter\'s account. Goods remain the property of the carrier / forwarder until paid in full where applicable.';
  const remarkLines = wrapLines(
    font,
    model.remarks?.trim() || defaultRemarks,
    7,
    notesW - 20,
    10,
  );
  let ny = y - 28;
  for (const line of remarkLines) {
    drawText(page, line, MARGIN + 10, ny, 7, font, TEXT);
    ny -= 10;
  }

  let ty = y;
  for (const row of totRows) {
    const h = row.kind === 'grand' || row.kind === 'balance' ? 18 : 14;
    if (row.kind === 'grand') {
      page.drawRectangle({
        x: totalsX,
        y: ty - h,
        width: totalsW,
        height: h,
        color: NAVY,
      });
      drawText(page, row.label, totalsX + 8, ty - 12, 8, fontBold, WHITE);
      drawRight(page, row.value, totalsX + totalsW - 8, ty - 12, 8, fontBold, WHITE);
    } else if (row.kind === 'balance') {
      page.drawRectangle({
        x: totalsX,
        y: ty - h,
        width: totalsW,
        height: h,
        color: BALANCE_BG,
        borderColor: ORANGE,
        borderWidth: 0.5,
      });
      drawText(page, row.label, totalsX + 8, ty - 12, 8, fontBold, NAVY);
      drawRight(page, row.value, totalsX + totalsW - 8, ty - 12, 8, fontBold, NAVY);
    } else {
      drawText(page, row.label, totalsX + 8, ty - 10, 7.5, font, LABEL);
      drawRight(
        page,
        row.value,
        totalsX + totalsW - 8,
        ty - 10,
        7.5,
        row.kind === 'advance' ? font : font,
        TEXT,
      );
      page.drawLine({
        start: { x: totalsX, y: ty - h - 1 },
        end: { x: totalsX + totalsW, y: ty - h - 1 },
        thickness: 0.3,
        color: RULE,
      });
    }
    ty -= h + 2;
  }

  // Amount in words — under totals (right), matching snippet
  ty -= 4;
  const wordsBoxH = 30;
  page.drawRectangle({
    x: totalsX,
    y: ty - wordsBoxH,
    width: totalsW,
    height: wordsBoxH,
    color: WORDS_BG,
    borderColor: PANEL_BORDER,
    borderWidth: 0.5,
  });
  drawText(page, 'AMOUNT IN WORDS', totalsX + 6, ty - 10, 6, fontBold, LABEL);
  const words = invoiceAmountInWords(grand, currency);
  const wrapped = wrapLines(fontBold, words, 7, totalsW - 12, 2);
  let wy = ty - 20;
  for (const line of wrapped) {
    drawText(page, line, totalsX + 6, wy, 7, fontBold, TEXT);
    wy -= 9;
  }

  y -= blockH + 10;

  // ——— Bank accounts (Organization → Bank Accounts) ———
  const bankAccounts = (model.bankAccounts ?? []).filter(
    (a) =>
      a.bankName ||
      a.accountName ||
      a.accountNumber ||
      a.iban ||
      a.swiftCode,
  );
  if (bankAccounts.length && !model.hideAdvanceBalance) {
    const rowsPerAccount = bankAccounts.map((a) => {
      const rows: Array<{ label: string; value: string }> = [];
      if (a.bankName) rows.push({ label: 'Bank', value: a.bankName });
      if (a.accountName) rows.push({ label: 'Account name', value: a.accountName });
      if (a.accountNumber) rows.push({ label: 'Account no.', value: a.accountNumber });
      if (a.iban) rows.push({ label: 'IBAN', value: a.iban });
      if (a.swiftCode) rows.push({ label: 'SWIFT', value: a.swiftCode });
      if (a.currencyCode) rows.push({ label: 'Currency', value: a.currencyCode });
      return rows;
    });
    const lineH = 11;
    const titleH = 16;
    const gapBetween = 8;
    let contentH = titleH;
    for (let i = 0; i < rowsPerAccount.length; i += 1) {
      contentH += rowsPerAccount[i].length * lineH;
      if (i < rowsPerAccount.length - 1) contentH += gapBetween;
    }
    const panelH = contentH + 14;
    ensureSpace(panelH + 8);
    drawPanel(page, MARGIN, y - panelH, CONTENT_W, panelH);
    sectionTitle(page, 'BANK ACCOUNTS', MARGIN + 10, y - 13, fontBold);
    let by = y - 28;
    const colGap = 12;
    const labelColW = 78;
    const valueX = MARGIN + 10 + labelColW + colGap;
    const valueMaxW = CONTENT_W - labelColW - colGap - 24;
    for (let i = 0; i < rowsPerAccount.length; i += 1) {
      if (i > 0) {
        by -= gapBetween / 2;
        page.drawLine({
          start: { x: MARGIN + 10, y: by + 4 },
          end: { x: MARGIN + CONTENT_W - 10, y: by + 4 },
          thickness: 0.4,
          color: RULE,
        });
        by -= gapBetween / 2;
      }
      for (const row of rowsPerAccount[i]) {
        drawText(page, row.label, MARGIN + 10, by, 7, font, LABEL);
        drawText(
          page,
          fit(font, row.value, 7.5, valueMaxW),
          valueX,
          by,
          7.5,
          font,
          TEXT,
        );
        by -= lineH;
      }
    }
    y -= panelH + 10;
  }

  drawPageFooter(page, font, fontBold, companyPhone, companyEmail, companyWeb, PAGE_W, CONTENT_W);

  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

/**
 * Credit / debit note body — CUSTOMER | SHIP TO | meta, QTY table, simple totals,
 * Thank you + Terms. Header/footer chrome stays on the shared KingFisher invoice face.
 */
function drawCommercialNoteBody(opts: {
  page: PDFPage;
  doc: PDFDocument;
  model: InvoicePdfModel;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
  pageW: number;
  pageH: number;
  contentW: number;
  currency: string;
  vatPct: number;
  companyPhone: string;
  companyEmail: string;
  companyWeb: string;
  numberLabel: string;
  dateLabel: string;
  dueDateLabel: string;
  jobRefLabel: string;
}): { page: PDFPage; y: number } {
  let { page, y } = opts;
  const {
    doc,
    model,
    font,
    fontBold,
    pageW,
    pageH,
    contentW,
    currency,
    vatPct,
    companyPhone,
    companyEmail,
    companyWeb,
    numberLabel,
    dateLabel,
    dueDateLabel,
    jobRefLabel,
  } = opts;

  const FOOTER_RESERVE = 62;
  const ensureSpace = (need: number) => {
    if (y - need >= FOOTER_RESERVE + 8) return;
    drawPageFooter(page, font, fontBold, companyPhone, companyEmail, companyWeb, pageW, contentW);
    page = doc.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: pageH - 4, width: pageW * 0.72, height: 4, color: NAVY });
    page.drawRectangle({
      x: pageW * 0.72,
      y: pageH - 4,
      width: pageW * 0.28,
      height: 4,
      color: ORANGE,
    });
    y = pageH - 20;
  };

  const bill = model.billTo;
  const ship = model.shipTo ?? model.billTo;
  const colGap = 16;
  const colW = (contentW - colGap * 2) / 3;

  const partyBlock = (
    title: string,
    party: InvoicePdfBillTo,
    x: number,
    top: number,
  ): number => {
    drawText(page, title, x, top, 8, fontBold, NAVY);
    let py = top - 14;
    const name = party.client || '—';
    drawText(page, fit(fontBold, name, 9, colW - 4), x, py, 9, fontBold, TEXT);
    py -= 12;
    const lines = [
      party.attn ? `Attn: ${party.attn}` : '',
      ...(party.addressLines ?? []),
      party.phone ? `Phone: ${party.phone}` : '',
      party.email ? `Email: ${party.email}` : '',
    ].filter(Boolean);
    for (const line of lines.slice(0, 5)) {
      drawText(page, fit(font, line, 7.5, colW - 4), x, py, 7.5, font, MUTED);
      py -= 10;
    }
    return py;
  };

  ensureSpace(110);
  const blockTop = y;
  const leftBottom = partyBlock('CUSTOMER', bill, MARGIN, blockTop);
  const midBottom = partyBlock('SHIP TO', ship, MARGIN + colW + colGap, blockTop);

  // Right meta — stacked label / value like the sample
  let metaY = blockTop;
  const metaX = MARGIN + (colW + colGap) * 2;
  const metaRows: Array<[string, string]> = [
    [numberLabel || 'Note #', model.invoiceNumber || '—'],
    [dateLabel || 'Date', fmtDate(model.invoiceDate)],
    [jobRefLabel || 'P.O.#', model.jobRef || '—'],
    [dueDateLabel || 'Due Date', fmtDate(model.dueDate)],
  ];
  for (const [label, value] of metaRows) {
    drawText(page, label.toUpperCase(), metaX, metaY, 7, fontBold, NAVY);
    metaY -= 11;
    drawText(page, fit(font, value, 9, colW - 4), metaX, metaY, 9, font, TEXT);
    metaY -= 16;
  }

  y = Math.min(leftBottom, midBottom, metaY) - 18;

  // ——— QTY | DESCRIPTION | UNIT PRICE | AMOUNT ———
  const headerH = 18;
  const cols = {
    qty: { x: MARGIN, w: 48 },
    desc: { x: MARGIN + 48, w: contentW - 48 - 160 },
    rate: { x: MARGIN + contentW - 160, w: 72 },
    amount: { x: MARGIN + contentW - 88, w: 88 },
  };

  const drawTableHeader = () => {
    ensureSpace(headerH + 40);
    drawText(page, 'QTY', cols.qty.x, y - 12, 8, fontBold, NAVY);
    drawText(page, 'DESCRIPTION', cols.desc.x, y - 12, 8, fontBold, NAVY);
    drawRight(page, 'UNIT PRICE', cols.rate.x + cols.rate.w, y - 12, 8, fontBold, NAVY);
    drawRight(page, 'AMOUNT', cols.amount.x + cols.amount.w, y - 12, 8, fontBold, NAVY);
    y -= headerH;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: pageW - MARGIN, y },
      thickness: 1.2,
      color: ORANGE,
    });
    y -= 6;
  };

  drawTableHeader();

  const lines = model.lines.length
    ? model.lines
    : [{ description: 'No charge lines', qty: undefined, rate: undefined, amount: undefined }];

  lines.forEach((line, index) => {
    const descLines = wrapLines(font, line.description || '—', 8, cols.desc.w - 4, 3);
    const h = Math.max(18, descLines.length * 11 + 6);
    if (y - h < FOOTER_RESERVE + 8) {
      // New page + redraw header, then continue this row.
      drawPageFooter(page, font, fontBold, companyPhone, companyEmail, companyWeb, pageW, contentW);
      page = doc.addPage([pageW, pageH]);
      page.drawRectangle({ x: 0, y: pageH - 4, width: pageW * 0.72, height: 4, color: NAVY });
      page.drawRectangle({
        x: pageW * 0.72,
        y: pageH - 4,
        width: pageW * 0.28,
        height: 4,
        color: ORANGE,
      });
      y = pageH - 20;
      drawTableHeader();
    }
    if (index % 2 === 1) {
      page.drawRectangle({
        x: MARGIN,
        y: y - h,
        width: contentW,
        height: h,
        color: ROW_ALT,
      });
    }
    const baseY = y - 12;
    if (line.qty != null) {
      drawText(page, String(line.qty), cols.qty.x, baseY, 8, font, TEXT);
    }
    let dy = baseY;
    for (const dl of descLines) {
      drawText(page, dl, cols.desc.x, dy, 8, font, TEXT);
      dy -= 11;
    }
    if (line.rate != null) {
      drawRight(page, money(line.rate), cols.rate.x + cols.rate.w, baseY, 8, font, TEXT);
    }
    if (line.amount != null) {
      drawRight(
        page,
        money(line.amount),
        cols.amount.x + cols.amount.w,
        baseY,
        8,
        fontBold,
        TEXT,
      );
    }
    y -= h;
  });

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: pageW - MARGIN, y },
    thickness: 0.6,
    color: RULE,
  });
  y -= 16;

  // ——— Totals (right) ———
  const subtotal = model.subtotal ?? 0;
  const discount = model.discount ?? 0;
  const taxable = model.taxableAmount ?? Math.max(0, subtotal - discount);
  const vatAmount = model.vatAmount ?? 0;
  const grand = model.grandTotal ?? taxable + vatAmount + (model.otherCharges ?? 0);
  const totalsW = 200;
  const totalsX = pageW - MARGIN - totalsW;

  ensureSpace(90);
  const totPairs: Array<[string, string, boolean]> = [
    ['Subtotal', money(subtotal), false],
    [
      vatPct > 0 ? `Sales Tax ${vatPct.toFixed(1)}%` : 'Tax',
      money(vatAmount),
      false,
    ],
    ['TOTAL', `${currency} ${money(grand)}`, true],
  ];
  for (const [label, value, emph] of totPairs) {
    if (emph) {
      drawText(page, label, totalsX, y, 10, fontBold, NAVY);
      drawRight(page, value, totalsX + totalsW, y, 10, fontBold, NAVY);
      y -= 18;
    } else {
      drawText(page, label, totalsX, y, 8, font, LABEL);
      drawRight(page, value, totalsX + totalsW, y, 8, font, TEXT);
      y -= 14;
    }
  }

  y -= 10;
  ensureSpace(90);

  // Thank you (left) + Terms (right)
  drawText(page, 'Thank you', MARGIN, y, 16, fontBold, NAVY);

  const termsX = MARGIN + contentW * 0.42;
  const termsW = contentW * 0.58;
  page.drawRectangle({
    x: termsX,
    y: y - 72,
    width: 2.5,
    height: 78,
    color: NAVY,
  });
  drawText(page, 'TERMS & CONDITIONS', termsX + 10, y, 8, fontBold, ORANGE);
  const defaultTerms =
    'Payment is due by the due date. Please quote the note number on all correspondence. This is a computer-generated credit / debit note.';
  const termLines = wrapLines(
    font,
    model.remarks?.trim() || defaultTerms,
    7,
    termsW - 16,
    6,
  );
  let ty = y - 14;
  for (const line of termLines) {
    drawText(page, line, termsX + 10, ty, 7, font, TEXT);
    ty -= 10;
  }
  y = Math.min(y - 24, ty) - 12;

  return { page, y };
}

function drawPageFooter(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  phone: string,
  email: string,
  website: string,
  pageW: number,
  contentW: number,
): void {
  const top = 48;
  page.drawLine({
    start: { x: MARGIN, y: top + 16 },
    end: { x: pageW - MARGIN, y: top + 16 },
    thickness: 0.6,
    color: RULE,
  });

  const colW = contentW / 3;
  const items: Array<{ label: string; value: string; kind: 'phone' | 'mail' | 'web' }> = [
    { label: 'CALL US ANYTIME', value: phone, kind: 'phone' },
    { label: 'MAIL TO US', value: email, kind: 'mail' },
    { label: 'WEBSITE', value: website, kind: 'web' },
  ];
  items.forEach((item, i) => {
    const x = MARGIN + i * colW;
    drawText(page, item.label, x + 14, top + 4, 5.5, fontBold, LABEL);
    drawMiniIcon(page, item.kind, x, top - 10);
    drawText(page, fit(font, item.value, 7.5, colW - 20), x + 14, top - 8, 7.5, font, TEXT);
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
