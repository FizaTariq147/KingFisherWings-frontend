import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';

export interface AccountStatementPdfLine {
  date?: string;
  type?: string;
  reference?: string;
  description?: string;
  debit?: number;
  credit?: number;
  balance?: number;
}

export interface AccountStatementPdfAgingBucket {
  label: string;
  amount: number;
}

export interface AccountStatementPdfInput {
  /** Shown in body only — system branding stamp adds logo / company header. */
  title?: string;
  subtitle?: string;
  partyName?: string;
  partyLabel?: string;
  asOf?: string;
  currencyCode?: string;
  openingBalance?: number;
  closingBalance?: number;
  lines: AccountStatementPdfLine[];
  agingBuckets?: AccountStatementPdfAgingBucket[];
  agingTotal?: number;
  generatedAt?: string;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
/** Body-only margins — shared stampPdfWithBranding adds logo header + footer. */
const MARGIN_X = 40;
const MARGIN_TOP = 36;
const MARGIN_BOTTOM = 36;
const ACCENT = rgb(0.04, 0.16, 0.26);
const MUTED = rgb(0.39, 0.45, 0.51);
const RULE = rgb(0.82, 0.86, 0.9);
const ROW_ALT = rgb(0.96, 0.97, 0.98);
const TEXT = rgb(0.12, 0.14, 0.18);

function money(value: number | undefined, currency?: string): string {
  if (value == null || Number.isNaN(value)) return '';
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
}

function drawRight(
  page: PDFPage,
  text: string,
  xRight: number,
  y: number,
  size: number,
  font: PDFFont,
  color = TEXT,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - w, y, size, font, color });
}

function truncate(font: PDFFont, text: string, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && font.widthOfTextAtSize(`${out}…`, size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

/**
 * Body-only account statement content.
 * Callers must run the result through {@link triggerBrandedPdfDownload} /
 * {@link ensureBrandedPdfBlob} so logo, accent bar, and footer match invoices & quotations.
 */
export async function generateAccountStatementPdf(
  input: AccountStatementPdfInput,
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const title = safePdfText(input.title || 'Account Statement', 'Account Statement');
  const subtitle = safePdfText(input.subtitle || '', '');
  const partyName = safePdfText(input.partyName || '', '');
  const partyLabel = safePdfText(input.partyLabel || 'Account', 'Account');
  const asOf = safePdfText(input.asOf || '', '');
  const currency = safePdfText(input.currencyCode || '', '');
  const generatedAt = safePdfText(
    input.generatedAt || new Date().toISOString().slice(0, 10),
    '',
  );

  const col = {
    date: MARGIN_X,
    type: MARGIN_X + 62,
    reference: MARGIN_X + 118,
    description: MARGIN_X + 210,
    debit: PAGE_W - MARGIN_X - 168,
    credit: PAGE_W - MARGIN_X - 90,
    balance: PAGE_W - MARGIN_X,
  };
  const descMax = col.debit - col.description - 8;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;

  const drawTableHeader = () => {
    page.drawRectangle({
      x: MARGIN_X - 4,
      y: y - 4,
      width: PAGE_W - MARGIN_X * 2 + 8,
      height: 18,
      color: rgb(0.93, 0.95, 0.97),
    });
    const headerY = y;
    page.drawText('Date', { x: col.date, y: headerY, size: 8, font: boldFont, color: MUTED });
    page.drawText('Type', { x: col.type, y: headerY, size: 8, font: boldFont, color: MUTED });
    page.drawText('Reference', {
      x: col.reference,
      y: headerY,
      size: 8,
      font: boldFont,
      color: MUTED,
    });
    page.drawText('Description', {
      x: col.description,
      y: headerY,
      size: 8,
      font: boldFont,
      color: MUTED,
    });
    drawRight(page, 'Debit', col.debit + 48, headerY, 8, boldFont, MUTED);
    drawRight(page, 'Credit', col.credit + 48, headerY, 8, boldFont, MUTED);
    drawRight(page, 'Balance', col.balance, headerY, 8, boldFont, MUTED);
    y -= 20;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN_BOTTOM) return;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN_TOP;
    drawTableHeader();
  };

  // Document title (branding stamp supplies logo + company name above this)
  page.drawText(title, { x: MARGIN_X, y, size: 13, font: boldFont, color: ACCENT });
  if (asOf) {
    drawRight(page, `As of ${asOf}`, PAGE_W - MARGIN_X, y, 9, bodyFont, MUTED);
  }
  y -= 14;

  if (subtitle) {
    page.drawText(subtitle, { x: MARGIN_X, y, size: 9, font: bodyFont, color: MUTED });
    y -= 12;
  }

  if (generatedAt) {
    page.drawText(`Generated ${generatedAt}`, {
      x: MARGIN_X,
      y,
      size: 8,
      font: bodyFont,
      color: MUTED,
    });
    y -= 12;
  }

  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_W - MARGIN_X, y },
    thickness: 0.75,
    color: RULE,
  });
  y -= 16;

  if (partyName) {
    page.drawText(`${partyLabel}:`, { x: MARGIN_X, y, size: 9, font: bodyFont, color: MUTED });
    page.drawText(partyName, {
      x: MARGIN_X + 56,
      y,
      size: 10,
      font: boldFont,
      color: TEXT,
    });
    y -= 16;
  }

  const summaryBits = [
    input.openingBalance != null ? `Opening ${money(input.openingBalance, currency)}` : '',
    input.closingBalance != null ? `Closing ${money(input.closingBalance, currency)}` : '',
    input.agingTotal != null ? `Outstanding ${money(input.agingTotal, currency)}` : '',
  ].filter(Boolean);
  if (summaryBits.length) {
    page.drawText(summaryBits.join('   ·   '), {
      x: MARGIN_X,
      y,
      size: 9,
      font: boldFont,
      color: TEXT,
    });
    y -= 14;
  }

  if (input.agingBuckets?.length) {
    const agingText = input.agingBuckets
      .map((b) => `${safePdfText(b.label, 'Bucket')}: ${money(b.amount, currency)}`)
      .join('   ');
    page.drawText(truncate(bodyFont, agingText, 8, PAGE_W - MARGIN_X * 2), {
      x: MARGIN_X,
      y,
      size: 8,
      font: bodyFont,
      color: MUTED,
    });
    y -= 16;
  }

  drawTableHeader();

  if (!input.lines.length) {
    ensureSpace(24);
    page.drawText('No statement lines for this period.', {
      x: MARGIN_X,
      y,
      size: 10,
      font: bodyFont,
      color: MUTED,
    });
  } else {
    input.lines.forEach((line, index) => {
      ensureSpace(16);
      if (index % 2 === 1) {
        page.drawRectangle({
          x: MARGIN_X - 4,
          y: y - 3,
          width: PAGE_W - MARGIN_X * 2 + 8,
          height: 14,
          color: ROW_ALT,
        });
      }
      const date = safePdfText(line.date || '', '');
      const type = safePdfText(line.type || '', '');
      const reference = safePdfText(line.reference || '', '');
      const description = truncate(
        bodyFont,
        safePdfText(line.description || '', ''),
        8,
        descMax,
      );
      page.drawText(date, { x: col.date, y, size: 8, font: bodyFont, color: TEXT });
      page.drawText(truncate(bodyFont, type, 8, 50), {
        x: col.type,
        y,
        size: 8,
        font: bodyFont,
        color: TEXT,
      });
      page.drawText(truncate(bodyFont, reference, 8, 86), {
        x: col.reference,
        y,
        size: 8,
        font: bodyFont,
        color: TEXT,
      });
      page.drawText(description, {
        x: col.description,
        y,
        size: 8,
        font: bodyFont,
        color: TEXT,
      });
      drawRight(page, money(line.debit), col.debit + 48, y, 8, bodyFont);
      drawRight(page, money(line.credit), col.credit + 48, y, 8, bodyFont);
      drawRight(page, money(line.balance), col.balance, y, 8, boldFont);
      y -= 14;
    });
  }

  y -= 8;
  ensureSpace(28);
  page.drawLine({
    start: { x: MARGIN_X, y: y + 10 },
    end: { x: PAGE_W - MARGIN_X, y: y + 10 },
    thickness: 0.75,
    color: RULE,
  });
  if (input.closingBalance != null) {
    page.drawText('Closing balance', {
      x: MARGIN_X,
      y,
      size: 10,
      font: boldFont,
      color: TEXT,
    });
    drawRight(page, money(input.closingBalance, currency), col.balance, y, 11, boldFont, ACCENT);
  }

  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
