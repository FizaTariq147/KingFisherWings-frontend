import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type PDFImage } from 'pdf-lib';
import logoAsset from '@/assets/logo.png';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';
import type { PdfBrandingOptions } from '@/features/files/utils/pdfBranding';
import { normalizeDocLines } from '../components/WmsDocumentDetail';
import type { WmsDocument } from '../types/wms.types';
import { displayDocNumber } from './normalizeWms';

export type WmsPdfKind = 'grn' | 'gdo';

export type WmsDocumentPdfCompany = {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  footerTel?: string;
  footerEmails?: string;
  tagline?: string;
};

export type WmsDocumentPdfOptions = {
  kind: WmsPdfKind;
  doc: WmsDocument;
  warehouseLabel?: string;
  partyLabel?: string;
  personName?: string;
  jobLabel?: string;
  itemLabelById?: Map<string, string>;
  company?: WmsDocumentPdfCompany;
  logoUrl?: string;
};

type TableRow = {
  no: string;
  driver: string;
  truck: string;
  commodity: string;
  container: string;
  eid: string;
  timeIn: string;
  timeOut: string;
  remarks: string;
};

/** A4 — matches invoice PDF page geometry. */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 32;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_RESERVE = 62;

/** Same palette as `generateInvoicePdf`. */
const NAVY = rgb(0.039, 0.161, 0.259);
const ORANGE = rgb(0.957, 0.447, 0.078);
const TEXT = rgb(0.102, 0.118, 0.141);
const MUTED = rgb(0.45, 0.48, 0.52);
const LABEL = rgb(0.5, 0.53, 0.56);
const RULE = rgb(0.82, 0.84, 0.86);
const PANEL_BG = rgb(0.965, 0.968, 0.973);
const PANEL_BORDER = rgb(0.88, 0.895, 0.91);
const WHITE = rgb(1, 1, 1);
const ROW_ALT = rgb(0.988, 0.99, 0.992);

const NOTES = [
  'Once the truck exits the warehouse premises, we are no longer responsible for the goods.',
  'The transporter or receiving party is responsible for verifying the quantity and condition of the goods before the vehicle leaves.',
  'Any discrepancies or issues with the goods must be reported and resolved before the truck departs from the warehouse.',
  'We will not entertain any claims regarding the count or condition of goods after they have left the warehouse.',
];

/** Column widths sum to CONTENT_W (531.28). */
const COLS: { key: keyof TableRow; label: string; width: number }[] = [
  { key: 'no', label: '#', width: 22 },
  { key: 'driver', label: "DRIVER", width: 70 },
  { key: 'truck', label: 'TRUCK / TRAILER', width: 56 },
  { key: 'commodity', label: 'COMMODITY', width: 54 },
  { key: 'container', label: 'CONTAINER', width: 60 },
  { key: 'eid', label: 'EID / LIC', width: 68 },
  { key: 'timeIn', label: 'IN', width: 40 },
  { key: 'timeOut', label: 'OUT', width: 40 },
  { key: 'remarks', label: 'REMARKS', width: 121.28 },
];

function pick(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function formatDate(value: string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return safePdfText(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function measure(font: PDFFont, text: string, size: number): number {
  try {
    return font.widthOfTextAtSize(safePdfText(text) || ' ', size);
  } catch {
    return 0;
  }
}

function fit(font: PDFFont, text: string, size: number, maxW: number): string {
  const t = safePdfText(text) || '—';
  if (measure(font, t, size) <= maxW) return t;
  let s = t;
  while (s.length > 1 && measure(font, `${s}…`, size) > maxW) s = s.slice(0, -1);
  return `${s}…`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const raw = safePdfText(text || '');
  if (!raw) return [''];
  const words = raw.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
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
  opts: { color?: ReturnType<typeof rgb> },
): void {
  const radius = Math.min(r, h / 2, w / 2);
  page.drawRectangle({
    x: x + radius,
    y,
    width: w - radius * 2,
    height: h,
    color: opts.color,
  });
  page.drawRectangle({
    x,
    y: y + radius,
    width: w,
    height: h - radius * 2,
    color: opts.color,
  });
  page.drawCircle({ x: x + radius, y: y + radius, size: radius, color: opts.color });
  page.drawCircle({ x: x + w - radius, y: y + radius, size: radius, color: opts.color });
  page.drawCircle({ x: x + radius, y: y + h - radius, size: radius, color: opts.color });
  page.drawCircle({ x: x + w - radius, y: y + h - radius, size: radius, color: opts.color });
}

function sectionTitle(page: PDFPage, title: string, x: number, y: number, fontBold: PDFFont): void {
  page.drawRectangle({ x, y: y - 1, width: 2.8, height: 9, color: ORANGE });
  drawText(page, title, x + 8, y, 8, fontBold, NAVY);
}

function drawPanel(page: PDFPage, x: number, yBottom: number, w: number, h: number): void {
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

function drawMiniIcon(
  page: PDFPage,
  kind: 'phone' | 'mail' | 'web',
  x: number,
  y: number,
): void {
  page.drawCircle({ x: x + 4, y: y + 3, size: 4.2, color: NAVY });
  page.drawCircle({
    x: x + 4,
    y: y + 3,
    size: 2.2,
    color: kind === 'phone' ? ORANGE : WHITE,
  });
}

function drawTopAccent(page: PDFPage): void {
  page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W * 0.7, height: 6, color: NAVY });
  page.drawRectangle({
    x: PAGE_W * 0.7,
    y: PAGE_H - 6,
    width: PAGE_W * 0.3,
    height: 6,
    color: ORANGE,
  });
}

function drawPageFooter(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  phone: string,
  email: string,
  website: string,
): void {
  const top = 48;
  page.drawLine({
    start: { x: MARGIN, y: top + 16 },
    end: { x: PAGE_W - MARGIN, y: top + 16 },
    thickness: 0.6,
    color: RULE,
  });

  const colW = CONTENT_W / 3;
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

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 8, color: NAVY });
  page.drawRectangle({
    x: PAGE_W * 0.78,
    y: 0,
    width: PAGE_W * 0.22,
    height: 8,
    color: ORANGE,
  });
}

function lineItemLabel(
  r: Record<string, unknown>,
  itemLabelById?: Map<string, string>,
): string {
  const itemId = pick(r, 'item_id', 'itemId', 'wms_item_id');
  const nested = (r.item && typeof r.item === 'object' ? r.item : null) as Record<
    string,
    unknown
  > | null;
  const nestedLabel = nested
    ? [pick(nested, 'code'), pick(nested, 'name')].filter(Boolean).join(' - ')
    : '';
  return (
    nestedLabel ||
    pick(
      r,
      'commodity',
      'item_name',
      'itemName',
      'item_code',
      'itemCode',
      'sku',
      'code',
      'description',
    ) ||
    itemLabelById?.get(itemId) ||
    (itemId ? `Item ${itemId.slice(0, 8)}…` : '')
  );
}

function buildRows(
  doc: WmsDocument,
  itemLabelById?: Map<string, string>,
): TableRow[] {
  const lines = normalizeDocLines(doc.lines);
  const docRec = doc as Record<string, unknown>;
  const rows: TableRow[] = lines.map((r, index) => {
    const qty = pick(r, 'quantity', 'qty', 'received_qty', 'expected_qty');
    const uom = pick(r, 'uom_code', 'uom', 'unit');
    const commodity =
      lineItemLabel(r, itemLabelById) ||
      (qty ? `${qty}${uom ? ` ${uom}` : ''}` : '');
    const remarksParts = [
      pick(r, 'remarks', 'note', 'notes', 'remark'),
      pick(r, 'batch_code', 'batchCode') ? `Batch: ${pick(r, 'batch_code', 'batchCode')}` : '',
      qty && !pick(r, 'remarks') ? `Qty: ${qty}${uom ? ` ${uom}` : ''}` : '',
    ].filter(Boolean);

    return {
      no: String(index + 1),
      driver: pick(
        r,
        'driver_name',
        'driverName',
        'driver',
        'drivers_name',
        'transporter_name',
      ),
      truck: pick(
        r,
        'truck_number',
        'truckNumber',
        'truck_trailer',
        'trailer_number',
        'vehicle_number',
        'vehicle_no',
        'plate_number',
      ),
      commodity,
      container: pick(
        r,
        'container_number',
        'containerNumber',
        'container_no',
        'container',
        'cntr_no',
      ),
      eid: pick(
        r,
        'eid_no',
        'eid',
        'driver_license',
        'driver_licence',
        'license_no',
        'dri_lic_no',
        'id_number',
      ),
      timeIn: pick(r, 'time_in', 'timeIn', 'in_time', 'arrival_time'),
      timeOut: pick(r, 'time_out', 'timeOut', 'out_time', 'departure_time'),
      remarks: remarksParts.join(' · ') || pick(docRec, 'remarks') || '',
    };
  });

  while (rows.length < 3) {
    rows.push({
      no: String(rows.length + 1),
      driver: '',
      truck: '',
      commodity: '',
      container: '',
      eid: '',
      timeIn: '',
      timeOut: '',
      remarks: '',
    });
  }
  return rows;
}

function resolveMeta(options: WmsDocumentPdfOptions) {
  const { kind, doc, partyLabel, personName, warehouseLabel, company, jobLabel } = options;
  const rec = doc as Record<string, unknown>;
  const nestedParty =
    rec.party && typeof rec.party === 'object'
      ? (rec.party as Record<string, unknown>)
      : null;
  const nestedUser =
    (rec.created_by && typeof rec.created_by === 'object'
      ? (rec.created_by as Record<string, unknown>)
      : null) ||
    (rec.prepared_by && typeof rec.prepared_by === 'object'
      ? (rec.prepared_by as Record<string, unknown>)
      : null);

  const customer =
    partyLabel ||
    pick(rec, 'customer_name', 'customer', 'party_name', 'consignee_name') ||
    (nestedParty
      ? pick(nestedParty, 'name', 'short_name', 'code')
      : '') ||
    warehouseLabel ||
    '';

  const person =
    personName ||
    pick(
      rec,
      'person_name',
      'personName',
      'prepared_by_name',
      'created_by_name',
      'received_by',
      'dispatched_by',
      'contact_name',
    ) ||
    (nestedUser
      ? [pick(nestedUser, 'first_name', 'firstName'), pick(nestedUser, 'last_name', 'lastName')]
          .filter(Boolean)
          .join(' ') || pick(nestedUser, 'name', 'full_name', 'email')
      : '') ||
    customer;

  const dateRaw =
    pick(
      rec,
      kind === 'grn' ? 'received_at' : 'delivered_at',
      'dispatched_at',
      'document_date',
      'created_at',
    ) || doc.created_at;

  const job =
    jobLabel ||
    pick(rec, 'job_number', 'jobNumber', 'job_ref', 'job_code', 'reference') ||
    '';

  return {
    person: safePdfText(person || '—'),
    date: formatDate(dateRaw) || '—',
    customer: safePdfText(customer || '—'),
    job: safePdfText(job || '—'),
    warehouse: safePdfText(warehouseLabel || pick(rec, 'warehouse_name', 'warehouse') || '—'),
    docNumber: safePdfText(displayDocNumber(doc) || '—'),
    companyName: safePdfText(company?.name || 'KINGFISHER WINGS GROUP').toUpperCase(),
    tagline: safePdfText(
      company?.tagline || 'FREIGHT - LOGISTICS - GENERAL TRADING',
    ).toUpperCase(),
    phone: safePdfText(company?.phone || '+971 55 5355 286'),
    email: safePdfText(company?.email || 'info@kingfisherwingsgroup.com'),
    website: safePdfText(company?.website || 'www.kingfisherwingsgroup.com'),
    address: safePdfText(
      company?.address || 'Office, Dubai, United Arab Emirates',
    ),
  };
}

async function embedLogo(
  doc: PDFDocument,
  logoUrl?: string,
): Promise<{ image: PDFImage | null; width: number; height: number }> {
  const candidates = [
    logoUrl,
    typeof logoAsset === 'string' ? logoAsset : undefined,
    '/kingfisher-logo.png',
    typeof window !== 'undefined'
      ? new URL('/kingfisher-logo.png', window.location.origin).href
      : undefined,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    try {
      const url =
        raw.startsWith('data:') || /^https?:\/\//i.test(raw) || raw.startsWith('blob:')
          ? raw
          : new URL(raw, window.location.origin).href;
      const res = await fetch(url);
      if (!res.ok) continue;
      const bytes = await res.arrayBuffer();
      let image: PDFImage;
      try {
        image = await doc.embedPng(bytes);
      } catch {
        image = await doc.embedJpg(bytes);
      }
      const maxH = 48;
      const scale = maxH / image.height;
      return { image, width: image.width * scale, height: maxH };
    } catch {
      /* try next */
    }
  }
  return { image: null, width: 0, height: 0 };
}

function measureRowHeight(row: TableRow, font: PDFFont, size: number): number {
  let maxLines = 1;
  for (const col of COLS) {
    const lines = wrapText(row[col.key], font, size, col.width - 6);
    maxLines = Math.max(maxLines, Math.min(lines.length, 3));
  }
  return Math.max(22, maxLines * 10 + 8);
}

function drawNotes(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  yTop: number,
  kind: WmsPdfKind,
): number {
  const notesH = 118;
  drawPanel(page, MARGIN, yTop - notesH, CONTENT_W, notesH);
  sectionTitle(page, 'NOTES / REMARKS', MARGIN + 10, yTop - 13, fontBold);

  let y = yTop - 28;
  NOTES.forEach((note, i) => {
    const prefix = `${i + 1}. `;
    const lines = wrapText(note, font, 7, CONTENT_W - 28);
    lines.forEach((line, li) => {
      drawText(
        page,
        li === 0 ? `${prefix}${line}` : `   ${line}`,
        MARGIN + 10,
        y,
        7,
        font,
        TEXT,
      );
      y -= 10;
    });
  });

  if (kind === 'grn') {
    drawText(page, 'NOTE: SYSTEM GENERATED', MARGIN + 10, yTop - notesH + 8, 6.5, fontBold, MUTED);
  }

  return yTop - notesH - 10;
}

export function wmsDocumentPdfBranding(
  kind: WmsPdfKind,
  documentNumber: string,
  documentDate?: string,
): PdfBrandingOptions {
  const documentType = kind === 'grn' ? 'GOODS RECEIVED NOTE' : 'GOODS DISPATCH ORDER';
  return {
    companyName: 'KingFisher Wings Group',
    subtitle: 'Freight · Logistics · General Trading',
    documentType,
    documentNumber,
    title: documentNumber,
    documentDate,
    footerLine: 'KingFisher Wings Group — Warehouse Document',
    logoUrl: typeof logoAsset === 'string' ? logoAsset : '/kingfisher-logo.png',
  };
}

/**
 * GRN / GDO PDF — same KingFisher chrome as the tax invoice
 * (navy/orange bars, logo header, panels, navy table, contact footer).
 */
export async function generateWmsDocumentPdf(options: WmsDocumentPdfOptions): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(pdf, options.logoUrl);
  const meta = resolveMeta(options);
  const rows = buildRows(options.doc, options.itemLabelById);

  const documentTitle = options.kind === 'grn' ? 'GRN' : 'GDO';
  const documentSubtitle =
    options.kind === 'grn'
      ? 'GOODS RECEIVED NOTE / WAREHOUSE GATE PASS'
      : 'GOODS DISPATCH ORDER / WAREHOUSE GATE PASS';
  const copyLabel = 'ORIGINAL';

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H;

  const ensureSpace = (need: number) => {
    if (y - need >= FOOTER_RESERVE + 8) return false;
    drawPageFooter(page, font, fontBold, meta.phone, meta.email, meta.website);
    page = pdf.addPage([PAGE_W, PAGE_H]);
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
  drawTopAccent(page);
  y = PAGE_H - 20;

  // ——— Header (invoice parity) ———
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
  drawRight(page, meta.companyName, PAGE_W - MARGIN, rightY, 10.5, fontBold, NAVY);
  rightY -= 11;
  drawRight(page, meta.tagline, PAGE_W - MARGIN, rightY, 6.5, fontBold, ORANGE);
  rightY -= 13;
  const phoneW = measure(font, meta.phone, 7.5);
  drawMiniIcon(page, 'phone', PAGE_W - MARGIN - phoneW - 14, rightY - 1);
  drawRight(page, meta.phone, PAGE_W - MARGIN, rightY, 7.5, font, MUTED);
  rightY -= 12;
  const emailW = measure(font, meta.email, 7.5);
  drawMiniIcon(page, 'mail', PAGE_W - MARGIN - emailW - 14, rightY - 1);
  drawRight(page, meta.email, PAGE_W - MARGIN, rightY, 7.5, font, MUTED);

  y = Math.min(y - (logo.height || 40), rightY) - 16;

  // ——— Title + ORIGINAL badge ———
  drawText(page, documentTitle, MARGIN, y, 24, fontBold, NAVY);

  const badgeH = 15;
  const badgePad = 14;
  const badgeW = Math.max(58, measure(fontBold, copyLabel, 7.5) + badgePad);
  const badgeX = PAGE_W - MARGIN - badgeW;
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

  y -= 13;
  drawText(page, documentSubtitle, MARGIN, y, 7.5, font, MUTED);
  y -= 10;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: NAVY,
  });
  y -= 14;

  // ——— Party | Document details panels ———
  const gap = 10;
  const colW = (CONTENT_W - gap) / 2;
  const infoH = 86;
  drawPanel(page, MARGIN, y - infoH, colW, infoH);
  drawPanel(page, MARGIN + colW + gap, y - infoH, colW, infoH);

  let leftY = y - 13;
  sectionTitle(page, 'PARTY / CUSTOMER', MARGIN + 10, leftY, fontBold);
  leftY -= 15;
  const billRows: Array<[string, string]> = [
    ['Client', meta.customer],
    ['Attn', meta.person],
    ['Warehouse', meta.warehouse],
    ['Address', meta.address],
  ];
  for (const [label, value] of billRows) {
    labeledValue(page, label, value, MARGIN + 10, leftY, 52, colW - 68, font, fontBold);
    leftY -= 13;
  }

  let detY = y - 13;
  const detX = MARGIN + colW + gap;
  sectionTitle(
    page,
    options.kind === 'grn' ? 'GRN DETAILS' : 'GDO DETAILS',
    detX + 10,
    detY,
    fontBold,
  );
  detY -= 14;
  const detailRows: Array<[string, string]> = [
    [options.kind === 'grn' ? 'GRN No.' : 'GDO No.', meta.docNumber],
    [options.kind === 'grn' ? 'Received Date' : 'Dispatch Date', meta.date],
    ['Job / Ref No.', meta.job],
    ['Prepared By', meta.person],
    ['Document', documentTitle],
  ];
  for (const [label, value] of detailRows) {
    labeledValue(page, label, value, detX + 10, detY, 78, colW - 98, font, fontBold);
    detY -= 12;
  }
  y -= infoH + 14;

  // ——— Gate-pass lines table ———
  const headerH = 22;

  const drawTableHeader = () => {
    page.drawRectangle({
      x: MARGIN,
      y: y - headerH,
      width: CONTENT_W,
      height: headerH,
      color: NAVY,
    });
    let x = MARGIN;
    const hy = y - 14;
    for (const col of COLS) {
      drawText(
        page,
        fit(fontBold, col.label, 6.5, col.width - 4),
        x + 3,
        hy,
        6.5,
        fontBold,
        WHITE,
      );
      x += col.width;
    }
    y -= headerH;
  };

  drawTableHeader();

  rows.forEach((row, index) => {
    const rowH = measureRowHeight(row, font, 7);
    if (ensureSpace(rowH + headerH + 10)) {
      drawTableHeader();
    }

    if (index % 2 === 1) {
      page.drawRectangle({
        x: MARGIN,
        y: y - rowH,
        width: CONTENT_W,
        height: rowH,
        color: ROW_ALT,
      });
    }

    let x = MARGIN;
    for (const col of COLS) {
      const cellLines = wrapText(row[col.key] || '—', font, 7, col.width - 6).slice(0, 3);
      let ly = y - 11;
      for (const line of cellLines) {
        drawText(page, line, x + 3, ly, 7, font, TEXT);
        ly -= 9;
      }
      x += col.width;
    }
    y -= rowH;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.45,
      color: RULE,
    });
  });

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1.2,
    color: NAVY,
  });
  y -= 14;

  ensureSpace(130);
  y = drawNotes(page, font, fontBold, y, options.kind);

  drawPageFooter(page, font, fontBold, meta.phone, meta.email, meta.website);

  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
