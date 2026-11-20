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
  if (/\bsgst\b/.test(label) && /%/.test(label)) {
    return line.sgst_rate == null || line.sgst_rate === '' ? '' : Number(line.sgst_rate).toFixed(2);
  }
  if (/\bcgst\b/.test(label) && /%/.test(label)) {
    return line.cgst_rate == null || line.cgst_rate === '' ? '' : Number(line.cgst_rate).toFixed(2);
  }
  if (/\b(igst|ugst)\b/.test(label) && /%/.test(label)) {
    return line.igst_rate == null || line.igst_rate === '' ? '' : Number(line.igst_rate).toFixed(2);
  }
  if (/\bsgst\b/.test(label)) {
    return line.sgst_amount == null || line.sgst_amount === '' ? '' : classicMoney(line.sgst_amount);
  }
  if (/\bcgst\b/.test(label)) {
    return line.cgst_amount == null || line.cgst_amount === '' ? '' : classicMoney(line.cgst_amount);
  }
  if (/\b(igst|ugst)\b/.test(label)) {
    return line.igst_amount == null || line.igst_amount === '' ? '' : classicMoney(line.igst_amount);
  }
  if (/\bsac\b/.test(label)) return line.sac_code == null && line.sac == null ? '' : String(line.sac_code || line.sac);
  if (/\b(qty|quantity)\b/.test(label)) {
    return line.quantity == null ? '' : String(line.quantity);
  }
  if (/\b(rate|price)\b/.test(label)) return classicMoney(line.unit_price ?? 0);
  if (/\b(currency|curr)\b/.test(label)) return line.currency_code || currency;
  if (/\b(tax)\b/.test(label) && !/\b(sgst|cgst|igst)\b/.test(label)) {
    return line.tax_amount == null ? '' : classicMoney(line.tax_amount);
  }
  return null;
}

/** How many charge lines fit on the first page before the totals reserve. */
export function chargePageCapacity(spec) {
  const page = spec?.pages?.[0];
  if (!page) return { hasBand: false, capacity: 0 };
  const rows = chargeRows(page.spans || []);
  if (!rows.length) return { hasBand: false, capacity: 0 };
  const pitch = rows.length > 1 ? Math.max(12, Math.abs(rows[0].y - rows[1].y)) : 16;
  const top = rows[0].y;
  const margin = 56;
  const totalsReserve = 88;
  let capacity = 0;
  for (let count = 1; count <= 80; count += 1) {
    let y = top;
    let fits = true;
    for (let index = 0; index < count; index += 1) {
      const limit = margin + (index === count - 1 ? totalsReserve : 0);
      if (y < limit) {
        fits = false;
        break;
      }
      y -= pitch;
    }
    if (!fits) break;
    capacity = count;
  }
  return { hasBand: true, capacity };
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
      const description = String(line.charge_code_name || line.description || line.charge_code || '').trim();
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
    const headerAnchors = spans.filter((span) => (
      span.role === 'static'
      && /\b(qty|quantity|currency|ex\.?\s*rate|sgst|cgst|igst|ugst|fcy|sac|amount)\b/i.test(String(span.text || ''))
      && span.y > top
      && span.y < top + 50
    ));
    const headerBandLo = headerAnchors.length
      ? Math.min(...headerAnchors.map((span) => span.y)) - 8
      : top + 4;
    const headerBandHi = headerAnchors.length
      ? Math.max(...headerAnchors.map((span) => span.y)) + 8
      : top + 45;
    function headersAbove(cell) {
      return spans.filter((other) => {
        if (other.role !== 'static' || other.y < headerBandLo || other.y > headerBandHi) return false;
        const left = other.x;
        const right = other.x + (other.width || 0);
        const cellLeft = cell.x - 28;
        const cellRight = cell.x + (cell.width || 0) + 28;
        return left < cellRight && right > cellLeft;
      }).sort((a, b) => {
        const center = cell.x + (cell.width || 0) / 2;
        const distance = (span) => Math.abs(span.x + (span.width || 0) / 2 - center);
        return distance(a) - distance(b) || b.y - a.y;
      });
    }
    function headerAbove(cell) {
      const candidates = headersAbove(cell).slice();
      candidates.sort((a, b) => {
        const center = cell.x + (cell.width || 0) / 2;
        const distance = (span) => Math.abs(span.x + (span.width || 0) / 2 - center);
        return distance(a) - distance(b);
      });
      return candidates[0] || null;
    }
    function columnLabel(cell) {
      const stacked = headersAbove(cell);
      if (stacked.length) {
        // Keep the nearest few header fragments so Amount/Qty and T+axable stack.
        const center = cell.x + (cell.width || 0) / 2;
        const near = stacked.filter((span) => Math.abs(span.x + (span.width || 0) / 2 - center) < 36).slice(0, 4);
        return normalizeLabel((near.length ? near : stacked.slice(0, 3)).map((span) => span.text).join(' '));
      }
      const above = spans
        .filter((other) => other.role === 'static' && other.y > cell.y + 2 && other.y < cell.y + 50
          && other.x < cell.x + (cell.width || 0) + 20 && other.x + (other.width || 0) > cell.x - 20)
        .sort((a, b) => (a.y - cell.y) - (b.y - cell.y))[0];
      return normalizeLabel(above?.text || '');
    }
    function columnRole(cell) {
      const label = columnLabel(cell);
      if (/\bamount\b/.test(label) && /\b(qty|quantity)\b/.test(label)) return 'rate';
      if (/\b(qty|quantity)\b/.test(label) && !/\bamount\b/.test(label)) return 'qty';
      if (/\b(exchange|ex rate|exrate)\b/.test(label)) return 'exchange';
      if (/\b(rate|price)\b/.test(label)) return 'rate';
      if (/\b(currency|curr)\b/.test(label) && !/\b(amount|sgst|cgst|igst)\b/.test(label)) return 'currency';
      if (/\bfcy\b/.test(label)) return 'fcy';
      // GST fragments must win over neighbouring Taxable / Non Taxable headers.
      if (/\b(sgst|cgst|igst|ugst|sac)\b/.test(label)) return 'gst';
      if (/\bnon\b/.test(label) && /\b(taxable|axable)\b/.test(label)) return 'nontaxable';
      if (/\b(taxable|axable)\b/.test(label)) return 'taxable';
      // Prefer total / currency amount over nearby GST header fragments.
      if (/\b(otal|total)\b/.test(label) || (/\bamount\b/.test(label) && /\binr\b/.test(label))) return 'money:';
      if (/\btax\b/.test(label) && !/\b(taxable|axable|nontaxable)\b/.test(label)) return 'tax';
      const named = label.match(/\b(inr|usd|aed|eur|gbp|sgd|vnd|pkr)\b/);
      if (named && /\bamount\b/.test(label)) return `money:${named[1].toUpperCase()}`;
      if (/\b(amount|total)\b/.test(label)) return 'money:';
      // X-proximity to fragmented GST headers (Format 1 style).
      const gstHeader = spans
        .filter((other) => other.role === 'static' && other.y >= headerBandLo && other.y <= headerBandHi && /\b(sgst|cgst|igst|ugst)\b/i.test(String(other.text || '')))
        .sort((a, b) => Math.abs((a.x + (a.width || 0) / 2) - (cell.x + (cell.width || 0) / 2)) - Math.abs((b.x + (b.width || 0) / 2) - (cell.x + (cell.width || 0) / 2)))[0];
      if (gstHeader && Math.abs((gstHeader.x + (gstHeader.width || 0) / 2) - (cell.x + (cell.width || 0) / 2)) < 22) {
        return 'gst';
      }
      const exHeader = spans
        .filter((other) => other.role === 'static' && other.y >= headerBandLo && other.y <= headerBandHi && /\bex\.?\s*rate\b/i.test(String(other.text || '')))
        .sort((a, b) => Math.abs(a.x - cell.x) - Math.abs(b.x - cell.x))[0];
      if (exHeader && Math.abs(exHeader.x - cell.x) < 18) return 'exchange';
      return '';
    }
    function baseAmount(line) {
      const qty = Number(line.quantity ?? 0);
      const price = Number(line.unit_price ?? 0);
      if (line.fcy_amount != null && line.fcy_amount !== '') return Number(line.fcy_amount);
      return qty * price;
    }
    function localPreTax(line) {
      if (line.taxable_amount != null && line.taxable_amount !== '' && line.is_taxable !== false) {
        return Number(line.taxable_amount);
      }
      if (line.non_taxable_amount != null && line.non_taxable_amount !== '' && line.is_taxable === false) {
        return Number(line.non_taxable_amount);
      }
      const base = baseAmount(line);
      const lineCode = String(line.currency_code || currency || '').toUpperCase();
      const invCode = String(currency || '').toUpperCase();
      const rate = Number(line.exchange_rate ?? invoice.exchange_rate);
      if (lineCode && invCode && lineCode !== invCode && Number.isFinite(rate)) {
        return Math.round(base * rate * 100) / 100;
      }
      return base;
    }
    function moneyFor(named, line) {
      const amount = lineAmount(line);
      const code = currency.toUpperCase();
      if (!named || named === code) return classicMoney(amount);
      const rate = Number(invoice.exchange_rate);
      if (!Number.isFinite(rate)) return '';
      return classicMoney(Math.round(amount * rate * 100) / 100);
    }
    const currencyCell = spans.find((span) => Math.abs(span.y - template.y) <= 4 && /^(INR|USD|AED|EUR|GBP|SGD|VND|PKR)$/.test(String(span.text || '').trim()));
    const lineCurrency = String(line.currency_code || currency || '').trim();
    if (currencyCell && lineCurrency) {
      const id = `line-${index}-ccy`;
      made.push({ ...currencyCell, id, role: 'dynamic', y, text: '' });
      values[id] = lineCurrency;
    }
    // Format 1 GST columns are left-to-right pairs: rate, amount, rate, amount…
    // (SGST%, SGST amt, CGST%, CGST amt). Do not infer missing components.
    const gstCells = cells.filter((cell) => columnRole(cell) === 'gst').sort((a, b) => a.x - b.x);
    for (const cell of cells) {
      const id = `line-${index}-${cell.id}`;
      made.push({ ...cell, id, role: 'dynamic', y, text: '' });
      const role = columnRole(cell);
      let bound = '';
      if (role === 'qty') bound = line.quantity == null ? '' : String(line.quantity);
      else if (role === 'rate') bound = classicMoney(line.unit_price ?? 0);
      else if (role === 'currency') bound = lineCurrency;
      else if (role === 'exchange') {
        const rate = Number(line.exchange_rate ?? invoice.exchange_rate);
        bound = Number.isFinite(Number(rate)) ? Number(rate).toFixed(5) : '';
      }       else if (role === 'fcy') bound = classicMoney(baseAmount(line));
      else if (role === 'taxable') {
        bound = line.is_taxable === false ? '' : classicMoney(localPreTax(line));
      } else if (role === 'nontaxable') {
        bound = line.is_taxable === false ? classicMoney(localPreTax(line)) : '';
      } else if (role === 'tax') bound = line.tax_amount == null ? '' : classicMoney(line.tax_amount);
      else if (role === 'gst') {
        const gstIndex = gstCells.indexOf(cell);
        const asRate = gstIndex % 2 === 0;
        const group = Math.floor(gstIndex / 2);
        if (group === 0) {
          bound = asRate
            ? (line.sgst_rate == null || line.sgst_rate === '' ? '' : Number(line.sgst_rate).toFixed(2))
            : (line.sgst_amount == null || line.sgst_amount === '' ? '' : classicMoney(line.sgst_amount));
        } else if (group === 1) {
          bound = asRate
            ? (line.cgst_rate == null || line.cgst_rate === '' ? '' : Number(line.cgst_rate).toFixed(2))
            : (line.cgst_amount == null || line.cgst_amount === '' ? '' : classicMoney(line.cgst_amount));
        } else {
          bound = asRate
            ? (line.igst_rate == null || line.igst_rate === '' ? '' : Number(line.igst_rate).toFixed(2))
            : (line.igst_amount == null || line.igst_amount === '' ? '' : classicMoney(line.igst_amount));
        }
      } else if (role.startsWith('money:')) bound = moneyFor(role.slice(6), line);
      else if (cell === amountCell) bound = classicMoney(lineAmount(line));
      else {
        const labeled = columnValue(cell, spans, line, lineCurrency || currency);
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
