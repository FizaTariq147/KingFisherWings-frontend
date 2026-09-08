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

/** Landscape A4 — seven ledger columns need width more than height. */
const PAGE_W = 841.89;
const PAGE_H = 595.28;
/** Body-only margins — stampPdfWithBranding adds logo header + footer. */
const MARGIN_X = 36;
const MARGIN_TOP = 28;
const MARGIN_BOTTOM = 28;
const COL_GAP = 8;
const ROW_PAD = 4;
const ROW_LINE_H = 10;
const FONT_SIZE = 8;
const MAX_CELL_LINES = 2;
/** WinAnsi-safe ellipsis (StandardFonts cannot encode U+2026). */
const ELLIPSIS = '...';
const ACCENT = rgb(0.04, 0.16, 0.26);
const MUTED = rgb(0.39, 0.45, 0.51);
const RULE = rgb(0.82, 0.86, 0.9);
const ROW_ALT = rgb(0.96, 0.97, 0.98);
const TEXT = rgb(0.12, 0.14, 0.18);

/**
 * Proportional column shares of content width (must sum to 1).
 * Amount columns sized for values like 1,234,567.89 without colliding.
 */
const COL_SHARES = {
  date: 0.09,
  type: 0.12,
  reference: 0.14,
  description: 0.29,
  debit: 0.12,
  credit: 0.12,
  balance: 0.12,
} as const;

function money(value: number | undefined, currency?: string): string {
  if (value == null || Number.isNaN(value)) return '';
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
}

function measure(font: PDFFont, text: string, size: number): number {
  if (!text) return 0;
  return font.widthOfTextAtSize(text, size);
}

function truncateToWidth(font: PDFFont, text: string, size: number, maxWidth: number): string {
  if (!text || maxWidth <= 0) return '';
  if (measure(font, text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 0 && measure(font, `${out}${ELLIPSIS}`, size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return out ? `${out}${ELLIPSIS}` : '';
}

/** Word-aware wrap capped at maxLines; last line truncates if needed. */
function wrapText(
  font: PDFFont,
  text: string,
  size: number,
  maxWidth: number,
  maxLines = MAX_CELL_LINES,
): string[] {
  const cleaned = safePdfText(text, '').replace(/\s+/g, ' ').trim();
  if (!cleaned || maxWidth <= 0 || maxLines <= 0) return [];
  if (measure(font, cleaned, size) <= maxWidth) return [cleaned];

  const words = cleaned.split(' ');
  const lines: string[] = [];
  let current = '';

  const flushHard = (token: string) => {
    let rest = token;
    while (rest && lines.length < maxLines) {
      let take = rest.length;
      while (take > 1 && measure(font, rest.slice(0, take), size) > maxWidth) take -= 1;
      const piece = truncateToWidth(font, rest.slice(0, take), size, maxWidth);
      if (!piece) break;
      lines.push(piece);
      rest = rest.slice(take);
    }
  };

  for (const word of words) {
    if (lines.length >= maxLines) break;
    const next = current ? `${current} ${word}` : word;
    if (measure(font, next, size) <= maxWidth) {
      current = next;
      continue;
    }
    if (current) {
      lines.push(current);
      current = '';
      if (lines.length >= maxLines) break;
    }
    if (measure(font, word, size) <= maxWidth) {
      current = word;
    } else {
      flushHard(word);
      current = '';
    }
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).map((line, i) =>
      i === maxLines - 1 ? truncateToWidth(font, line, size, maxWidth) : line,
    );
  }
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1]!;
    // If we stopped early, mark truncation on the last line.
    const joined = lines.join(' ');
    if (joined.length < cleaned.length) {
      lines[maxLines - 1] = truncateToWidth(font, last, size, maxWidth);
    }
  }
  return lines.length ? lines : [truncateToWidth(font, cleaned, size, maxWidth)];
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
  if (!text) return;
  const w = measure(font, text, size);
  page.drawText(text, { x: xRight - w, y, size, font, color });
}

function drawLines(
  page: PDFPage,
  lines: string[],
  x: number,
  yTop: number,
  size: number,
  font: PDFFont,
  color = TEXT,
  lineHeight = ROW_LINE_H,
) {
  let y = yTop;
  for (const line of lines) {
    if (!line) continue;
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
}

/** Keep statement dates short so they fit the Date column (no ISO time spill). */
function formatStatementDate(value?: string): string {
  const cleaned = safePdfText(value || '', '');
  if (!cleaned) return '';
  const isoDay = cleaned.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDay) return isoDay[1]!;
  const t = Date.parse(cleaned);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return cleaned.slice(0, 10);
}

function formatTypeLabel(value?: string): string {
  const cleaned = safePdfText(value || '', '');
  if (!cleaned) return '';
  return cleaned.replaceAll('_', ' ');
}

type ColumnLayout = {
  dateX: number;
  typeX: number;
  referenceX: number;
  descriptionX: number;
  debitRight: number;
  creditRight: number;
  balanceRight: number;
  dateW: number;
  typeW: number;
  referenceW: number;
  descriptionW: number;
  debitW: number;
  creditW: number;
  balanceW: number;
};

function buildColumnLayout(contentW: number): ColumnLayout {
  const gapsTotal = COL_GAP * 6;
  const usable = Math.max(200, contentW - gapsTotal);
  const dateW = usable * COL_SHARES.date;
  const typeW = usable * COL_SHARES.type;
  const referenceW = usable * COL_SHARES.reference;
  const descriptionW = usable * COL_SHARES.description;
  const debitW = usable * COL_SHARES.debit;
  const creditW = usable * COL_SHARES.credit;
  const balanceW = usable * COL_SHARES.balance;

  const dateX = MARGIN_X;
  const typeX = dateX + dateW + COL_GAP;
  const referenceX = typeX + typeW + COL_GAP;
  const descriptionX = referenceX + referenceW + COL_GAP;
  const balanceRight = PAGE_W - MARGIN_X;
  const creditRight = balanceRight - balanceW - COL_GAP;
  const debitRight = creditRight - creditW - COL_GAP;

  return {
    dateX,
    typeX,
    referenceX,
    descriptionX,
    debitRight,
    creditRight,
    balanceRight,
    dateW,
    typeW,
    referenceW,
    descriptionW,
    debitW,
    creditW,
    balanceW,
  };
}

/**
 * Body-only account statement content (landscape).
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
  const contentW = PAGE_W - MARGIN_X * 2;
  const col = buildColumnLayout(contentW);

  const prepared = input.lines.map((line) => ({
    date: formatStatementDate(line.date),
    type: formatTypeLabel(line.type),
    reference: safePdfText(line.reference || '', ''),
    description: safePdfText(line.description || '', ''),
    debit: money(line.debit),
    credit: money(line.credit),
    balance: money(line.balance),
  }));

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;
  let tableStarted = false;

  const drawTableHeader = () => {
    page.drawRectangle({
      x: MARGIN_X - 2,
      y: y - 5,
      width: contentW + 4,
      height: 16,
      color: rgb(0.93, 0.95, 0.97),
    });
    const headerY = y;
    page.drawText('Date', {
      x: col.dateX,
      y: headerY,
      size: FONT_SIZE,
      font: boldFont,
      color: MUTED,
    });
    page.drawText('Type', {
      x: col.typeX,
      y: headerY,
      size: FONT_SIZE,
      font: boldFont,
      color: MUTED,
    });
    page.drawText(truncateToWidth(boldFont, 'Reference', FONT_SIZE, col.referenceW), {
      x: col.referenceX,
      y: headerY,
      size: FONT_SIZE,
      font: boldFont,
      color: MUTED,
    });
    page.drawText(truncateToWidth(boldFont, 'Description', FONT_SIZE, col.descriptionW), {
      x: col.descriptionX,
      y: headerY,
      size: FONT_SIZE,
      font: boldFont,
      color: MUTED,
    });
    drawRight(page, 'Debit', col.debitRight, headerY, FONT_SIZE, boldFont, MUTED);
    drawRight(page, 'Credit', col.creditRight, headerY, FONT_SIZE, boldFont, MUTED);
    drawRight(page, 'Balance', col.balanceRight, headerY, FONT_SIZE, boldFont, MUTED);
    y -= 18;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN_BOTTOM) return;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN_TOP;
    if (tableStarted) drawTableHeader();
  };

  // Title row — stack "As of" when it would collide with the title.
  const asOfLabel = asOf ? `As of ${asOf}` : '';
  const titleW = measure(boldFont, title, 13);
  const asOfW = asOfLabel ? measure(bodyFont, asOfLabel, 9) : 0;
  if (asOfLabel && titleW + asOfW + 16 > contentW) {
    page.drawText(truncateToWidth(boldFont, title, 13, contentW), {
      x: MARGIN_X,
      y,
      size: 13,
      font: boldFont,
      color: ACCENT,
    });
    y -= 14;
    page.drawText(asOfLabel, { x: MARGIN_X, y, size: 9, font: bodyFont, color: MUTED });
  } else {
    page.drawText(truncateToWidth(boldFont, title, 13, contentW - asOfW - 16), {
      x: MARGIN_X,
      y,
      size: 13,
      font: boldFont,
      color: ACCENT,
    });
    if (asOfLabel) drawRight(page, asOfLabel, PAGE_W - MARGIN_X, y, 9, bodyFont, MUTED);
  }
  y -= 14;

  if (subtitle) {
    const subLines = wrapText(bodyFont, subtitle, 9, contentW, 3);
    ensureSpace(subLines.length * 11 + 2);
    drawLines(page, subLines, MARGIN_X, y, 9, bodyFont, MUTED, 11);
    y -= subLines.length * 11;
  }

  if (generatedAt) {
    ensureSpace(12);
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
  y -= 14;

  if (partyName) {
    const label = `${partyLabel}:`;
    const labelW = measure(bodyFont, label, 9);
    const nameX = MARGIN_X + labelW + 8;
    const nameMax = Math.max(48, PAGE_W - MARGIN_X - nameX);
    const nameLines = wrapText(boldFont, partyName, 10, nameMax, 2);
    ensureSpace(Math.max(14, nameLines.length * 12));
    page.drawText(label, { x: MARGIN_X, y, size: 9, font: bodyFont, color: MUTED });
    drawLines(page, nameLines, nameX, y, 10, boldFont, TEXT, 12);
    y -= Math.max(14, nameLines.length * 12);
  }

  // Opening / closing / outstanding on separate lines — never one crowded strip.
  const summaryRows: string[] = [];
  if (input.openingBalance != null) {
    summaryRows.push(`Opening balance: ${money(input.openingBalance, currency)}`);
  }
  if (input.closingBalance != null) {
    summaryRows.push(`Closing balance: ${money(input.closingBalance, currency)}`);
  }
  if (input.agingTotal != null) {
    summaryRows.push(`Outstanding: ${money(input.agingTotal, currency)}`);
  }
  if (summaryRows.length) {
    ensureSpace(summaryRows.length * 12 + 4);
    for (const row of summaryRows) {
      page.drawText(truncateToWidth(boldFont, row, 9, contentW), {
        x: MARGIN_X,
        y,
        size: 9,
        font: boldFont,
        color: TEXT,
      });
      y -= 12;
    }
    y -= 2;
  }

  if (input.agingBuckets?.length) {
    for (const bucket of input.agingBuckets) {
      const agingLine = `${safePdfText(bucket.label, 'Bucket')}: ${money(bucket.amount, currency)}`;
      ensureSpace(11);
      page.drawText(truncateToWidth(bodyFont, agingLine, 8, contentW), {
        x: MARGIN_X,
        y,
        size: 8,
        font: bodyFont,
        color: MUTED,
      });
      y -= 11;
    }
    y -= 4;
  }

  tableStarted = true;
  drawTableHeader();

  if (!prepared.length) {
    ensureSpace(20);
    page.drawText('No statement lines for this period.', {
      x: MARGIN_X,
      y,
      size: 10,
      font: bodyFont,
      color: MUTED,
    });
  } else {
    prepared.forEach((line, index) => {
      const dateText = truncateToWidth(bodyFont, line.date, FONT_SIZE, col.dateW);
      const typeLines = wrapText(bodyFont, line.type, FONT_SIZE, col.typeW);
      const referenceLines = wrapText(bodyFont, line.reference, FONT_SIZE, col.referenceW);
      const descriptionLines = wrapText(bodyFont, line.description, FONT_SIZE, col.descriptionW);
      const rowLines = Math.max(
        1,
        typeLines.length,
        referenceLines.length,
        descriptionLines.length,
      );
      const rowH = rowLines * ROW_LINE_H + ROW_PAD;

      ensureSpace(rowH);
      if (index % 2 === 1) {
        page.drawRectangle({
          x: MARGIN_X - 2,
          y: y - rowH + ROW_LINE_H,
          width: contentW + 4,
          height: rowH,
          color: ROW_ALT,
        });
      }

      page.drawText(dateText, {
        x: col.dateX,
        y,
        size: FONT_SIZE,
        font: bodyFont,
        color: TEXT,
      });
      drawLines(page, typeLines, col.typeX, y, FONT_SIZE, bodyFont);
      drawLines(page, referenceLines, col.referenceX, y, FONT_SIZE, bodyFont);
      drawLines(page, descriptionLines, col.descriptionX, y, FONT_SIZE, bodyFont);

      // Amounts clipped to their column so they never draw into the next field.
      drawRight(
        page,
        truncateToWidth(bodyFont, line.debit, FONT_SIZE, col.debitW),
        col.debitRight,
        y,
        FONT_SIZE,
        bodyFont,
      );
      drawRight(
        page,
        truncateToWidth(bodyFont, line.credit, FONT_SIZE, col.creditW),
        col.creditRight,
        y,
        FONT_SIZE,
        bodyFont,
      );
      drawRight(
        page,
        truncateToWidth(boldFont, line.balance, FONT_SIZE, col.balanceW),
        col.balanceRight,
        y,
        FONT_SIZE,
        boldFont,
      );

      y -= rowH;
    });
  }

  if (input.closingBalance != null) {
    y -= 6;
    ensureSpace(24);
    page.drawLine({
      start: { x: MARGIN_X, y: y + 8 },
      end: { x: PAGE_W - MARGIN_X, y: y + 8 },
      thickness: 0.75,
      color: RULE,
    });
    const closingValue = money(input.closingBalance, currency);
    const valueW = measure(boldFont, closingValue, 11);
    page.drawText(
      truncateToWidth(boldFont, 'Closing balance', 10, Math.max(40, contentW - valueW - 16)),
      {
        x: MARGIN_X,
        y,
        size: 10,
        font: boldFont,
        color: TEXT,
      },
    );
    drawRight(page, closingValue, col.balanceRight, y, 11, boldFont, ACCENT);
  }

  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
