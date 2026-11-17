/**
 * Extract a draft report spec from one pinned PDF.
 * Run: node tools/reports/extract.mjs <CODE>
 * Pilots: node tools/reports/extract.mjs --pilots
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readOperators } from './read-operators.mjs';
import { mapFont } from './font-map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PILOTS = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY',
];
const HBL_VARIANT = 'reports/references/files/hbl-draft-report-format-6.pdf';

const LABEL_BINDINGS = [
  [/invoice\s*no/i, 'invoice.number'],
  [/invoice\s*date|^date$/i, 'invoice.date'],
  [/bill\s*to/i, 'party.billTo'],
  [/shipper/i, 'party.shipper'],
  [/consignee/i, 'party.consignee'],
  [/notify/i, 'party.notify'],
  [/job\s*no/i, 'job.number'],
  [/opening balance/i, 'ledger.openingBalance'],
  [/^debit$/i, 'ledger.debit'],
  [/^credit$/i, 'ledger.credit'],
  [/closing balance/i, 'ledger.closingBalance'],
  [/\bmawb\b/i, 'shipment.mawb'],
  [/\bhawb\b/i, 'shipment.hawb'],
  [/\bhbl\b|house\s*b\/l|bill of lading no/i, 'shipment.hbl'],
  [/port of loading|\bpol\b/i, 'shipment.pol'],
  [/port of discharge|\bpod\b/i, 'shipment.pod'],
  [/place of receipt/i, 'shipment.placeOfReceipt'],
  [/place of delivery/i, 'shipment.placeOfDelivery'],
  [/vessel/i, 'shipment.vessel'],
  [/voyage/i, 'shipment.voyage'],
  [/\betd\b/i, 'shipment.etd'],
  [/\beta\b/i, 'shipment.eta'],
  [/currency/i, 'invoice.currency'],
  [/gross\s*weight/i, 'cargo.grossWeight'],
  [/measurement|\bcbm\b/i, 'cargo.measurement'],
  [/pieces|no of pcs|package/i, 'cargo.pieces'],
  [/container/i, 'cargo.containerNo'],
  [/seal/i, 'cargo.sealNo'],
  [/freight/i, 'shipment.freightTerms'],
  [/tax|gst|igst|cgst|sgst/i, 'invoice.tax'],
  [/grand\s*total|^total$/i, 'invoice.total'],
  [/amount/i, 'invoice.amount'],
  [/description|goods/i, 'cargo.description'],
  [/marks/i, 'cargo.marks'],
];

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}

function hex(color) {
  const raw = [...(color || [0, 0, 0])];
  while (raw.length < 3) raw.push(raw[0] || 0);
  const channels = raw.slice(0, 3).map((channel) =>
    Math.max(0, Math.min(255, Math.round(Number(channel) > 1 ? Number(channel) : Number(channel) * 255))),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function identityCtm() {
  return [1, 0, 0, 1, 0, 0];
}

function multiplyCtm(ctm, matrix) {
  const [a0, b0, c0, d0, e0, f0] = ctm;
  const [a, b, c, d, e, f] = matrix;
  return [
    a0 * a + c0 * b,
    b0 * a + d0 * b,
    a0 * c + c0 * d,
    b0 * c + d0 * d,
    a0 * e + c0 * f + e0,
    b0 * e + d0 * f + f0,
  ];
}

function mapPoint(ctm, x, y) {
  return [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]];
}

function matrixOf(args) {
  const raw = args && args.length === 6 ? args : args && args[0] && args[0].length === 6 ? args[0] : null;
  if (!raw) return null;
  return [0, 1, 2, 3, 4, 5].map((index) => Number(raw[index]) || 0);
}

function pushBox(rects, lines, minX, minY, maxX, maxY, style) {
  const width = maxX - minX;
  const height = maxY - minY;
  if (width > 2 && height > 2) {
    rects.push({
      x: round1(minX),
      y: round1(minY),
      width: round1(width),
      height: round1(height),
      strokeWidth: style.strokeWidth,
      stroke: style.stroke,
      fill: style.fill,
    });
  } else if (width > 4 && height >= 0.15 && height <= 2.5) {
    lines.push({
      x1: round1(minX),
      y1: round1(minY + height / 2),
      x2: round1(maxX),
      y2: round1(minY + height / 2),
      width: round1(height),
      color: style.stroke || style.fill || '#000000',
    });
  } else if (height > 4 && width >= 0.15 && width <= 2.5) {
    lines.push({
      x1: round1(minX + width / 2),
      y1: round1(minY),
      x2: round1(minX + width / 2),
      y2: round1(maxY),
      width: round1(width),
      color: style.stroke || style.fill || '#000000',
    });
  }
}

function shapesFromPath(pathOps, nums, ctm, style) {
  const rects = [];
  const lines = [];
  let j = 0;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let points = [];
  function commit(closed) {
    if (points.length < 2) {
      points = [];
      return;
    }
    const mapped = points.map((point) => mapPoint(ctm, point[0], point[1]));
    if (closed) mapped.push(mapped[0]);
    const xs = mapped.map((point) => point[0]);
    const ys = mapped.map((point) => point[1]);
    const axis = mapped.every((point, index) => {
      if (index === 0) return true;
      const prev = mapped[index - 1];
      return Math.abs(point[0] - prev[0]) < 0.8 || Math.abs(point[1] - prev[1]) < 0.8;
    });
    if (closed && axis && mapped.length >= 4 && mapped.length <= 8) {
      pushBox(rects, lines, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), style);
    } else if (axis) {
      for (let index = 1; index < mapped.length; index += 1) {
        const prev = mapped[index - 1];
        const point = mapped[index];
        if (Math.hypot(point[0] - prev[0], point[1] - prev[1]) < 2) continue;
        lines.push({
          x1: round1(prev[0]),
          y1: round1(prev[1]),
          x2: round1(point[0]),
          y2: round1(point[1]),
          width: style.strokeWidth,
          color: style.stroke || '#000000',
        });
      }
    }
    points = [];
  }
  for (const op of pathOps) {
    if (op === OPS.rectangle || op === 19) {
      commit(false);
      const rx = nums[j++];
      const ry = nums[j++];
      const width = nums[j++];
      const height = nums[j++];
      const corners = [
        mapPoint(ctm, rx, ry),
        mapPoint(ctm, rx + width, ry),
        mapPoint(ctm, rx, ry + height),
        mapPoint(ctm, rx + width, ry + height),
      ];
      pushBox(
        rects,
        lines,
        Math.min(...corners.map((point) => point[0])),
        Math.min(...corners.map((point) => point[1])),
        Math.max(...corners.map((point) => point[0])),
        Math.max(...corners.map((point) => point[1])),
        style,
      );
    } else if (op === OPS.moveTo || op === 13) {
      commit(false);
      x = nums[j++];
      y = nums[j++];
      startX = x;
      startY = y;
      points = [[x, y]];
    } else if (op === OPS.lineTo || op === 14) {
      x = nums[j++];
      y = nums[j++];
      points.push([x, y]);
    } else if (op === 15) {
      j += 6;
      x = nums[j - 2];
      y = nums[j - 1];
    } else if (op === 16 || op === 17) {
      j += 4;
      x = nums[j - 2];
      y = nums[j - 1];
    } else if (op === OPS.closePath || op === 18) {
      commit(true);
      x = startX;
      y = startY;
    }
  }
  commit(false);
  return { rects, lines };
}

function colorOf(args) {
  const raw = Array.isArray(args)
    ? args
    : args && typeof args === 'object'
      ? [args[0], args[1], args[2]].filter((value) => value != null)
      : [args];
  return raw.slice(0, 3).map((value) => Number(value) || 0);
}

function textFillColors(ops) {
  const colors = [];
  let fill = [0, 0, 0];
  const fns = ops.fnArray || [];
  const args = ops.argsArray || [];
  const show = new Set([OPS.showText, OPS.showSpacedText, OPS.nextLineShowText, OPS.nextLineSetSpacingShowText]);
  for (let i = 0; i < fns.length; i += 1) {
    const fn = fns[i];
    if (fn === OPS.setFillRGBColor) fill = colorOf(args[i]);
    else if (fn === OPS.setFillGray || fn === OPS.setFillColor) {
      const gray = Number(Array.isArray(args[i]) ? args[i][0] : args[i]) || 0;
      fill = [gray, gray, gray];
    } else if (show.has(fn)) colors.push(hex(fill));
  }
  return colors;
}

function paintKind(fns, index) {
  const fillOps = new Set([
    OPS.fill,
    OPS.eoFill,
    OPS.fillStroke,
    OPS.eoFillStroke,
    OPS.closeFillStroke,
    OPS.closeEOFillStroke,
  ]);
  for (let k = index + 1; k < Math.min(fns.length, index + 6); k += 1) {
    const next = fns[k];
    if (fillOps.has(next)) return next === OPS.fill || next === OPS.eoFill ? 'fill' : 'both';
    if (next === OPS.stroke || next === OPS.closeStroke) return 'stroke';
    if (next === OPS.endPath || next === OPS.constructPath || next === OPS.rectangle) return 'stroke';
  }
  return 'stroke';
}

function collectVectors(ops) {
  const rects = [];
  const lines = [];
  const images = [];
  const stack = [identityCtm()];
  let strokeWidth = 0.6;
  let stroke = [0, 0, 0];
  let fill = [0, 0, 0];
  const fns = ops.fnArray || [];
  const args = ops.argsArray || [];
  for (let i = 0; i < fns.length; i += 1) {
    const fn = fns[i];
    if (fn === OPS.save) stack.push(stack[stack.length - 1].slice());
    else if (fn === OPS.restore) stack.pop();
    else if (fn === OPS.transform) {
      const matrix = matrixOf(args[i]);
      if (matrix) stack[stack.length - 1] = multiplyCtm(stack[stack.length - 1], matrix);
    } else if (fn === OPS.setLineWidth) strokeWidth = Number(Array.isArray(args[i]) ? args[i][0] : args[i]) || strokeWidth;
    else if (fn === OPS.setStrokeRGBColor) stroke = colorOf(args[i]);
    else if (fn === OPS.setFillRGBColor) fill = colorOf(args[i]);
    else if (fn === OPS.setFillGray) {
      const gray = Number(Array.isArray(args[i]) ? args[i][0] : args[i]) || 0;
      fill = [gray, gray, gray];
    } else if (fn === OPS.constructPath || fn === OPS.rectangle) {
      const raw = args[i];
      const pathOps = fn === OPS.rectangle ? [OPS.rectangle] : raw?.[0];
      const nums = fn === OPS.rectangle ? raw : raw?.[1];
      if (!pathOps || !nums) continue;
      const painted = paintKind(fns, i);
      const shaped = shapesFromPath(pathOps, nums, stack[stack.length - 1] || identityCtm(), {
        strokeWidth: round1(strokeWidth),
        stroke: hex(stroke),
        fill: painted === 'fill' || painted === 'both' ? hex(fill) : null,
      });
      rects.push(...shaped.rects);
      lines.push(...shaped.lines);
    } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
      const ctm = stack[stack.length - 1] || identityCtm();
      const corners = [mapPoint(ctm, 0, 0), mapPoint(ctm, 1, 0), mapPoint(ctm, 0, 1), mapPoint(ctm, 1, 1)];
      const xs = corners.map((point) => point[0]);
      const ys = corners.map((point) => point[1]);
      images.push({
        x: round1(Math.min(...xs)),
        y: round1(Math.min(...ys)),
        width: round1(Math.max(...xs) - Math.min(...xs)),
        height: round1(Math.max(...ys) - Math.min(...ys)),
        format: 'unknown',
        slot: '',
      });
    }
  }
  return { rects, lines, images };
}

function fontSize(transform) {
  return round1(Math.hypot(transform[2] || 0, transform[3] || 0) || Math.hypot(transform[0] || 0, transform[1] || 0));
}

function looksLikeValue(text) {
  const value = text.trim();
  if (!value || value.length < 2) return false;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(value)) return true;
  if (/^[0-9][0-9,.\s/-]*$/.test(value) && /\d/.test(value)) return true;
  if (/@/.test(value)) return true;
  if (/FRESA|DEMO|4G LOGISTICS|AL NASER|AL NABHA/i.test(value)) return true;
  if (value === value.toUpperCase() && value.length > 18 && /[A-Z]/.test(value)) return true;
  return false;
}

function isHeading(text) {
  return /^(TAX INVOICE|BILL OF LADING|ARRIVAL NOTICE|CARGO ARRIVAL NOTICE|INVOICE)$/i.test(text.trim());
}

async function readText(page) {
  const content = await page.getTextContent();
  const spans = [];
  let empty = 0;
  let zeroWidth = 0;
  const fontNames = new Map();
  for (const item of content.items) {
    if (!('str' in item)) continue;
    const text = String(item.str || '').replace(/\s+/g, ' ').trim();
    if (!text) {
      empty += 1;
      continue;
    }
    if (item.width === 0) zeroWidth += 1;
    const style = content.styles?.[item.fontName] || {};
    let internalName = '';
    try {
      if (page.commonObjs?.has?.(item.fontName)) {
        const font = page.commonObjs.get(item.fontName);
        internalName = font?.name || font?.loadedName || font?.fallbackName || '';
      }
    } catch {
      internalName = '';
    }
    const font = internalName || style.fontFamily || item.fontName || 'unknown';
    fontNames.set(font, (fontNames.get(font) || 0) + 1);
    const transform = item.transform || [1, 0, 0, 1, 0, 0];
    spans.push({
      text,
      font,
      pdfFontId: item.fontName,
      fallbackFamily: style.fontFamily || '',
      size: fontSize(transform),
      color: '#000000',
      x: round1(transform[4] || 0),
      y: round1(transform[5] || 0),
      width: round1(item.width || 0),
      anchor: 'left',
      alignment: 'left',
    });
  }
  return { spans, empty, zeroWidth, fontNames };
}

async function openPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const pages = [];
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const view = page.getViewport({ scale: 1 });
    const ops = await page.getOperatorList();
    const read = readOperators(ops, page, { width: view.width, height: view.height });
    pages.push({
      width: round1(view.width),
      height: round1(view.height),
      ...read,
    });
  }
  return { doc, pages };
}

async function variantStrings(filePath) {
  if (!filePath || !fs.existsSync(path.join(root, filePath))) return [];
  const { pages } = await openPdf(path.join(root, filePath));
  return pages[0].spans.map((span) => ({ text: span.text, x: span.x, y: span.y }));
}

function guessBinding(span, spans) {
  const left = spans
    .filter((other) => other !== span && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => b.x - a.x)[0];
  for (const [pattern, binding] of LABEL_BINDINGS) {
    if (left && pattern.test(left.text)) return binding;
  }
  if (span.y > 700 && /FRESA|company/i.test(span.text)) return 'company.name';
  return '';
}

function markSpans(spans, variants) {
  const dynamic = [];
  for (const span of spans) {
    const nearby = variants.find((item) => Math.abs(item.x - span.x) <= 3 && Math.abs(item.y - span.y) <= 3);
    let role = 'static';
    let reason = 'same text in the reference';
    if (isHeading(span.text)) {
      role = 'static';
      reason = 'document title';
    } else if (nearby && nearby.text !== span.text) {
      role = 'dynamic';
      reason = 'text differs from the same-layout variant at this position';
    } else if (!nearby && variants.length && !variants.some((item) => item.text === span.text)) {
      role = looksLikeValue(span.text) ? 'dynamic' : 'static';
      reason = role === 'dynamic'
        ? 'value is absent from the same-layout variant'
        : 'label is not a demo value';
    } else if (looksLikeValue(span.text)) {
      role = 'dynamic';
      reason = 'matches a demo value (number, date, party, or Fresa sample text)';
    }
    span.role = role;
    const binding = role === 'dynamic' ? guessBinding(span, spans) : '';
    span.binding = binding;
    if (role === 'dynamic') dynamic.push({ ...span, reason });
  }
  return dynamic;
}

function cluster(values, tolerance) {
  const sorted = [...values].sort((a, b) => a - b);
  const groups = [];
  for (const value of sorted) {
    const last = groups.at(-1);
    if (!last || Math.abs(value - last.center) > tolerance) groups.push({ values: [value], center: value });
    else {
      last.values.push(value);
      last.center = last.values.reduce((sum, item) => sum + item, 0) / last.values.length;
    }
  }
  return groups;
}

function proposeImageClass(image, pageHeight) {
  const aspect = image.height > 0 ? image.width / image.height : 0;
  if (aspect >= 3.5 && image.height <= 40) return 'barcode';
  if (aspect >= 0.8 && aspect <= 1.25 && image.width >= 28 && image.width <= 140) return 'qr';
  if (image.y >= pageHeight * 0.72 && image.height >= 24) return 'logo';
  if (image.y <= pageHeight * 0.16) return 'decorative Fresa branding';
  return 'other';
}

function layoutOf(pageHeight, spans) {
  const headerFloor = pageHeight * 0.82;
  const footerCeiling = pageHeight * 0.1;
  const body = spans.filter((span) => span.y < headerFloor && span.y > footerCeiling);
  const yGroups = cluster(body.map((span) => span.y), 2);
  const rows = yGroups
    .map((group) => body.filter((span) => Math.abs(span.y - group.center) <= 2))
    .filter((row) => row.length >= 3);
  function repeating(groups, edge) {
    return groups.filter((column) => {
      const hits = rows.filter((row) => row.some((span) => Math.abs(edge(span) - column.center) <= 4)).length;
      return hits >= Math.max(6, Math.ceil(rows.length * 0.25));
    }).map((column) => ({ ...column, edge }));
  }
  const columns = [
    ...repeating(cluster(rows.flatMap((row) => row.map((span) => span.x)), 4), (span) => span.x),
    ...repeating(cluster(rows.flatMap((row) => row.map((span) => span.x + (span.width || 0))), 4), (span) => span.x + (span.width || 0)),
  ];
  const aligned = rows.filter((row) => row.filter((span) => columns.some((column) => Math.abs(column.edge(span) - column.center) <= 4)).length >= 3);
  const isDynamic = (span) => span.role === 'dynamic' || (!span.role && looksLikeValue(span.text));
  const dynamicCount = spans.filter(isDynamic).length || 1;
  const alignedDynamic = aligned.flat().filter(isDynamic).length;
  const dataRows = aligned.filter((row) => {
    if (row.some((span) => /\b(total|grand total)\b/i.test(span.text))) return false;
    const dynamicCells = row.filter((span) => span.role === 'dynamic' || (!span.role && looksLikeValue(span.text))).length;
    return dynamicCells >= Math.ceil(row.length / 2);
  });
  const isTable = dataRows.length >= 8 && columns.length >= 4 && alignedDynamic / dynamicCount >= 0.6;
  const summaryRows = spans.filter((span) => /\b(total|grand total)\b/i.test(span.text));
  const columnHeader = isTable && dataRows.length
    ? spans.filter((span) => span.role !== 'dynamic' && span.y > Math.max(...dataRows.flat().map((span) => span.y)) && span.y < headerFloor)
    : [];
  const detailYs = (dataRows.length ? dataRows.flat() : body).map((span) => span.y);
  const headerYs = spans.filter((span) => span.y >= headerFloor || columnHeader.includes(span)).map((span) => span.y);
  const summaryYs = summaryRows.map((span) => span.y);
  return {
    kind: isTable ? 'table' : 'form',
    columns,
    dataRows,
    bands: {
      header: { yMin: round1(headerYs.length ? Math.min(...headerYs) - 2 : headerFloor), yMax: round1(pageHeight) },
      title: { yMin: round1(pageHeight * 0.74), yMax: round1(pageHeight * 0.86) },
      detail: { yMin: round1(detailYs.length ? Math.min(...detailYs) : pageHeight * 0.25), yMax: round1(detailYs.length ? Math.max(...detailYs) : pageHeight * 0.75) },
      summary: { yMin: round1(summaryYs.length ? Math.min(...summaryYs) - 2 : pageHeight * 0.12), yMax: round1(summaryYs.length ? Math.max(...summaryYs) + 2 : pageHeight * 0.28) },
      footer: { yMin: 0, yMax: round1(footerCeiling) },
    },
  };
}

function tableTemplate(page) {
  const layout = layoutOf(page.height, page.spans);
  if (layout.kind !== 'table') return null;
  const columns = layout.columns.map((column, index) => {
    const bodyTop = Math.max(...layout.dataRows.flat().map((span) => span.y), 0);
    const header = page.spans
      .filter((span) => span.role !== 'dynamic' && !looksLikeValue(span.text) && Math.abs(column.edge(span) - column.center) <= 12 && span.y > bodyTop + 1)
      .sort((a, b) => a.y - b.y)[0];
    return {
      index,
      x: round1(column.center),
      header: header?.text || '',
      binding: LABEL_BINDINGS.find(([pattern]) => header && pattern.test(header.text))?.[1] || '',
    };
  });
  const assigned = new Set();
  const rows = layout.dataRows.map((row) => layout.columns.map((column) => {
    const cell = row.find((span) => !assigned.has(span.id) && Math.abs(column.edge(span) - column.center) <= 4);
    if (!cell) return null;
    assigned.add(cell.id);
    return {
      id: cell.id,
      text: cell.text,
      x: cell.x,
      y: cell.y,
      width: cell.width,
      size: cell.size,
      font: cell.font,
      color: cell.color,
      hScale: cell.hScale,
      charSpacing: cell.charSpacing || 0,
      wordSpacing: cell.wordSpacing || 0,
      glyphWidth: cell.glyphWidth,
      segments: cell.segments,
    };
  }));
  page.spans = page.spans.filter((span) => !assigned.has(span.id));
  const sample = rows.flat().find(Boolean);
  return {
    columns: columns.map((column) => ({
      ...column,
      cells: rows.reduce((sum, row) => sum + (row[column.index] ? 1 : 0), 0),
    })),
    rowTemplate: {
      height: sample?.size || 8,
      font: sample?.font || '',
      size: sample?.size || 8,
      cells: columns.length,
    },
    rows,
  };
}

function codeToFile(code) {
  const text = fs.readFileSync(path.join(root, 'reports/references/code-map.csv'), 'utf8');
  const line = text.split(/\r?\n/).find((row) => row.startsWith(`${code},`));
  if (!line) throw new Error(`No code-map row for ${code}`);
  const match = line.match(/reports\/references\/files\/[^,]+/);
  if (!match) throw new Error(`No reference file for ${code}`);
  return match[0];
}

function csv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function pageSpec(read, pageIndex) {
  const spans = read.spans.map((span, index) => ({ id: `p${pageIndex}s${index + 1}`, ...span }));
  return {
    width: read.width,
    height: read.height,
    lines: read.lines,
    rects: read.rects,
    spans,
    paths: read.paths || [],
    images: read.images.map((image) => {
      const proposedClass = proposeImageClass(image, read.height);
      const source = spans
        .filter((span) => Math.abs(span.y - (image.y + image.height / 2)) <= image.height + 24)
        .sort((a, b) => Math.abs(a.x - image.x) - Math.abs(b.x - image.x))[0];
      return {
        ...image,
        proposedClass,
        demoValue: proposedClass === 'barcode' || proposedClass === 'qr' ? (source?.text || '') : '',
      };
    }),
    shadings: read.shadings,
    bands: layoutOf(read.height, spans).bands,
    layoutKind: layoutOf(read.height, spans).kind,
    uncaptured: read.uncaptured,
    droppedOutside: read.droppedOutside,
    emptyTextItems: read.empty,
  };
}

export async function extractSpec(code) {
  const relative = codeToFile(code);
  const filePath = path.join(root, relative);
  const warnings = [];
  const originalWarn = console.warn;
  const originalLog = console.log;
  const capture = (...args) => {
    const line = args.map((arg) => String(arg)).join(' ');
    if (/^Warning:/.test(line) || /undefined function|standardFontDataUrl/i.test(line)) warnings.push(line);
  };
  console.warn = (...args) => capture(...args);
  console.log = (...args) => capture(...args);
  const opened = await openPdf(filePath);
  console.warn = originalWarn;
  console.log = originalLog;
  const pages = opened.pages.map((read, index) => pageSpec(read, index + 1));
  const first = pages[0];
  const textFile = filePath.replace(/[\\/]files[\\/]/, `${path.sep}text${path.sep}`).replace(/\.pdf$/i, '.txt');
  const pdftotext = fs.existsSync(textFile) ? fs.readFileSync(textFile, 'utf8') : '';
  const allSpans = pages.flatMap((page) => page.spans);
  const extractedWords = new Set(allSpans.flatMap((span) => span.text.split(/\s+/).filter(Boolean)));
  const missingWords = [...new Set(pdftotext.split(/\s+/).filter((word) => word && !extractedWords.has(word)))];
  const variants = code === 'HBL_DRAFT_REPORT_FORMAT_JASPER' ? await variantStrings(HBL_VARIANT) : [];
  const dynamic = pages.flatMap((page) => markSpans(page.spans, variants));
  for (const page of pages) {
    const layout = layoutOf(page.height, page.spans);
    page.bands = layout.bands;
    page.layoutKind = layout.kind;
    page.table = tableTemplate(page);
  }
  const layoutKind = pages.some((page) => page.layoutKind === 'table') ? 'table' : 'form';
  const logo = [...first.images].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  if (logo) logo.slot = 'logo';
  const company = first.spans
    .filter((span) => span.y > first.height * 0.7 && /PVT LTD|LLC|LIMITED|FRESA/i.test(span.text))
    .sort((a, b) => b.size - a.size)[0];
  if (company) company.slot = 'company';
  const keptIds = new Set(pages.flatMap((page) => page.spans.map((span) => span.id)));
  const keptDynamic = dynamic.filter((span) => keptIds.has(span.id));
  const fontNames = new Map();
  for (const span of allSpans) fontNames.set(span.font, (fontNames.get(span.font) || 0) + 1);
  const uniqueWarnings = [...new Set(warnings)];
  const spec = {
    code,
    source: relative.replace(/\\/g, '/'),
    page: {
      width: first.width,
      height: first.height,
      orientation: first.width > first.height ? 'landscape' : 'portrait',
    },
    fonts: [...fontNames.keys()].map((name) => {
      const mapped = mapFont(name);
      return { name, referenceCount: fontNames.get(name), mappedTo: mapped.bundle, family: mapped.family, weight: mapped.weight };
    }),
    lines: first.lines,
    rects: first.rects,
    spans: first.spans,
    images: first.images,
    shadings: first.shadings,
    pages,
    layoutKind,
    bands: first.bands,
    paths: first.paths || [],
    table: first.table || null,
    slots: {
      logo: logo ? { x: logo.x, y: logo.y, width: logo.width, height: logo.height } : null,
      company: company
        ? { x: company.x, y: company.y, width: Math.max(company.width, 8), height: company.size, binding: 'company.name' }
        : null,
    },
    bindings: keptDynamic.filter((span) => span.binding).map((span) => ({ id: span.id, path: span.binding })),
    formatRules: [
      { path: 'invoice.date', format: 'date' },
      { path: 'invoice.total', format: 'number' },
      { path: 'invoice.tax', format: 'number' },
      { path: 'invoice.amount', format: 'number' },
      { path: 'party.shipper', format: 'text' },
      { path: 'party.consignee', format: 'text' },
      { path: 'party.notify', format: 'text' },
      { path: 'cargo.description', format: 'text' },
    ],
    overflowRules: { default: 'clip', text: 'wrap', number: 'shrink', maxLines: 3 },
    extraction: {
      pageCount: pages.length,
      textItems: allSpans.length + pages.reduce((sum, page) => sum + page.emptyTextItems, 0),
      emptyTextItems: pages.reduce((sum, page) => sum + page.emptyTextItems, 0),
      characters: allSpans.reduce((sum, span) => sum + span.text.length, 0),
      droppedOutside: pages.reduce((sum, page) => sum + page.droppedOutside, 0),
      uncaptured: pages.map((page) => page.uncaptured),
      pdftotextWordsMissing: missingWords.length,
      pdftotextWordsMissingSample: missingWords.slice(0, 12),
      textFillColors: [...new Set(allSpans.map((span) => span.color))],
      warnings: uniqueWarnings,
    },
  };
  const outDir = path.join(root, 'reports/specs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${code}.json`), JSON.stringify(spec, null, 2));
  const dynamicLines = ['id,page,text,binding,reason'];
  for (const span of keptDynamic) {
    const pageNumber = Number(String(span.id).match(/^p(\d+)/)?.[1] || 1);
    dynamicLines.push([span.id, pageNumber, span.text, span.binding, span.reason].map(csv).join(','));
  }
  fs.writeFileSync(path.join(outDir, `${code}.dynamic.csv`), `${dynamicLines.join('\n')}\n`);
  return {
    code,
    pages: pages.length,
    spans: allSpans.length,
    layoutKind,
    dynamic: keptDynamic.length,
    tableRows: pages.reduce((sum, page) => sum + (page.table?.rows.length || 0), 0),
    paths: pages.reduce((sum, page) => sum + (page.paths?.length || 0), 0),
    lines: pages.reduce((sum, page) => sum + page.lines.length, 0),
    rects: pages.reduce((sum, page) => sum + page.rects.length, 0),
    images: pages.reduce((sum, page) => sum + page.images.length, 0),
    characters: spec.extraction.characters,
    droppedOutside: spec.extraction.droppedOutside,
    colors: spec.extraction.textFillColors,
    uncaptured: spec.extraction.uncaptured,
    pdftotextWordsMissing: missingWords.length,
    pdftotextWordsMissingSample: missingWords.slice(0, 12),
    warnings: uniqueWarnings,
  };
}

export async function inspectPdfFile(filePath) {
  const opened = await openPdf(filePath);
  const first = opened.pages[0];
  return {
    pages: opened.doc.numPages,
    width: first.width,
    height: first.height,
    vectors: { lines: first.lines, rects: first.rects },
    spans: first.spans,
    pageReads: opened.pages,
  };
}

const arg = process.argv[2];
if (arg && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const codes = arg === '--pilots' ? PILOTS : [arg];
  for (const code of codes) {
    const result = await extractSpec(code);
    console.log(JSON.stringify(result));
  }
}
