import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';
import { JOB_TYPE_LABELS } from '../constants/quotation.constants';
import type { Quotation, QuotationLine } from '../types/quotation.types';
import { quotationDisplayNumber } from './normalizeQuotation';

/** A4 portrait */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 36;
const BLUE = rgb(0.05, 0.28, 0.55);
const TEXT = rgb(0.1, 0.12, 0.15);
const MUTED = rgb(0.35, 0.38, 0.42);
const RULE = rgb(0.55, 0.58, 0.62);
const HEADER_BG = rgb(0.93, 0.94, 0.96);
const TOTAL_BG = rgb(0.88, 0.9, 0.93);

export type QuotationPdfCompany = {
  name?: string;
  addressLines?: string[];
};

export type QuotationPdfOptions = {
  quotation: Quotation;
  company?: QuotationPdfCompany;
  /** Shown in footer (e.g. current user email). */
  generatedBy?: string;
  /** Optional resolved container type label. */
  containerTypeLabel?: string;
  /** Subject / confirm line under To block. */
  confirmNote?: string;
};

function money(value: number | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function weight(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return '';
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} KGS`;
}

function fmtDate(raw?: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return safePdfText(raw);
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
    .toUpperCase()
    .replace(/ /g, '-');
}

function portLabel(q: Quotation, side: 'origin' | 'dest'): string {
  if (side === 'origin') {
    return safePdfText(
      [q.origin_port_name, q.origin_port_code].filter(Boolean).join(' ') || '',
    );
  }
  return safePdfText([q.dest_port_name, q.dest_port_code].filter(Boolean).join(' ') || '');
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

/** Simple English amount-in-words for PDF totals (WinAnsi-safe). */
export function amountInWords(amount: number, currencyCode?: string): string {
  if (!Number.isFinite(amount)) return '';
  const abs = Math.abs(amount);
  const whole = Math.floor(abs);
  const cents = Math.round((abs - whole) * 100);
  const parts: string[] = [];
  const billions = Math.floor(whole / 1_000_000_000);
  const millions = Math.floor((whole % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((whole % 1_000_000) / 1000);
  const rem = whole % 1000;
  if (billions) parts.push(`${chunkToWords(billions)} Billion`);
  if (millions) parts.push(`${chunkToWords(millions)} Million`);
  if (thousands) parts.push(`${chunkToWords(thousands)} Thousand`);
  if (rem || parts.length === 0) parts.push(chunkToWords(rem) || 'Zero');
  let out = parts.join(' ');
  if (cents > 0) out += ` and ${onesWords(cents) || String(cents)}`;
  out += ' Only';
  const cur = currencyCode?.trim().toUpperCase();
  return cur ? `${out} (${cur})` : out;
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

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  size: number,
  font: PDFFont,
  color = TEXT,
): void {
  const t = safePdfText(text);
  if (!t) return;
  const w = measure(font, t, size);
  page.drawText(t, { x: (PAGE_W - w) / 2, y, size, font, color });
}

function revenueLines(lines: QuotationLine[] | undefined): QuotationLine[] {
  if (!lines?.length) return [];
  return lines.filter((l) => !l.is_cost);
}

function lineTaxable(line: QuotationLine): number {
  const qty = line.quantity ?? 0;
  const price = line.unit_price ?? 0;
  const rate = line.exchange_rate && line.exchange_rate > 0 ? line.exchange_rate : 1;
  return qty * price * rate;
}

function lineTotal(line: QuotationLine): number {
  if (line.line_total != null && Number.isFinite(line.line_total)) return line.line_total;
  const taxable = lineTaxable(line);
  const tax =
    line.tax_amount != null
      ? line.tax_amount
      : line.tax_percent != null
        ? (taxable * line.tax_percent) / 100
        : 0;
  return taxable + tax;
}

type Col = { key: string; label: string; width: number; align?: 'left' | 'right' };

async function embedLogo(doc: PDFDocument): Promise<{
  image: Awaited<ReturnType<PDFDocument['embedPng']>> | null;
  width: number;
  height: number;
}> {
  try {
    const url = new URL('/kingfisher-logo.png', window.location.origin).href;
    const res = await fetch(url);
    if (!res.ok) return { image: null, width: 0, height: 0 };
    const bytes = await res.arrayBuffer();
    const image = await doc.embedPng(bytes);
    const maxH = 36;
    const scale = maxH / image.height;
    return { image, width: image.width * scale, height: maxH };
  } catch {
    return { image: null, width: 0, height: 0 };
  }
}

/**
 * Client-side FRESA-style quotation PDF (portrait A4).
 * Self-contained header/footer — do not double-stamp with stampPdfBranding.
 */
export async function generateQuotationPdf(options: QuotationPdfOptions): Promise<Blob> {
  const { quotation: q, company, generatedBy, containerTypeLabel, confirmNote } =
    options;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(doc);

  const quoteNo = quotationDisplayNumber(q);
  const charges = revenueLines(q.lines);
  const currency = q.currency_code || 'AED';
  const companyName = safePdfText(company?.name || 'KingFisher Wings');
  const addressLines = (company?.addressLines ?? []).map((l) => safePdfText(l)).filter(Boolean);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensureSpace = (need: number) => {
    if (y - need >= MARGIN + 28) return;
    drawFooter(page, font, generatedBy);
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  // Outer border
  page.drawRectangle({
    x: 18,
    y: 18,
    width: PAGE_W - 36,
    height: PAGE_H - 36,
    borderColor: RULE,
    borderWidth: 0.8,
  });

  // Header: logo left, company right
  if (logo.image) {
    page.drawImage(logo.image, {
      x: MARGIN,
      y: y - logo.height,
      width: logo.width,
      height: logo.height,
    });
  } else {
    drawText(page, 'KingFisher Wings', MARGIN, y - 18, 12, fontBold, BLUE);
  }

  let rightY = y - 12;
  drawRight(page, companyName, PAGE_W - MARGIN, rightY, 11, fontBold, BLUE);
  rightY -= 12;
  for (const line of addressLines.slice(0, 4)) {
    drawRight(page, line, PAGE_W - MARGIN, rightY, 7, font, MUTED);
    rightY -= 9;
  }

  y = Math.min(y - (logo.height || 22), rightY) - 10;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.7,
    color: RULE,
  });
  y -= 18;

  drawCentered(page, `QUOTATION - ${quoteNo}`, y, 12, fontBold, TEXT);
  y -= 20;

  // To block
  drawText(page, 'To :', MARGIN, y, 9, fontBold);
  y -= 12;
  const toName = safePdfText(q.customer_name || 'Customer');
  drawText(page, toName, MARGIN + 8, y, 9, fontBold);
  y -= 11;
  if (q.contact_name) {
    drawText(page, safePdfText(q.contact_name), MARGIN + 8, y, 8, font);
    y -= 10;
  }
  if (q.contact_phone) {
    drawText(page, `Phone : ${safePdfText(q.contact_phone)}`, MARGIN + 8, y, 8, font);
    y -= 10;
  }
  if (q.contact_email) {
    drawText(page, `Email : ${safePdfText(q.contact_email)}`, MARGIN + 8, y, 8, font);
    y -= 10;
  }
  y -= 4;
  drawText(
    page,
    safePdfText(confirmNote || q.remarks || 'Please confirm the quote.'),
    MARGIN + 8,
    y,
    8,
    font,
    MUTED,
  );
  y -= 16;

  // Meta two columns
  const metaLeft: Array<[string, string]> = [
    [
      'Quotation No',
      [quoteNo, fmtDate(q.quotation_date || q.created_at)].filter(Boolean).join(' / '),
    ],
    ['Origin', portLabel(q, 'origin')],
    ['Movement Type', JOB_TYPE_LABELS[q.job_type] ?? String(q.job_type || '')],
    [
      'Transit Time',
      q.transit_time_days != null ? `${q.transit_time_days} Day(s)` : '',
    ],
    ['Carrier', safePdfText(q.carrier_name || q.carrier_preference || '')],
    ['Place of Delivery', portLabel(q, 'dest')],
  ];
  const metaRight: Array<[string, string]> = [
    [
      'Quotation Validity',
      [fmtDate(q.quotation_date || q.created_at), fmtDate(q.valid_until)]
        .filter(Boolean)
        .join(' - '),
    ],
    ['Final Destination', portLabel(q, 'dest')],
    ['PP / CC', ''],
    ['Frequency', ''],
    ['Place of Receipt', portLabel(q, 'origin')],
    ['INCO Term', safePdfText(String(q.incoterm || ''))],
  ];

  const colMid = PAGE_W / 2 + 8;
  const labelW = 88;
  let metaY = y;
  for (let i = 0; i < Math.max(metaLeft.length, metaRight.length); i += 1) {
    const left = metaLeft[i];
    const right = metaRight[i];
    if (left) {
      drawText(page, `${left[0]} :`, MARGIN, metaY, 8, fontBold);
      drawText(
        page,
        fit(font, left[1], 8, colMid - MARGIN - labelW - 16),
        MARGIN + labelW,
        metaY,
        8,
        font,
      );
    }
    if (right) {
      drawText(page, `${right[0]} :`, colMid, metaY, 8, fontBold);
      drawText(
        page,
        fit(font, right[1], 8, PAGE_W - MARGIN - colMid - labelW),
        colMid + labelW,
        metaY,
        8,
        font,
      );
    }
    metaY -= 11;
  }
  y = metaY - 8;

  // Container details
  ensureSpace(70);
  drawText(page, 'Container Details', MARGIN, y, 10, fontBold);
  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.6,
    color: RULE,
  });
  y -= 12;

  const containerCols: Col[] = [
    { key: 'container', label: 'Container', width: 54 },
    { key: 'type', label: 'Type', width: 72 },
    { key: 'description', label: 'Description', width: 90 },
    { key: 'pkgs', label: 'Pkgs', width: 48 },
    { key: 'volume', label: 'Volume', width: 48, align: 'right' },
    { key: 'net', label: 'Net Weight', width: 62, align: 'right' },
    { key: 'gross', label: 'Gross Weight', width: 68, align: 'right' },
    { key: 'vwt', label: 'Volume Weight', width: 68, align: 'right' },
  ];
  const tableLeft = MARGIN;
  const tableWidth = containerCols.reduce((s, c) => s + c.width, 0);

  const drawTableHeader = (cols: Col[], topY: number) => {
    page.drawRectangle({
      x: tableLeft,
      y: topY - 12,
      width: tableWidth,
      height: 14,
      color: HEADER_BG,
      borderColor: RULE,
      borderWidth: 0.4,
    });
    let x = tableLeft + 2;
    for (const col of cols) {
      drawText(page, col.label, x, topY - 9, 6.5, fontBold);
      x += col.width;
    }
    return topY - 14;
  };

  y = drawTableHeader(containerCols, y);
  const hasCargo =
    q.container_count ||
    q.pieces ||
    q.gross_weight ||
    q.volume_cbm ||
    q.commodity ||
    containerTypeLabel;
  if (hasCargo) {
    page.drawRectangle({
      x: tableLeft,
      y: y - 12,
      width: tableWidth,
      height: 14,
      borderColor: RULE,
      borderWidth: 0.4,
    });
    const row: Record<string, string> = {
      container: q.container_count != null ? String(q.container_count) : '',
      type: safePdfText(containerTypeLabel || ''),
      description: safePdfText(q.commodity || ''),
      pkgs: q.pieces != null ? String(q.pieces) : 'PACKAGES',
      volume: q.volume_cbm != null ? money(q.volume_cbm, 3) : '',
      net: weight(q.gross_weight),
      gross: weight(q.gross_weight),
      vwt: weight(q.chargeable_weight ?? q.gross_weight),
    };
    let x = tableLeft + 2;
    for (const col of containerCols) {
      const val = fit(font, row[col.key] || '', 6.5, col.width - 4);
      if (col.align === 'right') {
        drawRight(page, val, x + col.width - 3, y - 9, 6.5, font);
      } else {
        drawText(page, val, x, y - 9, 6.5, font);
      }
      x += col.width;
    }
    y -= 16;
  } else {
    drawText(page, 'No container / consignment details.', MARGIN + 2, y - 10, 7, font, MUTED);
    y -= 16;
  }

  y -= 8;
  ensureSpace(80);
  drawText(page, 'Charges', MARGIN, y, 10, fontBold);
  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.6,
    color: RULE,
  });
  y -= 12;

  const chargeCols: Col[] = [
    { key: 'charge', label: 'Charge', width: 90 },
    { key: 'unit', label: 'Unit', width: 32 },
    { key: 'qty', label: 'Qty', width: 28, align: 'right' },
    { key: 'ccy', label: 'Currency', width: 38 },
    { key: 'rate', label: 'Ex.Rate', width: 42, align: 'right' },
    { key: 'amt', label: 'Amount/Unit', width: 48, align: 'right' },
    { key: 'fcy', label: 'FCY Amount', width: 48, align: 'right' },
    { key: 'taxable', label: 'Taxable Amount', width: 52, align: 'right' },
    { key: 'taxg', label: 'Tax Group', width: 40 },
    { key: 'tax', label: 'Tax Amount', width: 42, align: 'right' },
    { key: 'total', label: 'Total Amount', width: 48, align: 'right' },
  ];
  const chargeTableW = chargeCols.reduce((s, c) => s + c.width, 0);

  y = drawTableHeader(chargeCols, y);

  let sumTaxable = 0;
  let sumTax = 0;
  let sumTotal = 0;

  const drawChargeRow = (line: QuotationLine) => {
    ensureSpace(20);
    page.drawRectangle({
      x: tableLeft,
      y: y - 12,
      width: chargeTableW,
      height: 14,
      borderColor: RULE,
      borderWidth: 0.35,
    });
    const qty = line.quantity ?? 0;
    const unitPrice = line.unit_price ?? 0;
    const exRate = line.exchange_rate && line.exchange_rate > 0 ? line.exchange_rate : 1;
    const fcy = qty * unitPrice;
    const taxable = lineTaxable(line);
    const taxAmt =
      line.tax_amount != null
        ? line.tax_amount
        : line.tax_percent != null
          ? (taxable * line.tax_percent) / 100
          : 0;
    const total = lineTotal(line);
    sumTaxable += taxable;
    sumTax += taxAmt;
    sumTotal += total;

    const taxGroup =
      line.tax_percent != null && line.tax_percent > 0 ? `VAT ${line.tax_percent}` : '';

    const cells: Record<string, string> = {
      charge: safePdfText(line.charge_code || line.description || 'Charge'),
      unit: safePdfText(line.unit || ''),
      qty: money(qty, qty % 1 === 0 ? 0 : 2),
      ccy: safePdfText(line.currency_code || currency),
      rate: money(exRate, 6),
      amt: money(unitPrice),
      fcy: money(fcy),
      taxable: money(taxable),
      taxg: taxGroup,
      tax: money(taxAmt),
      total: money(total),
    };

    let x = tableLeft + 2;
    for (const col of chargeCols) {
      const val = fit(font, cells[col.key] || '', 6, col.width - 4);
      if (col.align === 'right') drawRight(page, val, x + col.width - 3, y - 9, 6, font);
      else drawText(page, val, x, y - 9, 6, font);
      x += col.width;
    }
    y -= 14;
  };

  if (charges.length) {
    for (const line of charges) drawChargeRow(line);
  } else {
    drawText(page, 'No charge lines.', MARGIN + 2, y - 10, 7, font, MUTED);
    y -= 16;
  }

  // Totals row
  ensureSpace(36);
  page.drawRectangle({
    x: tableLeft,
    y: y - 12,
    width: chargeTableW,
    height: 14,
    color: TOTAL_BG,
    borderColor: RULE,
    borderWidth: 0.4,
  });
  const displayTaxable = q.subtotal ?? sumTaxable;
  const displayTax = q.tax_total ?? sumTax;
  const displayTotal = q.total_amount ?? sumTotal;
  drawText(page, 'Total', tableLeft + 4, y - 9, 7, fontBold);
  // Align under Taxable / Tax / Total columns (last three).
  let tx = tableLeft;
  for (const col of chargeCols) {
    if (col.key === 'taxable') drawRight(page, money(displayTaxable), tx + col.width - 3, y - 9, 7, fontBold);
    if (col.key === 'tax') drawRight(page, money(displayTax), tx + col.width - 3, y - 9, 7, fontBold);
    if (col.key === 'total') drawRight(page, money(displayTotal), tx + col.width - 3, y - 9, 7, fontBold);
    tx += col.width;
  }
  y -= 20;

  drawText(page, amountInWords(displayTotal, currency), MARGIN, y, 8, fontBold);
  y -= 18;

  ensureSpace(50);
  drawText(page, 'Terms & Conditions', MARGIN, y, 10, fontBold);
  y -= 12;
  const termsText = safePdfText(q.special_requirements || 'Thank you');
  drawText(page, fit(font, termsText, 8, PAGE_W - 2 * MARGIN), MARGIN, y, 8, font);

  drawFooter(page, font, generatedBy);

  const bytes = await doc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

function drawFooter(page: PDFPage, font: PDFFont, generatedBy?: string): void {
  const y = 26;
  page.drawLine({
    start: { x: MARGIN, y: y + 12 },
    end: { x: PAGE_W - MARGIN, y: y + 12 },
    thickness: 0.5,
    color: RULE,
  });
  const user = safePdfText(generatedBy || '');
  const stamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  drawText(page, user ? `User : ${user}` : '', MARGIN, y, 6.5, font, MUTED);
  drawCentered(page, safePdfText(stamp), y, 6.5, font, MUTED);
  drawRight(page, 'Powered by: KingFisher Wings', PAGE_W - MARGIN, y, 6.5, font, MUTED);
}
