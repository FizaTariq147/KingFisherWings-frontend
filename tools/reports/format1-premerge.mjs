/**
 * Pre-merge checks for Format 1 polish:
 * 1) geometry failures vs logo/letterhead/branding boxes
 * 2) static sample digits/dates/currencies/amounts + qty proof
 * Writes reports/format1/geometry-failures.json and static-sample-audit.json
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { renderSpec } from './render-spec.mjs';
import { inspectPdfFile } from './extract.mjs';
import { displayGeometry } from './page-box.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const code = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA';
const outDir = path.join(root, 'reports/format1');
fs.mkdirSync(outDir, { recursive: true });
const GEOMETRY_TOLERANCE = 0.1;

function near(a, b, tolerance = GEOMETRY_TOLERANCE) {
  return Math.abs(a - b) <= tolerance;
}

function matchLine(line, others) {
  return others.some((other) => (
    near(line.x1, other.x1)
    && near(line.y1, other.y1)
    && near(line.x2, other.x2)
    && near(line.y2, other.y2)
    && near(line.width || 0, other.width || 0)
    && (line.color || '#000000') === (other.color || '#000000')
  ));
}

function matchRect(rect, others) {
  return others.some((other) => (
    near(rect.x, other.x)
    && near(rect.y, other.y)
    && near(rect.width || 0, other.width || 0)
    && near(rect.height || 0, other.height || 0)
  ));
}

function boxContainsPoint(box, x, y, pad = 2) {
  if (!box) return false;
  return x >= box.x - pad
    && x <= box.x + box.width + pad
    && y >= box.y - pad
    && y <= box.y + box.height + pad;
}

function boxContainsSegment(box, x1, y1, x2, y2, pad = 2) {
  return boxContainsPoint(box, x1, y1, pad) && boxContainsPoint(box, x2, y2, pad);
}

function boxContainsRect(box, rect, pad = 2) {
  if (!box || !rect) return false;
  return rect.x >= box.x - pad
    && rect.y >= box.y - pad
    && rect.x + (rect.width || 0) <= box.x + box.width + pad
    && rect.y + (rect.height || 0) <= box.y + box.height + pad;
}

function brandingBoxes(spec) {
  const page = spec.pages[0];
  const boxes = [];
  if (spec.slots?.logo) boxes.push({ kind: 'logo', ...spec.slots.logo });
  if (spec.slots?.company) boxes.push({ kind: 'company-name', ...spec.slots.company });
  for (const image of page.images || []) {
    if (image.proposedClass === 'logo' || image.proposedClass === 'letterhead') {
      boxes.push({
        kind: image.proposedClass,
        x: image.x,
        y: image.y,
        width: image.width,
        height: image.height,
      });
    }
  }
  const branding = (page.spans || []).filter((span) => span.role === 'branding' || span.brandingKind);
  if (branding.length) {
    const xs = branding.map((span) => span.x);
    const ys = branding.map((span) => span.y);
    const rights = branding.map((span) => span.x + (span.width || 0));
    const tops = branding.map((span) => span.y + (span.size || 8));
    boxes.push({
      kind: 'omitted-branding',
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...rights) - Math.min(...xs),
      height: Math.max(...tops) - Math.min(...ys),
    });
  }
  // Org header band used by fillOrganizationHeader (right-side company block).
  boxes.push({ kind: 'org-header-band', x: 440, y: 775, width: 140, height: 60 });
  return boxes;
}

function classifyElement(element, boxes) {
  const hits = boxes.filter((box) => {
    if (element.type === 'line') return boxContainsSegment(box, element.x1, element.y1, element.x2, element.y2, 4);
    if (element.type === 'rect') return boxContainsRect(box, element, 4);
    return false;
  }).map((box) => box.kind);
  return hits.length ? hits : ['outside-allowed-boxes'];
}

async function geometryAudit() {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const demoPdf = path.join(outDir, 'demo-live.pdf');
  if (!fs.existsSync(demoPdf)) throw new Error('missing demo-live.pdf; run format1-polish first');
  const referencePath = path.join(root, spec.source);
  const reference = await inspectPdfFile(referencePath);
  const rendered = await inspectPdfFile(demoPdf);
  const specPage = displayGeometry(spec.pages[0], spec.pages[0].pageBox);
  const renderedPage = displayGeometry({
    ...rendered,
    lines: rendered.pages?.[0]?.lines || rendered.lines,
    rects: rendered.pages?.[0]?.rects || rendered.rects,
    paths: rendered.pages?.[0]?.paths || rendered.paths,
    spans: rendered.pages?.[0]?.spans || rendered.spans,
    width: rendered.width,
    height: rendered.height,
  }, rendered.pageBox || spec.pages[0].pageBox);

  // Prefer pageReads when present.
  const renderedGeom = {
    lines: rendered.pageReads?.[0]?.lines || rendered.pages?.[0]?.lines || rendered.lines || [],
    rects: rendered.pageReads?.[0]?.rects || rendered.pages?.[0]?.rects || rendered.rects || [],
    paths: rendered.pageReads?.[0]?.paths || rendered.pages?.[0]?.paths || rendered.paths || [],
  };
  const refGeom = {
    lines: reference.pageReads?.[0]?.lines || reference.pages?.[0]?.lines || reference.lines || [],
    rects: reference.pageReads?.[0]?.rects || reference.pages?.[0]?.rects || reference.rects || [],
    paths: reference.pageReads?.[0]?.paths || reference.pages?.[0]?.paths || reference.paths || [],
  };
  // Spec geometry is what the golden checker uses.
  const missingLines = (specPage.lines || []).filter((line) => !matchLine(line, renderedGeom.lines));
  const missingRects = (specPage.rects || []).filter((rect) => !matchRect(rect, renderedGeom.rects));
  const boxes = brandingBoxes(spec);
  const failures = [
    ...missingLines.map((line) => ({
      type: 'line',
      x1: line.x1,
      y1: line.y1,
      x2: line.x2,
      y2: line.y2,
      width: line.width || 0,
      size: { length: Math.hypot(line.x2 - line.x1, line.y2 - line.y1) },
      boxes: classifyElement({ type: 'line', ...line }, boxes),
    })),
    ...missingRects.map((rect) => ({
      type: 'rect',
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      size: { width: rect.width, height: rect.height },
      boxes: classifyElement({ type: 'rect', ...rect }, boxes),
    })),
  ];
  const outside = failures.filter((item) => item.boxes.includes('outside-allowed-boxes'));
  const report = {
    missingLineCount: missingLines.length,
    missingRectCount: missingRects.length,
    boxes,
    failures,
    outsideAllowed: outside,
    referenceLineCount: (specPage.lines || []).length,
    renderedLineCount: renderedGeom.lines.length,
    referenceRectCount: (specPage.rects || []).length,
    renderedRectCount: renderedGeom.rects.length,
  };
  fs.writeFileSync(path.join(outDir, 'geometry-failures.json'), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

function isSampleishStatic(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  if (/^-?[\d,]+(\.\d+)?$/.test(raw)) return true;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(raw)) return true;
  if (/^\d{1,2}-[A-Za-z]{3}-\d{2}$/i.test(raw)) return true;
  if (/^(INR|USD|AED|EUR|GBP|SGD|VND|PKR)$/i.test(raw)) return true;
  if (/^[\d,]+\.\d{2}$/.test(raw)) return true;
  return false;
}

async function staticSampleAudit() {
  const disk = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
  const row = live.invoices.find((item) => item.invoice?.invoice_number === 'INV/26/00102');
  const record = {
    invoice: row.invoice,
    job: row.job || {},
    party: row.party || {},
    organization: live.organization || {},
    bank: live.bank,
    session: { createdBy: 'ops@example.com', printedAt: '11/20/2026' },
  };
  const filled = fillInvoiceSpans(JSON.parse(JSON.stringify(disk)), record);
  const staticSamples = (disk.pages[0].spans || [])
    .filter((span) => span.role === 'static' && isSampleishStatic(span.text))
    .map((span) => {
      const painted = filled.values[span.id];
      const blanked = painted === '';
      const rebound = painted != null && painted !== '' && painted !== span.text;
      const stillSample = painted == null && span.role === 'static';
      return {
        id: span.id,
        sample: span.text,
        x: span.x,
        y: span.y,
        painted: painted == null ? '(spec static, not overwritten)' : painted,
        status: blanked ? 'blanked' : rebound ? 'rebound' : stillSample ? 'still-paints-sample' : 'other',
      };
    });

  // Qty proof with quantities 2, 3, 12.5
  const qtyRecord = {
    organization: live.organization || { name: 'Demo' },
    bank: live.bank || {},
    session: { createdBy: 'ops@example.com', printedAt: '11/20/2026' },
    party: row.party || { name: 'Customer', address: 'Addr', vat_number: 'GST' },
    invoice: {
      invoice_number: 'QTY-PROOF',
      invoice_date: '2026-11-20',
      currency_code: 'INR',
      exchange_rate: '1',
      subtotal: 100,
      tax_total: 0,
      total_amount: 100,
      status: 'CREATED',
      lines: [
        { description: 'LINE A', charge_code_name: 'LINE A', quantity: 2, unit_price: 10, currency_code: 'INR', exchange_rate: 1, tax_amount: 0, line_total: 20, is_taxable: false },
        { description: 'LINE B', charge_code_name: 'LINE B', quantity: 3, unit_price: 10, currency_code: 'INR', exchange_rate: 1, tax_amount: 0, line_total: 30, is_taxable: false },
        { description: 'LINE C', charge_code_name: 'LINE C', quantity: 12.5, unit_price: 4, currency_code: 'INR', exchange_rate: 1, tax_amount: 0, line_total: 50, is_taxable: false },
      ],
    },
    job: {},
  };
  const qtySpec = JSON.parse(JSON.stringify(disk));
  const qtyFilled = fillInvoiceSpans(qtySpec, qtyRecord);
  const qtyPdf = path.join(outDir, 'qty-proof.pdf');
  await renderSpec(code, {
    spec: qtySpec,
    values: qtyFilled.values,
    organization: {
      name: qtyRecord.organization.display_name || qtyRecord.organization.name || '',
      address: qtyRecord.organization.address || '',
      phone: qtyRecord.organization.phone || '',
      email: qtyRecord.organization.email || '',
      website: qtyRecord.organization.website || '',
    },
    quietArtifacts: true,
    outputPath: qtyPdf,
  });
  const text = execFileSync('pdftotext', ['-layout', qtyPdf, '-'], { encoding: 'utf8' });
  const qtyValues = Object.entries(qtyFilled.values)
    .filter(([key]) => /line-\d+-/.test(key))
    .map(([key, value]) => `${key}=${value}`);
  const expected = [
    { qty: '2', line: 'LINE A' },
    { qty: '3', line: 'LINE B' },
    { qty: '12.5', line: 'LINE C' },
  ];
  const printedQty = expected.map(({ qty, line }) => {
    const lineBlock = text.includes(line) ? text.split(line)[1]?.split('LINE')[0] || '' : '';
    return {
      qty,
      line,
      inValues: qtyValues.some((row) => row === `line-${expected.findIndex((item) => item.qty === qty)}-qty=${qty}` || row.endsWith(`-qty=${qty}`)),
      inPdfNearLine: lineBlock.includes(qty) || new RegExp(`${line}[\\s\\S]{0,80}${qty.replace('.', '\\.')}`).test(text),
      inPdf: text.includes(qty),
    };
  });
  const report = {
    staticSamples,
    stillPaintsSample: staticSamples.filter((row) => row.status === 'still-paints-sample'),
    qtyProof: {
      values: qtyValues,
      printedQty,
      pdfSnippet: text.split(/\n/).filter((line) => /LINE|^\s*\d/.test(line)).slice(0, 40),
    },
  };
  fs.writeFileSync(path.join(outDir, 'static-sample-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

const geometry = await geometryAudit();
const statics = await staticSampleAudit();
console.log(JSON.stringify({
  geometryOutside: geometry.outsideAllowed.length,
  geometryMissing: geometry.failures.length,
  stillPaintsSample: statics.stillPaintsSample.map((row) => `${row.id}:${row.sample}`),
  qtyProof: statics.qtyProof.printedQty,
}, null, 2));
