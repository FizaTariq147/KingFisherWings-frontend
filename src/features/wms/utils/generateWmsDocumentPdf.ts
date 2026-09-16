import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
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

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 28;
const MARGIN_BOTTOM = 56;

const OLIVE = rgb(0.545, 0.58, 0.404); // ~#8B9467
const ORANGE = rgb(0.957, 0.447, 0.078); // #F47214
const DARK = rgb(0.22, 0.22, 0.22);
const TEXT = rgb(0.08, 0.08, 0.08);
const MUTED = rgb(0.35, 0.35, 0.35);
const RULE = rgb(0.55, 0.55, 0.55);
const FOOTER_BLUE = rgb(0.55, 0.72, 0.9);
const WHITE = rgb(1, 1, 1);
const LIGHT_GRAY = rgb(0.92, 0.92, 0.92);

const NOTES = [
  'Once the truck exits the warehouse premises, we are no longer responsible for the goods.',
  'The transporter or receiving party is responsible for verifying the quantity and condition of the goods before the vehicle leaves.',
  'Any discrepancies or issues with the goods must be reported and resolved before the truck departs from the warehouse.',
  'We will not entertain any claims regarding the count or condition of goods after they have left the warehouse.',
];

const COLS: { key: keyof TableRow; label: string; width: number }[] = [
  { key: 'no', label: 'No.', width: 22 },
  { key: 'driver', label: "Driver's Name", width: 72 },
  { key: 'truck', label: 'Truck/trailer numbers', width: 58 },
  { key: 'commodity', label: 'Commodity', width: 58 },
  { key: 'container', label: 'Container Number', width: 62 },
  { key: 'eid', label: 'EID NO / DRI LIC NO', width: 72 },
  { key: 'timeIn', label: 'TIME IN', width: 42 },
  { key: 'timeOut', label: 'TIME OUT', width: 42 },
  { key: 'remarks', label: 'REMARKS', width: 111 },
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
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
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
) {
  page.drawText(safePdfText(text), { x, y, size, font, color });
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

  // Keep at least 3 rows like the sample template.
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
  const { kind, doc, partyLabel, personName, warehouseLabel, company } = options;
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

  return {
    person: safePdfText(person || '—'),
    date: formatDate(dateRaw) || '—',
    customer: safePdfText(customer || '—'),
    companyName: safePdfText(company?.name || 'KingFisher Logistic'),
    phone: safePdfText(company?.phone || '+971 55 5355 286'),
    email: safePdfText(company?.email || 'info@kingfisherwingsgroup.com'),
    website: safePdfText(company?.website || 'www.kingfisherwingsgroup.com'),
    address: safePdfText(
      company?.address ||
        'Office, Dubai, United Arab Emirates',
    ),
    footerTel: safePdfText(company?.footerTel || company?.phone || '+971 55 5355 286'),
    footerEmails: safePdfText(
      company?.footerEmails ||
        company?.email ||
        'info@kingfisherwingsgroup.com',
    ),
  };
}

async function embedLogo(
  doc: PDFDocument,
  logoUrl?: string,
): Promise<{
  image: Awaited<ReturnType<PDFDocument['embedPng']>> | null;
  width: number;
  height: number;
}> {
  try {
    const candidates = [
      logoUrl,
      typeof logoAsset === 'string' ? logoAsset : undefined,
      '/kingfisher-logo.png',
    ].filter(Boolean) as string[];

    for (const raw of candidates) {
      try {
        const url = /^https?:|^data:|^blob:/i.test(raw)
          ? raw
          : new URL(raw, window.location.origin).href;
        const res = await fetch(url);
        if (!res.ok) continue;
        const bytes = await res.arrayBuffer();
        const image = raw.toLowerCase().includes('.jpg') || raw.toLowerCase().includes('.jpeg')
          ? await doc.embedJpg(bytes)
          : await doc.embedPng(bytes);
        const maxH = 42;
        const scale = maxH / image.height;
        return { image, width: image.width * scale, height: maxH };
      } catch {
        /* try next */
      }
    }
  } catch {
    /* ignore */
  }
  return { image: null, width: 0, height: 0 };
}

function drawHeader(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  logo: { image: Awaited<ReturnType<PDFDocument['embedPng']>> | null; width: number; height: number },
  meta: ReturnType<typeof resolveMeta>,
  yTop: number,
): number {
  let y = yTop;

  if (logo.image) {
    page.drawImage(logo.image, {
      x: MARGIN_X,
      y: y - logo.height,
      width: logo.width,
      height: logo.height,
    });
  } else {
    drawText(page, meta.companyName, MARGIN_X, y - 18, 11, fontBold, DARK);
  }

  // Contact block top-right with orange accent bullets
  const contactX = PAGE_W - MARGIN_X - 168;
  const contacts = [
    { label: meta.phone },
    { label: meta.email },
    { label: meta.website },
  ];
  let cy = y - 10;
  for (const c of contacts) {
    page.drawCircle({
      x: contactX,
      y: cy + 2,
      size: 3.2,
      color: ORANGE,
    });
    drawText(page, c.label, contactX + 8, cy, 7.5, font, MUTED);
    cy -= 12;
  }

  // Brand bars under logo (grey + orange like sample)
  const barY = y - Math.max(logo.height, 40) - 10;
  page.drawRectangle({
    x: MARGIN_X,
    y: barY,
    width: PAGE_W - MARGIN_X * 2 - 120,
    height: 3.5,
    color: DARK,
  });
  page.drawRectangle({
    x: PAGE_W - MARGIN_X - 110,
    y: barY,
    width: 110,
    height: 3.5,
    color: ORANGE,
  });

  return barY - 16;
}

function drawInfoBoxes(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  kind: WmsPdfKind,
  meta: ReturnType<typeof resolveMeta>,
  yTop: number,
): number {
  const gap = 8;
  const boxW = (PAGE_W - MARGIN_X * 2 - gap * 2) / 3;
  const headerH = 16;
  const bodyH = 42;
  const boxes = [
    { title: 'PERSON NAME', value: meta.person },
    {
      title: kind === 'grn' ? 'GOODS RECEIVED DATE' : 'DISPATCHED DATE',
      value: meta.date,
    },
    { title: 'COSTUMER', value: meta.customer },
  ];

  boxes.forEach((box, i) => {
    const x = MARGIN_X + i * (boxW + gap);
    page.drawRectangle({
      x,
      y: yTop - headerH,
      width: boxW,
      height: headerH,
      color: OLIVE,
      borderColor: RULE,
      borderWidth: 0.6,
    });
    const titleW = fontBold.widthOfTextAtSize(box.title, 8);
    drawText(
      page,
      box.title,
      x + (boxW - titleW) / 2,
      yTop - headerH + 5,
      8,
      fontBold,
      WHITE,
    );

    page.drawRectangle({
      x,
      y: yTop - headerH - bodyH,
      width: boxW,
      height: bodyH,
      borderColor: RULE,
      borderWidth: 0.6,
      color: WHITE,
    });

    const lines = wrapText(box.value, font, 8, boxW - 10);
    let ly = yTop - headerH - 14;
    for (const line of lines.slice(0, 3)) {
      drawText(page, line, x + 5, ly, 8, font, TEXT);
      ly -= 11;
    }
  });

  return yTop - headerH - bodyH - 14;
}

function measureRowHeight(row: TableRow, font: PDFFont, size: number): number {
  let maxLines = 1;
  for (const col of COLS) {
    const lines = wrapText(row[col.key], font, size, col.width - 4);
    maxLines = Math.max(maxLines, lines.length);
  }
  return Math.max(22, maxLines * 10 + 8);
}

function drawTable(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  rows: TableRow[],
  yTop: number,
  onNeedPage: () => { page: PDFPage; y: number },
): { page: PDFPage; y: number } {
  let pageRef = page;
  let y = yTop;
  const tableW = COLS.reduce((s, c) => s + c.width, 0);
  const headerH = 28;

  const drawHeaderRow = () => {
    let x = MARGIN_X;
    pageRef.drawRectangle({
      x: MARGIN_X,
      y: y - headerH,
      width: tableW,
      height: headerH,
      color: LIGHT_GRAY,
      borderColor: RULE,
      borderWidth: 0.7,
    });
    for (const col of COLS) {
      pageRef.drawRectangle({
        x,
        y: y - headerH,
        width: col.width,
        height: headerH,
        borderColor: RULE,
        borderWidth: 0.5,
      });
      const labelLines = wrapText(col.label, fontBold, 6.5, col.width - 4);
      let ly = y - 10;
      for (const line of labelLines.slice(0, 3)) {
        const lw = fontBold.widthOfTextAtSize(line, 6.5);
        drawText(pageRef, line, x + (col.width - lw) / 2, ly, 6.5, fontBold, TEXT);
        ly -= 8;
      }
      x += col.width;
    }
    y -= headerH;
  };

  drawHeaderRow();

  for (const row of rows) {
    const rowH = measureRowHeight(row, font, 7);
    if (y - rowH < MARGIN_BOTTOM + 120) {
      const next = onNeedPage();
      pageRef = next.page;
      y = next.y;
      drawHeaderRow();
    }

    let x = MARGIN_X;
    for (const col of COLS) {
      pageRef.drawRectangle({
        x,
        y: y - rowH,
        width: col.width,
        height: rowH,
        borderColor: RULE,
        borderWidth: 0.5,
      });
      const cellLines = wrapText(row[col.key], font, 7, col.width - 4);
      let ly = y - 11;
      for (const line of cellLines) {
        drawText(pageRef, line, x + 2, ly, 7, font, TEXT);
        ly -= 9;
      }
      x += col.width;
    }
    y -= rowH;
  }

  return { page: pageRef, y };
}

function drawNotes(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  yTop: number,
  kind: WmsPdfKind,
): number {
  let y = yTop - 6;
  drawText(page, 'NOTES:', MARGIN_X, y, 9, fontBold, TEXT);
  // underline
  page.drawLine({
    start: { x: MARGIN_X, y: y - 2 },
    end: { x: MARGIN_X + 42, y: y - 2 },
    thickness: 0.8,
    color: TEXT,
  });
  y -= 14;

  NOTES.forEach((note, i) => {
    const prefix = `${i + 1}. `;
    const lines = wrapText(note, font, 7.5, PAGE_W - MARGIN_X * 2 - 14);
    lines.forEach((line, li) => {
      drawText(
        page,
        li === 0 ? `${prefix}${line}` : `   ${line}`,
        MARGIN_X,
        y,
        7.5,
        font,
        MUTED,
      );
      y -= 11;
    });
  });

  if (kind === 'grn') {
    drawText(page, 'NOTE: SYSTEM GENERATED', MARGIN_X, y - 2, 7, fontBold, MUTED);
    y -= 12;
  }

  return y;
}

function drawFooter(
  page: PDFPage,
  font: PDFFont,
  meta: ReturnType<typeof resolveMeta>,
) {
  const lines = [
    `ADDRESS: ${meta.address}`,
    `TEL NO: ${meta.footerTel}    EMAIL: ${meta.footerEmails}`,
  ];
  let y = 36;
  for (const line of [...lines].reverse()) {
    const w = font.widthOfTextAtSize(line, 6.5);
    drawText(page, line, (PAGE_W - w) / 2, y, 6.5, font, FOOTER_BLUE);
    y += 10;
  }
}

export function wmsDocumentPdfBranding(
  kind: WmsPdfKind,
  documentNumber: string,
  documentDate?: string,
): PdfBrandingOptions {
  const documentType = kind === 'grn' ? 'GOODS RECEIVED NOTE' : 'GOODS DISPATCH ORDER';
  return {
    companyName: 'KingFisher Logistic',
    subtitle: 'KingFisher Tech Gold',
    documentType,
    documentNumber,
    title: documentNumber,
    documentDate,
    footerLine: 'KingFisher Logistic — Warehouse Document',
    logoUrl: typeof logoAsset === 'string' ? logoAsset : '/kingfisher-logo.png',
  };
}

/**
 * GRN / GDO PDF matching the warehouse gate-pass layout
 * (logo + contact header, olive info boxes, 9-column driver/truck table, notes, footer).
 * All fields are populated from the live WMS document + optional labels/branding.
 */
export async function generateWmsDocumentPdf(options: WmsDocumentPdfOptions): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(pdf, options.logoUrl);
  const meta = resolveMeta(options);
  const rows = buildRows(options.doc, options.itemLabelById);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - 28;

  const newPage = () => {
    drawFooter(page, font, meta);
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - 28;
    return { page, y };
  };

  y = drawHeader(page, font, fontBold, logo, meta, y);
  y = drawInfoBoxes(page, font, fontBold, options.kind, meta, y);

  const tableResult = drawTable(page, font, fontBold, rows, y, () => newPage());
  page = tableResult.page;
  y = tableResult.y - 8;

  if (y < MARGIN_BOTTOM + 110) {
    const n = newPage();
    page = n.page;
    y = n.y;
  }
  y = drawNotes(page, font, fontBold, y, options.kind);
  drawFooter(page, font, meta);

  // Document number watermark-style small tag top-left under margin (dynamic)
  const docNo = safePdfText(displayDocNumber(options.doc));
  if (docNo) {
    drawText(
      page,
      `${options.kind === 'grn' ? 'GRN' : 'GDO'} ${docNo}`,
      MARGIN_X,
      PAGE_H - 16,
      6.5,
      font,
      MUTED,
    );
  }

  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
