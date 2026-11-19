/**
 * Turn the charge band into a repeating row. The header is copied onto
 * continuation pages. Totals sit under the last line. Golden specs are copied
 * first; the file on disk is not rewritten.
 */
function classicMoney(value) {
  const number = value == null || value === '' ? 0 : Number(value);
  if (!Number.isFinite(number)) return '0.00';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function lineAmount(line) {
  if (line?.line_total != null && Number.isFinite(Number(line.line_total))) return Number(line.line_total);
  const qty = Number(line?.quantity ?? 0);
  const price = Number(line?.unit_price ?? 0);
  const tax = Number(line?.tax_amount ?? 0);
  return qty * price + tax;
}

function normalizeLabel(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function nearestLabel(span, spans) {
  const left = spans
    .filter((other) => other.role === 'static' && other !== span && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => (span.x - (b.x + b.width)) - (span.x - (a.x + a.width)))[0];
  if (left) return left;
  return spans
    .filter((other) => other.role === 'static' && other !== span && other.y > span.y + 2 && other.x < span.x + span.width && other.x + other.width > span.x)
    .sort((a, b) => (a.y - span.y) - (b.y - span.y))[0] || null;
}

function numeric(text) {
  return /^-?[\d,]+(\.\d+)?$/.test(String(text || '').trim());
}

function chargeRows(spans) {
  const rows = [];
  for (const span of spans) {
    if (span.role !== 'dynamic' || !numeric(span.text)) continue;
    const row = rows.find((item) => Math.abs(item.y - span.y) <= 3);
    if (row) row.spans.push(span);
    else rows.push({ y: span.y, spans: [span] });
  }
  return rows.filter((row) => {
    if (row.spans.length < 3) return false;
    const keys = row.spans.map((span) => normalizeLabel(nearestLabel(span, spans)?.text || '')).join(' ');
    return !/\b(sgst|cgst|igst|grand total|subtotal|sub total)\b/.test(keys);
  }).sort((a, b) => b.y - a.y);
}

function columnValue(cell, spans, line, currency) {
  const label = normalizeLabel(nearestLabel(cell, spans)?.text || '');
  const demo = String(cell.text || '');
  if (/\b(sgst|cgst|igst)\b/.test(label)) return '';
  if (/\b(qty|quantity|unit)\b/.test(label) || /\.\d{3,}/.test(demo)) {
    return line.quantity == null ? '' : String(line.quantity);
  }
  if (/\b(rate|price)\b/.test(label)) return classicMoney(line.unit_price ?? 0);
  if (/\b(currency|curr)\b/.test(label)) return currency;
  if (/\b(tax)\b/.test(label) && !/\b(sgst|cgst|igst)\b/.test(label)) {
    return line.tax_amount == null ? '' : classicMoney(line.tax_amount);
  }
  return null;
}

export function layoutRepeatingCharges(spec, record) {
  const invoice = record?.invoice || {};
  const lines = invoice.lines || [];
  const values = {};
  const blanks = [];
  const pages = spec.pages?.length ? spec.pages : null;
  if (!pages) return { values, blanks };
  const page = pages[0];
  const spans = page.spans || [];
  const rows = chargeRows(spans);
  if (!rows.length) return { values, blanks };

  const template = rows.slice().sort((a, b) => b.spans.length - a.spans.length)[0];
  const cells = template.spans.slice().sort((a, b) => a.x - b.x);
  const amountCell = cells[cells.length - 1];
  const caption = nearestLabel(amountCell, spans);
  const pitch = rows.length > 1 ? Math.max(12, Math.abs(rows[0].y - rows[1].y)) : 16;
  const top = rows[0].y;
  const bandBottom = rows[rows.length - 1].y;
  const currency = String(invoice.currency_code || '').trim();
  const chargeIds = new Set(rows.flatMap((row) => row.spans.map((span) => span.id)));
  const captionIds = new Set();
  for (const row of rows) {
    for (const span of row.spans) {
      const side = nearestLabel(span, spans);
      if (side?.role === 'static') captionIds.add(side.id);
    }
  }
  for (const id of chargeIds) values[id] = '';
  for (const id of captionIds) values[id] = '';

  const footer = spans.filter((span) => span.y < bandBottom - 6 && !chargeIds.has(span.id) && !captionIds.has(span.id));
  const header = spans.filter((span) => span.y > top + 4 && !chargeIds.has(span.id));
  const margin = 56;
  const totalsReserve = 88;

  function rowSpans(line, index, y) {
    const made = [];
    const description = String(line.description || line.charge_code || '').trim();
    if (description) {
      const id = `line-${index}-desc`;
      const descX = 28;
      made.push({
        id,
        role: 'dynamic',
        x: descX,
        y,
        width: Math.max(80, cells[0].x - descX - 6),
        height: 12,
        size: amountCell.size || 7,
        font: amountCell.font || caption?.font,
        text: '',
      });
      values[id] = description;
    }
    const qtyCell = cells.find((cell) => /\.\d{3,}/.test(String(cell.text)));
    const rateCell = cells.find((cell) => cell !== amountCell && cell !== qtyCell && cell.x > (qtyCell?.x || 0) && cell.x < amountCell.x);
    const currencyCell = spans.find((span) => Math.abs(span.y - template.y) <= 4 && /^(INR|USD|AED|EUR|GBP|SGD|VND)$/.test(String(span.text || '').trim()));
    if (currencyCell && currency) {
      const id = `line-${index}-ccy`;
      made.push({ ...currencyCell, id, role: 'dynamic', y, text: '' });
      values[id] = currency;
    }
    for (const cell of cells) {
      const id = `line-${index}-${cell.id}`;
      made.push({ ...cell, id, role: 'dynamic', y, text: '' });
      let bound = '';
      if (cell === amountCell) bound = classicMoney(lineAmount(line));
      else if (cell === qtyCell) bound = line.quantity == null ? '' : String(line.quantity);
      else if (cell === rateCell) bound = classicMoney(line.unit_price ?? 0);
      else {
        const labeled = columnValue(cell, spans, line, currency);
        bound = labeled == null ? '' : labeled;
      }
      values[id] = bound;
      if (!bound && cell !== amountCell) {
        blanks.push({ span: id, label: nearestLabel(cell, spans)?.text || 'charge column', binding: 'invoice.lines', why: 'no source' });
      }
    }
    return made;
  }

  function freshPage(includeFooter) {
    const copy = {
      ...page,
      spans: header.map((span) => ({ ...span })),
      lines: (page.lines || []).filter((line) => line.y1 > top && line.y2 > top),
      rects: (page.rects || []).filter((rect) => rect.y > top),
      images: (page.images || []).filter((image) => image.proposedClass === 'logo' || image.y > top),
      paths: [],
    };
    if (includeFooter) copy.footer = footer.map((span) => ({ ...span }));
    return copy;
  }

  const built = [];
  let current = freshPage(false);
  current.spans = current.spans.filter((span) => !chargeIds.has(span.id) && !captionIds.has(span.id));
  let y = top;
  lines.forEach((line, index) => {
    const last = index === lines.length - 1;
    const limit = margin + (last ? totalsReserve : 0);
    if (y < limit) {
      built.push(current);
      current = freshPage(false);
      y = top;
    }
    current.spans.push(...rowSpans(line, index, y));
    y -= pitch;
  });
  if (!lines.length) {
    blanks.push({ span: 'line-amount', label: 'line amount', binding: 'invoice.lines', why: 'empty in the record' });
  }
  const footerTop = Math.max(...footer.map((span) => span.y), 0);
  const shift = footer.length ? (y - footerTop) : 0;
  for (const span of footer) {
    current.spans.push({ ...span, y: span.y + shift });
    if (chargeIds.has(span.id)) values[span.id] = '';
  }
  for (const line of page.lines || []) {
    if (line.y1 < bandBottom && line.y2 < bandBottom) {
      current.lines.push({ ...line, y1: line.y1 + shift, y2: line.y2 + shift });
    }
  }
  built.push(current);
  spec.pages = built.map((item) => {
    const { footer: unused, ...rest } = item;
    void unused;
    return rest;
  });
  return { values, blanks };
}
