import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import logoAsset from '@/assets/logo.png';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';
import type { InvoiceFormatLayoutKind, InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import {
  invoiceFormatToInvoicePdfModel,
  type InvoiceFormatPdfData,
  type InvoiceFormatPdfLine,
} from './invoiceFormatToInvoicePdfModel';

export type { InvoiceFormatPdfData, InvoiceFormatPdfLine };

const A4_W = 595.28;
const A4_H = 841.89;
const LETTER_W = 612;
const LETTER_H = 792;
const M = 28;

const NAVY = rgb(0.039, 0.161, 0.259);
const ORANGE = rgb(0.957, 0.447, 0.078);
const TEXT = rgb(0.102, 0.118, 0.141);
const MUTED = rgb(0.45, 0.48, 0.52);
const RULE = rgb(0.82, 0.84, 0.86);
const PANEL = rgb(0.965, 0.968, 0.973);
const WHITE = rgb(1, 1, 1);
const TEAL = rgb(0.059, 0.463, 0.431);
const RED = rgb(0.73, 0.11, 0.11);
const DARK = rgb(0.2, 0.2, 0.22);

type Ctx = {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  logo?: PDFImage;
  preview: InvoiceFormatPreview;
  data: ResolvedData;
  w: number;
  h: number;
};

type ResolvedData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billTo: string;
  billAddr: string;
  currency: string;
  job: string;
  lines: Array<{ desc: string; qty: string; unit: string; rate: string; amount: string; sac: string }>;
  subtotal: string;
  tax: string;
  total: string;
};

function t(s: string): string {
  return safePdfText(s) || '';
}

function measure(font: PDFFont, text: string, size: number): number {
  const s = t(text);
  return s ? font.widthOfTextAtSize(s, size) : 0;
}

function draw(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = TEXT,
): void {
  const s = t(text);
  if (!s) return;
  page.drawText(s, { x, y, size, font, color });
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
  const s = t(text);
  if (!s) return;
  page.drawText(s, { x: xRight - measure(font, s, size), y, size, font, color });
}

function resolveData(preview: InvoiceFormatPreview, data: InvoiceFormatPdfData): ResolvedData {
  const model = invoiceFormatToInvoicePdfModel(preview, data);
  const money = (n: number | undefined) =>
    (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lines =
    data.lines?.length
      ? data.lines.map((l, i) => ({
          desc: l.description || 'Charge',
          qty: l.qty || '1',
          unit: 'UNT',
          rate: l.rate || '0.00',
          amount: l.amount || '0.00',
          sac: String(9965 + (i % 3)),
        }))
      : (model.lines ?? []).map((l, i) => ({
          desc: l.description,
          qty: String(l.qty ?? 1),
          unit: l.unit || 'UNT',
          rate: money(l.rate),
          amount: money(l.amount),
          sac: String(9965 + (i % 3)),
        }));

  return {
    invoiceNumber: data.invoiceNumber || model.invoiceNumber || 'KFW-INV-2026-0042',
    invoiceDate: data.invoiceDate || model.invoiceDate || '14-Sep-2026',
    dueDate: model.dueDate || '28-Sep-2026',
    billTo: data.billToName || model.billTo.client || 'Demo Customer Trading Co.',
    billAddr: data.billToAddress || model.billTo.addressLines?.[0] || 'Plot 12, JAFZA, Dubai, UAE',
    currency: data.currencyCode || model.currencyCode || 'AED',
    job: model.jobRef || 'JOB-2026-1042',
    lines,
    subtotal: data.subtotal || money(model.subtotal),
    tax: data.tax || money(model.vatAmount),
    total: data.total || money(model.grandTotal),
  };
}

async function loadLogo(doc: PDFDocument): Promise<PDFImage | undefined> {
  try {
    const res = await fetch(logoAsset);
    const bytes = await res.arrayBuffer();
    return await doc.embedPng(bytes);
  } catch {
    return undefined;
  }
}

function drawLogo(ctx: Ctx, x: number, y: number, maxH: number): void {
  if (!ctx.logo) return;
  const scale = maxH / ctx.logo.height;
  const w = ctx.logo.width * scale;
  ctx.page.drawImage(ctx.logo, { x, y, width: w, height: maxH });
}

function badge(ctx: Ctx, y: number, xRight: number): void {
  drawRight(
    ctx.page,
    `Format-${ctx.preview.formatNumber} · ${ctx.preview.layoutKind.replace(/_/g, ' ')}`,
    xRight,
    y,
    7,
    ctx.font,
    MUTED,
  );
}

function drawTaxIndia(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;

  drawLogo(ctx, M, y - 36, 32);
  draw(page, 'KingFisher Wings Group', M + 100, y - 12, 11, bold, NAVY);
  draw(page, 'Dubai, United Arab Emirates · GSTIN: 29AAAAA0000A1Z5', M + 100, y - 24, 7, font, MUTED);
  drawRight(page, 'TAX INVOICE', w - M, y - 10, 16, bold, NAVY);
  badge(ctx, y - 26, w - M);
  y -= 48;
  page.drawLine({ start: { x: M, y }, end: { x: w - M, y }, thickness: 1, color: RULE });
  y -= 8;

  const mid = w / 2;
  page.drawRectangle({ x: M, y: y - 70, width: mid - M - 4, height: 70, borderColor: RULE, borderWidth: 0.8 });
  page.drawRectangle({ x: mid + 4, y: y - 70, width: w - M - mid - 4, height: 70, borderColor: RULE, borderWidth: 0.8 });
  draw(page, 'Bill To', M + 6, y - 12, 8, bold, NAVY);
  draw(page, d.billTo, M + 6, y - 24, 9, bold);
  draw(page, d.billAddr, M + 6, y - 36, 7, font, MUTED);
  draw(page, 'GSTIN No.: 29AAAAA0000A1Z5', M + 6, y - 48, 7, font, MUTED);
  draw(page, `Invoice No./Date: ${d.invoiceNumber} / ${d.invoiceDate}`, mid + 10, y - 14, 7, font);
  draw(page, `Due Date: ${d.dueDate}`, mid + 10, y - 26, 7, font);
  draw(page, `Job No.: ${d.job}`, mid + 10, y - 38, 7, font);
  draw(page, `Currency: ${d.currency === 'INR' ? 'INR' : 'INR'} 1.000000`, mid + 10, y - 50, 7, font);
  y -= 82;

  page.drawRectangle({ x: M, y: y - 78, width: w - 2 * M, height: 78, color: PANEL, borderColor: RULE, borderWidth: 0.6 });
  const ship = [
    ['Shipper', 'KingFisher Wings Group'],
    ['Consignee', d.billTo],
    ['MBL / MAWB', 'MBL-DEMO-9876'],
    ['HBL / HAWB', 'HBL-DEMO-0042'],
    ['POL', 'INMAA — Chennai'],
    ['POD', 'AEJEA — Jebel Ali'],
    ['Vessel / Voyage', 'MSC ISABELLA / V.042E'],
    ['Container', "MSCU1234567 40' HC"],
  ];
  ship.forEach((row, i) => {
    const col = i % 2;
    const rowi = Math.floor(i / 2);
    const x = M + 8 + col * ((w - 2 * M) / 2);
    draw(page, `${row[0]}: ${row[1]}`, x, y - 14 - rowi * 16, 7, font);
  });
  y -= 90;

  const headers = ['SAC', 'Charges', 'Qty', 'Curr', 'Taxable', 'SGST%', 'CGST%', 'Amount'];
  const cols = [32, 150, 28, 32, 52, 40, 40, 52];
  let x = M;
  page.drawRectangle({ x: M, y: y - 16, width: w - 2 * M, height: 16, color: DARK });
  headers.forEach((hLabel, i) => {
    draw(page, hLabel, x + 2, y - 12, 6, bold, WHITE);
    x += cols[i]!;
  });
  y -= 16;

  d.lines.forEach((line) => {
    x = M;
    const vals = [line.sac, line.desc, line.qty, 'INR', line.amount, '9', '9', line.amount];
    vals.forEach((v, i) => {
      draw(page, v.slice(0, i === 1 ? 28 : 12), x + 2, y - 11, 6, font);
      page.drawRectangle({
        x,
        y: y - 14,
        width: cols[i]!,
        height: 14,
        borderColor: RULE,
        borderWidth: 0.4,
      });
      x += cols[i]!;
    });
    y -= 14;
  });

  y -= 12;
  page.drawRectangle({ x: M, y: y - 70, width: (w - 2 * M) * 0.55, height: 70, borderColor: RULE, borderWidth: 0.7 });
  draw(page, 'Bank Details', M + 6, y - 12, 8, bold, NAVY);
  draw(page, 'Beneficiary: KingFisher Wings Group', M + 6, y - 26, 7, font);
  draw(page, 'Bank: HDFC · A/c: XXXXXXXXXXX', M + 6, y - 38, 7, font);
  draw(page, 'Terms: Payment by cash/transfer within 15 days.', M + 6, y - 52, 6, font, MUTED);

  const tx = M + (w - 2 * M) * 0.58;
  draw(page, 'Taxable Amount (INR)', tx, y - 14, 8, font);
  drawRight(page, d.subtotal, w - M, y - 14, 8, bold);
  draw(page, 'GST18 (SGST+CGST)', tx, y - 28, 8, font);
  drawRight(page, d.tax, w - M, y - 28, 8, bold);
  page.drawRectangle({ x: tx, y: y - 52, width: w - M - tx, height: 18, color: NAVY });
  draw(page, 'Total Amount (INR)', tx + 4, y - 46, 8, bold, WHITE);
  drawRight(page, d.total, w - M - 4, y - 46, 8, bold, WHITE);
}

function drawSummary(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  page.drawRectangle({ x: 0, y: y - 44, width: w, height: 44 + M, color: NAVY });
  drawLogo(ctx, M, y - 28, 26);
  drawRight(page, 'SUMMARY INVOICE', w - M, y - 12, 14, bold, WHITE);
  badge(ctx, y - 28, w - M);
  y -= 56;

  draw(page, 'Bill to', M, y, 8, bold, MUTED);
  draw(page, d.billTo, M, y - 14, 11, bold);
  draw(page, d.billAddr, M, y - 26, 8, font, MUTED);
  page.drawRectangle({ x: w - M - 150, y: y - 48, width: 150, height: 52, color: PANEL });
  draw(page, `No. ${d.invoiceNumber}`, w - M - 142, y - 12, 7, font);
  draw(page, `Date ${d.invoiceDate}`, w - M - 142, y - 24, 7, font);
  draw(page, `Job ${d.job}`, w - M - 142, y - 36, 7, font);
  y -= 60;

  page.drawRectangle({ x: M, y: y - 36, width: w - 2 * M, height: 36, borderColor: RULE, borderWidth: 0.7 });
  draw(page, 'Route: INMAA — Chennai → AEJEA — Jebel Ali', M + 6, y - 14, 8, font);
  draw(page, 'Vessel: MSC ISABELLA / V.042E', M + 6, y - 28, 8, font);
  y -= 48;

  page.drawRectangle({ x: M, y: y - 16, width: w - 2 * M, height: 16, color: ORANGE });
  draw(page, '#', M + 6, y - 12, 8, bold, WHITE);
  draw(page, 'Charge', M + 30, y - 12, 8, bold, WHITE);
  drawRight(page, 'Amount', w - M - 6, y - 12, 8, bold, WHITE);
  y -= 16;
  d.lines.forEach((line, i) => {
    draw(page, String(i + 1), M + 6, y - 12, 8, font);
    draw(page, line.desc, M + 30, y - 12, 8, bold);
    drawRight(page, line.amount, w - M - 6, y - 12, 8, font);
    page.drawLine({ start: { x: M, y: y - 16 }, end: { x: w - M, y: y - 16 }, thickness: 0.4, color: RULE });
    y -= 16;
  });
  y -= 8;
  page.drawRectangle({ x: w - M - 140, y: y - 32, width: 140, height: 32, color: NAVY });
  draw(page, 'Grand total', w - M - 132, y - 12, 7, font, WHITE);
  draw(page, `${d.currency} ${d.total}`, w - M - 132, y - 26, 11, bold, WHITE);
}

function drawSimple(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  drawLogo(ctx, w / 2 - 40, y - 36, 32);
  y -= 44;
  draw(page, 'KINGFISHER WINGS GROUP', w / 2 - measure(bold, 'KINGFISHER WINGS GROUP', 11) / 2, y, 11, bold, NAVY);
  y -= 12;
  draw(
    page,
    'Dubai, United Arab Emirates · WEB: www.kingfisherwingsgroup.com',
    w / 2 - 140,
    y,
    7,
    font,
    MUTED,
  );
  y -= 18;
  const title = `TAX INVOICE — ${d.invoiceNumber}`;
  draw(page, title, w / 2 - measure(bold, title, 12) / 2, y, 12, bold, NAVY);
  badge(ctx, y - 14, w / 2 + 80);
  y -= 28;
  page.drawLine({ start: { x: M, y }, end: { x: w - M, y }, thickness: 1, color: RULE });
  y -= 8;

  draw(page, 'Bill To', M, y, 8, bold, MUTED);
  draw(page, d.billTo, M, y - 12, 9, bold);
  draw(page, d.billAddr, M, y - 24, 7, font, MUTED);
  draw(page, `Invoice No. ${d.invoiceNumber} / ${d.invoiceDate}`, w / 2 + 10, y - 4, 7, font);
  draw(page, `Currency ${d.currency} 1.000000`, w / 2 + 10, y - 16, 7, font);
  draw(page, `Narration ${d.job}`, w / 2 + 10, y - 28, 7, font);
  y -= 44;

  page.drawLine({ start: { x: M, y }, end: { x: w - M, y }, thickness: 1.5, color: NAVY });
  const heads = ['Charges', 'Unit', 'Qty', 'Rate', 'Curr', 'Amount'];
  const xs = [M, M + 180, M + 230, M + 270, M + 340, M + 390];
  heads.forEach((hLabel, i) => draw(page, hLabel, xs[i]!, y - 12, 7, bold, NAVY));
  y -= 16;
  d.lines.forEach((line) => {
    draw(page, line.desc, xs[0]!, y - 11, 8, bold);
    draw(page, line.unit, xs[1]!, y - 11, 7, font);
    draw(page, line.qty, xs[2]!, y - 11, 7, font);
    draw(page, line.rate, xs[3]!, y - 11, 7, font);
    draw(page, d.currency, xs[4]!, y - 11, 7, font);
    draw(page, line.amount, xs[5]!, y - 11, 8, bold);
    page.drawLine({ start: { x: M, y: y - 14 }, end: { x: w - M, y: y - 14 }, thickness: 0.4, color: RULE });
    y -= 14;
  });
  y -= 10;
  drawRight(page, `Sub Total  ${d.subtotal}`, w - M, y, 8, font);
  y -= 12;
  drawRight(page, `VAT-05  ${d.tax}`, w - M, y, 8, font);
  y -= 14;
  page.drawLine({ start: { x: w - M - 140, y }, end: { x: w - M, y }, thickness: 1.5, color: NAVY });
  y -= 12;
  drawRight(page, `Total  ${d.total}`, w - M, y, 10, bold, NAVY);
  y -= 24;
  page.drawRectangle({ x: M, y: y - 36, width: w - 2 * M, height: 36, color: PANEL, borderColor: RULE, borderWidth: 0.6 });
  draw(page, 'ELECTRONIC & WIRE TRANSFER', M + 6, y - 12, 8, bold);
  draw(page, 'KingFisher Wings Group · A/c #: XXXXXXXXXXX · SWIFT: XXXXXX', M + 6, y - 26, 7, font);
}

function drawArabic(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  draw(page, 'Tax Invoice / INVOICE TAX', M, y - 8, 10, bold, NAVY);
  drawLogo(ctx, w / 2 - 28, y - 36, 30);
  drawRight(page, 'Arabic bilingual layout', w - M, y - 8, 8, font, MUTED);
  badge(ctx, y - 24, w - M);
  y -= 48;
  page.drawLine({ start: { x: M, y }, end: { x: w - M, y }, thickness: 1.2, color: NAVY });
  y -= 10;

  page.drawRectangle({ x: M, y: y - 60, width: (w - 2 * M) / 2 - 4, height: 60, borderColor: RULE, borderWidth: 0.7 });
  page.drawRectangle({
    x: M + (w - 2 * M) / 2 + 4,
    y: y - 60,
    width: (w - 2 * M) / 2 - 4,
    height: 60,
    borderColor: RULE,
    borderWidth: 0.7,
  });
  draw(page, 'Customer / Client', M + 6, y - 12, 8, bold);
  draw(page, d.billTo, M + 6, y - 26, 9, bold);
  draw(page, d.billAddr, M + 6, y - 38, 7, font, MUTED);
  const rx = M + (w - 2 * M) / 2 + 10;
  draw(page, `Invoice No.: ${d.invoiceNumber}`, rx, y - 14, 7, font);
  draw(page, `Invoice Date: ${d.invoiceDate}`, rx, y - 26, 7, font);
  draw(page, `Due Date: ${d.dueDate}`, rx, y - 38, 7, font);
  draw(page, 'VAT No.: 100000000000003', rx, y - 50, 7, font);
  y -= 72;

  const pairs = [
    ['Shipper', 'KingFisher Wings Group'],
    ['Consignee', d.billTo],
    ['Job', d.job],
    ['Vessel', 'MSC ISABELLA / V.042E'],
    ['POL', 'INMAA — Chennai'],
    ['POD', 'AEJEA — Jebel Ali'],
  ];
  pairs.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    draw(page, `${p[0]}: ${p[1]}`, M + 6 + col * ((w - 2 * M) / 2), y - 12 - row * 14, 7, font);
  });
  y -= 50;

  page.drawRectangle({ x: M, y: y - 16, width: w - 2 * M, height: 16, color: NAVY });
  draw(page, 'Charge', M + 4, y - 12, 7, bold, WHITE);
  draw(page, 'Curr', M + 200, y - 12, 7, bold, WHITE);
  draw(page, 'Rate', M + 250, y - 12, 7, bold, WHITE);
  draw(page, 'excl.VAT', M + 320, y - 12, 7, bold, WHITE);
  draw(page, 'VAT%', M + 400, y - 12, 7, bold, WHITE);
  draw(page, 'Total', M + 450, y - 12, 7, bold, WHITE);
  y -= 16;
  d.lines.forEach((line) => {
    draw(page, line.desc, M + 4, y - 11, 7, font);
    draw(page, 'AED', M + 200, y - 11, 7, font);
    draw(page, line.rate, M + 250, y - 11, 7, font);
    draw(page, line.amount, M + 320, y - 11, 7, font);
    draw(page, '5', M + 400, y - 11, 7, font);
    draw(page, line.amount, M + 450, y - 11, 7, bold);
    y -= 14;
  });
  y -= 6;
  page.drawRectangle({ x: M, y: y - 22, width: w - 2 * M, height: 22, color: PANEL });
  draw(page, `Total AED ${d.total}`, M + 6, y - 15, 9, bold);
}

function drawUsa(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  drawLogo(ctx, M, y - 36, 30);
  draw(page, 'KingFisher Wings Group', M + 90, y - 14, 9, bold, NAVY);
  drawRight(page, 'INVOICE', w - M, y - 10, 18, bold, NAVY);
  badge(ctx, y - 28, w - M);
  y -= 48;
  page.drawLine({ start: { x: M, y }, end: { x: w - M, y }, thickness: 1.5, color: NAVY });
  y -= 8;

  const fields: Array<[number, string, string]> = [
    [1, 'Invoice No.', d.invoiceNumber],
    [2, 'Invoice Date', d.invoiceDate],
    [3, 'Prepared By', 'KF Ops'],
    [6, 'Booking No.', 'BK-2026-0115'],
    [7, "BL No's", 'MBL-DEMO-9876'],
    [8, "HBL No's", 'HBL-DEMO-0042'],
    [9, 'File No.', d.job],
    [10, 'Carrier Name', 'MSC'],
    [11, 'Place of Receipt', 'Chennai'],
    [12, 'Port of Loading', 'INMAA'],
    [14, 'Port of Discharge', 'AEJEA'],
    [15, 'Final Destination', 'Jebel Ali, UAE'],
    [17, 'ETD Origin', '01-Oct-2026'],
    [18, 'ETA Discharge', '18-Oct-2026'],
    [20, 'Origin Vessel', 'MSC ISABELLA'],
    [21, 'Voyage', '042E'],
  ];
  const cellW = (w - 2 * M - 8) / 3;
  fields.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * (cellW + 4);
    const cy = y - row * 28;
    page.drawRectangle({ x, y: cy - 24, width: cellW, height: 24, borderColor: RULE, borderWidth: 0.6 });
    draw(page, `${f[0]}. ${f[1]}`, x + 3, cy - 10, 6, bold, MUTED);
    draw(page, f[2], x + 3, cy - 20, 7, bold);
  });
  y -= Math.ceil(fields.length / 3) * 28 + 8;

  page.drawRectangle({ x: M, y: y - 50, width: (w - 2 * M) / 2 - 4, height: 50, borderColor: RULE, borderWidth: 0.7 });
  page.drawRectangle({
    x: M + (w - 2 * M) / 2 + 4,
    y: y - 50,
    width: (w - 2 * M) / 2 - 4,
    height: 50,
    borderColor: RULE,
    borderWidth: 0.7,
  });
  draw(page, '22. Shipper / Bill To', M + 4, y - 12, 7, bold);
  draw(page, d.billTo, M + 4, y - 24, 8, bold);
  draw(page, d.billAddr, M + 4, y - 36, 7, font, MUTED);
  const px = M + (w - 2 * M) / 2 + 8;
  draw(page, '23. Payable to', px, y - 12, 7, bold);
  draw(page, 'KingFisher Wings Group', px, y - 24, 8, bold);
  draw(page, '24. Payable by: CASH', px, y - 36, 7, font);
  y -= 60;

  page.drawRectangle({ x: M, y: y - 16, width: w - 2 * M, height: 16, color: NAVY });
  draw(page, '30. PARTICULARS', M + 4, y - 12, 7, bold, WHITE);
  draw(page, '31. Currency', M + 250, y - 12, 7, bold, WHITE);
  draw(page, '32. AMOUNT', M + 330, y - 12, 7, bold, WHITE);
  draw(page, '33. QTY', M + 410, y - 12, 7, bold, WHITE);
  draw(page, '34. Amount', M + 460, y - 12, 7, bold, WHITE);
  y -= 16;
  d.lines.forEach((line) => {
    draw(page, line.desc, M + 4, y - 11, 7, font);
    draw(page, 'USD', M + 250, y - 11, 7, font);
    draw(page, line.rate, M + 330, y - 11, 7, font);
    draw(page, line.qty, M + 410, y - 11, 7, font);
    draw(page, line.amount, M + 460, y - 11, 7, bold);
    y -= 14;
  });
  y -= 8;
  draw(page, 'THANK YOU FOR YOUR BUSINESS & CONTINUED SUPPORT', M, y, 7, font, MUTED);
  drawRight(page, `Total: USD ${d.total}`, w - M, y, 10, bold);
}

function drawLand(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  page.drawRectangle({ x: 0, y: y - 4, width: w / 2, height: 8, color: NAVY });
  page.drawRectangle({ x: w / 2, y: y - 4, width: w / 2, height: 8, color: ORANGE });
  y -= 20;
  drawLogo(ctx, M, y - 28, 28);
  draw(page, 'KingFisher Wings Group', M + 80, y - 8, 10, bold, NAVY);
  draw(page, 'Land freight & transportation', M + 80, y - 20, 7, font, MUTED);
  drawRight(page, 'LAND FREIGHT INVOICE', w - M, y - 8, 12, bold, ORANGE);
  badge(ctx, y - 24, w - M);
  y -= 40;

  page.drawRectangle({ x: M, y: y - 40, width: w - 2 * M, height: 40, color: PANEL });
  [
    ['From', 'Jebel Ali WH'],
    ['To', 'Abu Dhabi'],
    ['Truck', 'DXB-T-4421'],
    ['Distance', '145 km'],
  ].forEach((r, i) => {
    const x = M + 10 + i * ((w - 2 * M) / 4);
    draw(page, r[0]!, x, y - 12, 7, font, MUTED);
    draw(page, r[1]!, x, y - 26, 9, bold);
  });
  y -= 52;

  page.drawRectangle({ x: M, y: y - 48, width: (w - 2 * M) / 2 - 4, height: 48, borderColor: RULE, borderWidth: 0.7 });
  draw(page, 'Bill To', M + 6, y - 12, 8, bold, NAVY);
  draw(page, d.billTo, M + 6, y - 26, 8, bold);
  draw(page, d.billAddr, M + 6, y - 38, 7, font, MUTED);
  const ix = M + (w - 2 * M) / 2 + 4;
  page.drawRectangle({ x: ix, y: y - 48, width: (w - 2 * M) / 2 - 4, height: 48, borderColor: RULE, borderWidth: 0.7 });
  draw(page, `Invoice: ${d.invoiceNumber}`, ix + 6, y - 14, 7, font);
  draw(page, `Date: ${d.invoiceDate}`, ix + 6, y - 26, 7, font);
  draw(page, `Job: ${d.job}`, ix + 6, y - 38, 7, font);
  y -= 60;

  page.drawRectangle({ x: M, y: y - 16, width: w - 2 * M, height: 16, color: NAVY });
  ['Service', 'Vehicle', 'Qty', 'Rate', 'Amount'].forEach((hLabel, i) => {
    draw(page, hLabel, M + 6 + i * 100, y - 12, 7, bold, WHITE);
  });
  y -= 16;
  const landLines = [
    ['Door delivery — FTL', 'Trailer', '1', '850.00', '850.00'],
    ['Waiting / detention', 'Hour', '2', '75.00', '150.00'],
    ['Documentation', 'Job', '1', '50.00', '50.00'],
  ];
  landLines.forEach((row) => {
    row.forEach((cell, i) => draw(page, cell, M + 6 + i * 100, y - 11, 7, i === 0 ? bold : font));
    y -= 14;
  });
  y -= 8;
  page.drawRectangle({ x: w - M - 130, y: y - 22, width: 130, height: 22, color: ORANGE });
  draw(page, 'Total AED 1,050.00', w - M - 122, y - 15, 9, bold, WHITE);
}

function drawPreprinted(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  page.drawRectangle({
    x: M,
    y: y - 50,
    width: w - 2 * M,
    height: 50,
    borderColor: MUTED,
    borderWidth: 0.8,
    // dashed look approximated by light fill
    color: PANEL,
  });
  draw(page, '[ Pre-printed letterhead area ]', w / 2 - 70, y - 20, 8, font, MUTED);
  drawLogo(ctx, w / 2 - 24, y - 46, 20);
  y -= 64;
  draw(page, 'TAX INVOICE', w / 2 - measure(bold, 'TAX INVOICE', 14) / 2, y, 14, bold, NAVY);
  badge(ctx, y - 14, w / 2 + 90);
  y -= 28;

  page.drawRectangle({ x: M, y: y - 55, width: (w - 2 * M) / 2 - 6, height: 55, borderColor: MUTED, borderWidth: 0.8 });
  page.drawRectangle({
    x: M + (w - 2 * M) / 2 + 6,
    y: y - 55,
    width: (w - 2 * M) / 2 - 6,
    height: 55,
    borderColor: MUTED,
    borderWidth: 0.8,
  });
  draw(page, 'Bill To', M + 6, y - 12, 7, bold, MUTED);
  draw(page, d.billTo, M + 6, y - 26, 9, bold);
  draw(page, d.billAddr, M + 6, y - 40, 7, font, MUTED);
  const rx = M + (w - 2 * M) / 2 + 12;
  draw(page, `No. ${d.invoiceNumber}`, rx, y - 14, 8, font);
  draw(page, `Date ${d.invoiceDate}`, rx, y - 28, 8, font);
  draw(page, `Due ${d.dueDate}`, rx, y - 42, 8, font);
  y -= 70;

  page.drawLine({ start: { x: M, y }, end: { x: w - M, y }, thickness: 1, color: NAVY });
  draw(page, 'Description', M + 4, y - 12, 8, bold);
  draw(page, 'Qty', M + 280, y - 12, 8, bold);
  draw(page, 'Rate', M + 340, y - 12, 8, bold);
  draw(page, 'Amount', M + 420, y - 12, 8, bold);
  y -= 16;
  d.lines.forEach((line) => {
    draw(page, line.desc, M + 4, y - 11, 8, font);
    draw(page, line.qty, M + 280, y - 11, 8, font);
    draw(page, line.rate, M + 340, y - 11, 8, font);
    draw(page, line.amount, M + 420, y - 11, 8, bold);
    page.drawLine({ start: { x: M, y: y - 14 }, end: { x: w - M, y: y - 14 }, thickness: 0.4, color: RULE });
    y -= 14;
  });
  y -= 10;
  drawRight(page, `Total: ${d.currency} ${d.total}`, w - M, y, 12, bold, NAVY);
}

function drawWarehouse(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  page.drawRectangle({ x: 0, y: y - 42, width: w, height: 42 + M, color: TEAL });
  drawLogo(ctx, M, y - 28, 24);
  draw(page, 'KingFisher Wings Group', M + 70, y - 10, 10, bold, WHITE);
  draw(page, 'Warehouse & storage billing', M + 70, y - 22, 7, font, WHITE);
  drawRight(page, 'WAREHOUSE INVOICE', w - M, y - 10, 12, bold, WHITE);
  badge(ctx, y - 26, w - M);
  y -= 56;

  const boxes = [
    ['Warehouse', 'Jebel Ali WH-3\nZone B · Bay 12'],
    ['Customer', `${d.billTo}\n${d.billAddr}`],
    ['Invoice', `${d.invoiceNumber}\nPeriod 01–14 Sep 2026`],
  ];
  boxes.forEach((b, i) => {
    const bw = (w - 2 * M - 12) / 3;
    const x = M + i * (bw + 6);
    page.drawRectangle({ x, y: y - 50, width: bw, height: 50, borderColor: RULE, borderWidth: 0.7 });
    draw(page, b[0]!, x + 4, y - 12, 8, bold, TEAL);
    draw(page, b[1]!.split('\n')[0]!, x + 4, y - 26, 7, bold);
    draw(page, b[1]!.split('\n')[1] || '', x + 4, y - 38, 7, font, MUTED);
  });
  y -= 62;

  page.drawRectangle({ x: M, y: y - 16, width: w - 2 * M, height: 16, color: TEAL });
  ['SKU / Item', 'Days', 'CBM', 'Rate/day', 'Amount'].forEach((hLabel, i) => {
    draw(page, hLabel, M + 6 + i * 100, y - 12, 7, bold, WHITE);
  });
  y -= 16;
  const rows = [
    ['Carton goods — lot A', '14', '12.5', '2.50', '437.50'],
    ['Pallet storage — lot B', '14', '8.0', '3.00', '336.00'],
    ['Handling in/out', '—', '—', '—', '150.00'],
  ];
  rows.forEach((row) => {
    row.forEach((cell, i) => draw(page, cell, M + 6 + i * 100, y - 11, 7, i === 0 ? bold : font));
    y -= 14;
  });
  y -= 8;
  page.drawRectangle({ x: w - M - 130, y: y - 22, width: 130, height: 22, color: TEAL });
  draw(page, 'Total AED 923.50', w - M - 122, y - 15, 9, bold, WHITE);
}

function drawDebitVietnam(ctx: Ctx): void {
  const { page, font, bold, data: d, w, h } = ctx;
  let y = h - M;
  drawLogo(ctx, M, y - 36, 30);
  draw(page, 'KingFisher Wings Group', M + 90, y - 12, 10, bold, NAVY);
  draw(page, 'Dubai, United Arab Emirates', M + 90, y - 24, 7, font, MUTED);
  drawRight(page, 'DEBIT NOTE', w - M, y - 10, 16, bold, RED);
  drawRight(page, d.invoiceNumber, w - M, y - 28, 8, font, MUTED);
  badge(ctx, y - 42, w - M);
  y -= 56;

  draw(page, 'Kinh Gui (Messrs)', M, y, 8, bold);
  draw(page, d.billTo, M, y - 12, 9, bold);
  draw(page, 'Nguoi Lien He / Attn: Accounting', M, y - 24, 7, font, MUTED);
  drawRight(page, `Exchange Rate: VND 1`, w - M, y - 8, 8, font);
  drawRight(page, `TOTAL (VND): VND 15,800`, w - M, y - 22, 8, bold);
  y -= 36;

  page.drawRectangle({ x: M, y: y - 48, width: w - 2 * M, height: 48, color: rgb(1, 0.94, 0.94), borderColor: RULE, borderWidth: 0.5 });
  [
    ['POL', 'INMAA — Chennai'],
    ['POD', 'AEJEA — Jebel Ali'],
    ['VSL', 'MSC ISABELLA / V.042E'],
    ['JOB', d.job],
  ].forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    draw(page, `${r[0]}: ${r[1]}`, M + 8 + col * ((w - 2 * M) / 2), y - 14 - row * 16, 7, font);
  });
  y -= 56;

  page.drawRectangle({ x: M, y: y - 16, width: w - 2 * M, height: 16, color: RED });
  ['NO', 'DESCRIPTION', 'QTY', 'CUR', 'PRICE', 'USD', 'VND'].forEach((hLabel, i) => {
    draw(page, hLabel, M + 4 + i * 72, y - 12, 6, bold, WHITE);
  });
  y -= 16;
  d.lines.forEach((line, i) => {
    draw(page, String(i + 1), M + 4, y - 11, 7, font);
    draw(page, line.desc.slice(0, 22), M + 76, y - 11, 7, font);
    draw(page, line.qty, M + 148, y - 11, 7, font);
    draw(page, 'USD', M + 220, y - 11, 7, font);
    draw(page, line.rate, M + 292, y - 11, 7, font);
    draw(page, line.amount, M + 364, y - 11, 7, font);
    draw(page, String(Math.round(Number(line.amount.replace(/,/g, '')) * 10)), M + 436, y - 11, 7, bold);
    y -= 14;
  });
  y -= 10;
  draw(page, 'Remarks', M, y, 8, bold, RED);
  draw(page, 'Please pay by cash or at VCB sell rate on payment date.', M, y - 12, 7, font, MUTED);
  draw(
    page,
    'Vui long thanh toan bang tien mat hoac chuyen khoan theo ty gia ban ra cua VCB.',
    M,
    y - 24,
    7,
    font,
    MUTED,
  );
}

const DRAWERS: Record<Exclude<InvoiceFormatLayoutKind, 'generic'>, (ctx: Ctx) => void> = {
  tax_india: drawTaxIndia,
  summary: drawSummary,
  simple: drawSimple,
  arabic_rtl: drawArabic,
  usa: drawUsa,
  land: drawLand,
  preprinted: drawPreprinted,
  warehouse: drawWarehouse,
  debit_vietnam: drawDebitVietnam,
};

/**
 * Client PDF with a distinct Fresa-inspired layout per layoutKind.
 * KingFisher branding only — does not fetch third-party sample PDFs.
 */
export async function generateInvoiceFormatLayoutPdf(
  preview: InvoiceFormatPreview,
  data: InvoiceFormatPdfData = {},
  _options?: { logoUrl?: string },
): Promise<Blob> {
  void _options;

  if (preview.layoutKind === 'generic') {
    return generateInvoicePdf(invoiceFormatToInvoicePdfModel(preview, data));
  }

  const letter = preview.paper === 'Letter' || preview.layoutKind === 'usa';
  const w = letter ? LETTER_W : A4_W;
  const h = letter ? LETTER_H : A4_H;

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await loadLogo(doc);
  const resolved = resolveData(preview, data);

  const ctx: Ctx = { page, font, bold, logo, preview, data: resolved, w, h };
  DRAWERS[preview.layoutKind](ctx);

  draw(page, `Computer generated · KingFisher Wings · Format-${preview.formatNumber}`, M, 18, 6, font, MUTED);

  const bytes = await doc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/** Map a staff invoice record into layout PDF data (best-effort). */
export function invoiceRecordToFormatPdfData(invoice: {
  invoice_number?: string | null;
  number?: string | null;
  invoice_date?: string | null;
  party_name?: string | null;
  currency_code?: string | null;
  subtotal?: number | null;
  tax_total?: number | null;
  total_amount?: number | null;
  lines?: Array<{
    description?: string | null;
    charge_code?: string | null;
    quantity?: number | null;
    unit_price?: number | null;
    amount?: number | null;
    line_total?: number | null;
  }>;
}): InvoiceFormatPdfData {
  const money = (n: number | null | undefined) =>
    n == null || Number.isNaN(Number(n))
      ? undefined
      : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return {
    invoiceNumber: invoice.invoice_number || invoice.number || undefined,
    invoiceDate: invoice.invoice_date || undefined,
    billToName: invoice.party_name || undefined,
    currencyCode: invoice.currency_code || undefined,
    subtotal: money(invoice.subtotal),
    tax: money(invoice.tax_total),
    total: money(invoice.total_amount),
    lines: (invoice.lines ?? []).map((line) => ({
      description: line.description || line.charge_code || 'Charge',
      qty: line.quantity != null ? String(line.quantity) : undefined,
      rate: money(line.unit_price),
      amount: money(line.amount ?? line.line_total),
    })),
  };
}
