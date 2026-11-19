/**
 * Resolve invoice-spec dynamic spans with reports/binding-dictionary.csv.
 * Does not write the specs. Missing labels stay unresolved.
 *
 *   node tools/reports/invoice-bindings.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { layoutRepeatingCharges } from './invoice-rows.mjs';
import { amountInWords } from './amount-words.mjs';
import { isAllowlisted } from './allowlist.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function normalizeLabel(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function loadDictionary() {
  const lines = fs.readFileSync(path.join(root, 'reports/binding-dictionary.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const rows = new Map();
  for (const line of lines) {
    const [label, binding, family] = line.split(',');
    if (!label || !binding) continue;
    if (!rows.has(label) || family === 'invoice') rows.set(label, binding);
  }
  return rows;
}

export function nearestLabel(span, spans) {
  const left = spans
    .filter((other) => other.role === 'static' && other !== span && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => (span.x - (b.x + b.width)) - (span.x - (a.x + a.width)))[0];
  if (left) return left;
  return spans
    .filter((other) => other.role === 'static' && other !== span && other.y > span.y + 2 && other.x < span.x + span.width && other.x + other.width > span.x)
    .sort((a, b) => (a.y - span.y) - (b.y - span.y))[0] || null;
}

export function bindingForLabel(label, dictionary) {
  const key = normalizeLabel(label);
  if (!key) return '';
  if (dictionary.has(key)) return dictionary.get(key);
  if (key.length >= 4) {
    const matches = [...dictionary.keys()].filter((entry) => entry.startsWith(key));
    if (matches.length === 1) return dictionary.get(matches[0]);
  }
  const generic = new Set(['total', 'amount', 'date', 'type', 'tax', 'gst', 'no']);
  let best = '';
  let bestLength = 0;
  for (const entry of dictionary.keys()) {
    if (entry.length < 4 || generic.has(entry)) continue;
    const hit = key === entry || key.startsWith(`${entry} `) || key.endsWith(` ${entry}`) || key.includes(` ${entry} `);
    if (hit && entry.length > bestLength) {
      best = dictionary.get(entry);
      bestLength = entry.length;
    }
  }
  return best;
}

export function invoiceFamilyCodes() {
  const text = fs.readFileSync(path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'), 'utf8');
  const codes = [];
  const pattern = /"code": "([^"]+)"([\s\S]*?)"contexts": \[([\s\S]*?)\]/g;
  for (const match of text.matchAll(pattern)) {
    if (/"invoice"/.test(match[3])) codes.push(match[1]);
  }
  return codes;
}

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

function isNumericText(text) {
  return /^-?[\d,]+(\.\d+)?$/.test(String(text || '').trim());
}

function aliasBinding(key) {
  if (!key) return '';
  if (/\b(sgst|cgst|igst)\b/.test(key)) return '';
  if (key === 'subtotal' || key.startsWith('subtotal') || key.startsWith('sub total')) return 'invoice.amount';
  if (key === 'taxable' || key.startsWith('taxable')) return 'invoice.amount';
  if (key === 'vat' || key.startsWith('vat ') || key === 'tax' || key === 'gst') return 'invoice.tax';
  if (key === 'grand total' || key.startsWith('grand total') || key === 'total amount') return 'invoice.total';
  if (key === 'bill to' || key.startsWith('bill to')) return 'party.billTo';
  if (key === 'shipper' || key.startsWith('shipper')) return 'party.shipper';
  if (key === 'consignee' || key.startsWith('consignee')) return 'party.consignee';
  if (key === 'vessel' || key.startsWith('vessel')) return 'shipment.vessel';
  if (key.startsWith('container')) return 'cargo.containerNo';
  if (key === 'hbl' || key.startsWith('hbl ')) return 'shipment.hbl';
  if (key.startsWith('shipment')) return 'shipment.number';
  if (key.startsWith('reference') || key === 'ref' || key.startsWith('ref no')) return 'shipment.reference';
  if (key.includes('voyage') || key.includes('flight')) return 'shipment.voyage';
  if (key.includes('inco')) return 'job.incoterms';
  if (key.includes('p o') || key.includes('po no') || key.includes('lpo')) return 'invoice.lpo';
  if (key === 'balance' || key.startsWith('balance ')) return 'invoice.outstanding';
  if (key.includes('due date')) return 'invoice.dueDate';
  if (key.includes('department')) return 'job.department';
  if (key.includes('place of origin') || key === 'origin') return 'shipment.pol';
  if ((key.includes('hawb') || key.includes('hbl')) && (key.includes('mawb') || key.includes('mbl'))) return 'shipment.transportDocs';
  if (key.includes('hawb') && key.includes('hbl')) return 'shipment.houseDoc';
  if (key.includes('mawb') || key.includes('mbl')) return 'shipment.masterDoc';
  if (key.startsWith('igm')) return 'shipment.igm';
  if (key.startsWith('narration')) return 'invoice.narration';
  if (key.startsWith('remark')) return 'invoice.remarks';
  if (key.startsWith('qty') || key.startsWith('quantity')) return 'invoice.lines.quantity';
  if (key === 'rate' || key.startsWith('rate ')) return 'invoice.lines.rate';
  return '';
}

function pathValues(record) {
  const org = record.organization || {};
  const invoice = record.invoice || {};
  const job = record.job || {};
  const party = record.party || {};
  const sea = job.sea_fcl_details || job.sea_lcl_details || {};
  const air = job.air_details || {};
  const text = (value) => (value == null ? '' : String(value).trim());
  return {
    'company.name': text(org.display_name) || text(org.name),
    'company.address': [org.address, org.city, org.country_code].map(text).filter(Boolean).join(', '),
    'company.phone': text(org.phone),
    'company.email': text(org.email),
    'party.billTo': [text(invoice.party_name) || text(party.name), party.address, party.city].map(text).filter(Boolean).join(', '),
    'party.shipper': text(job.shipper_name),
    'party.consignee': text(job.consignee_name),
    'party.notify': '',
    'job.number': text(invoice.job_number) || text(job.job_number),
    'invoice.number': text(invoice.invoice_number),
    'invoice.date': text(invoice.invoice_date),
    'invoice.currency': text(invoice.currency_code),
    'invoice.amount': classicMoney(invoice.subtotal ?? 0),
    'invoice.tax': classicMoney(invoice.tax_total ?? 0),
    'invoice.total': classicMoney(invoice.total_amount ?? (Number(invoice.subtotal ?? 0) + Number(invoice.tax_total ?? 0))),
    'shipment.mawb': text(air.mawb_number),
    'shipment.hawb': text(air.hawb_number),
    'shipment.hbl': text(sea.hbl_number),
    'shipment.mbl': text(sea.mbl_number),
    'shipment.houseDoc': text(sea.hbl_number) || text(air.hawb_number),
    'shipment.masterDoc': text(sea.mbl_number) || text(air.mawb_number),
    'shipment.transportDocs': [text(sea.mbl_number), text(air.mawb_number), text(sea.hbl_number), text(air.hawb_number)].filter(Boolean).join(' / '),
    'shipment.pol': text(job.origin_port_code),
    'shipment.pod': text(job.dest_port_code),
    'shipment.placeOfReceipt': text(sea.place_of_receipt),
    'shipment.placeOfDelivery': text(sea.place_of_delivery),
    'shipment.finalDestination': text(job.dest_door_address),
    'shipment.vessel': text(job.vessel_name) || text(sea.vessel_name),
    'shipment.voyage': text(job.voyage_number) || text(sea.voyage_number),
    'shipment.etd': text(job.etd) || text(sea.etd),
    'shipment.eta': text(job.eta) || text(sea.eta),
    'shipment.carrier': text(sea.shipping_line_name),
    'shipment.freightTerms': text(sea.freight_terms),
    'shipment.serviceType': text(job.service_scope),
    'cargo.description': text(job.commodity_description) || text(job.commodity),
    'cargo.marks': text(job.cargo?.[0]?.marks_numbers),
    'cargo.pieces': job.pieces == null ? '' : String(job.pieces),
    'cargo.grossWeight': job.gross_weight == null ? '' : String(job.gross_weight),
    'cargo.netWeight': '',
    'cargo.measurement': job.volume_cbm == null ? '' : String(job.volume_cbm),
    'cargo.containerNo': text(job.primary_container_number) || text(job.containers?.[0]?.container_number),
    'shipment.number': text(job.shipment_number),
    'shipment.reference': text(job.client_reference_no) || text(job.reference_no),
    'shipment.igm': '',
    'invoice.narration': '',
    'invoice.remarks': text(invoice.remarks),
    'invoice.dueDate': text(invoice.due_date),
    'invoice.lpo': text(invoice.lpo_number),
    'invoice.outstanding': invoice.outstanding_balance == null ? '' : classicMoney(invoice.outstanding_balance),
    'job.incoterms': text(job.incoterms),
    'job.department': text(job.department_name),
    'invoice.amountWords': amountInWords(invoice.total_amount ?? (Number(invoice.subtotal ?? 0) + Number(invoice.tax_total ?? 0)), invoice.currency_code),
    'invoice.lines.quantity': invoice.lines?.[0]?.quantity == null ? '' : String(invoice.lines[0].quantity),
    'invoice.lines.rate': invoice.lines?.[0]?.unit_price == null || invoice.lines[0].unit_price === '' ? '' : classicMoney(invoice.lines[0].unit_price),
    'cargo.containerType': text(job.containers?.[0]?.container_type_code),
    'cargo.sealNo': text(job.containers?.[0]?.seal_number),
  };
}

const NO_SOURCE = new Set(['party.notify', 'cargo.netWeight', 'shipment.igm', 'invoice.narration']);

function taxModeFor(code) {
  try {
    const table = JSON.parse(fs.readFileSync(path.join(root, 'reports/invoice-v2-applicability.json'), 'utf8'));
    return table[code]?.taxMode === 'split' ? 'split' : 'single';
  } catch {
    return 'single';
  }
}

/**
 * Fill one invoice spec from a record. Totals and line amounts use the same
 * numbers the classic PDF prints. Split GST cells stay empty.
 */
export function fillInvoiceSpans(spec, record) {
  const dictionary = loadDictionary();
  const byPath = pathValues(record);
  const values = {};
  const blanks = [];
  const invoice = record.invoice || {};
  const lines = invoice.lines || [];
  const subtotal = classicMoney(invoice.subtotal ?? 0);
  const tax = classicMoney(invoice.tax_total ?? 0);
  const total = byPath['invoice.total'];
  const laid = layoutRepeatingCharges(spec, record);
  Object.assign(values, laid.values);
  blanks.push(...laid.blanks);
  const pages = spec.pages?.length ? spec.pages : [spec];

  for (const page of pages) {
    const spans = page.spans || [];
    const dynamic = spans.filter((span) => span.role === 'dynamic');
    const rows = [];
    for (const span of dynamic) {
      const row = rows.find((item) => Math.abs(item.y - span.y) <= 3);
      if (row) row.spans.push(span);
      else rows.push({ y: span.y, spans: [span] });
    }
    const chargeRows = rows.filter((row) => {
      const numeric = row.spans.filter((span) => isNumericText(span.text));
      if (numeric.length < 4) return false;
      const keys = row.spans.map((span) => normalizeLabel(nearestLabel(span, spans)?.text || '')).join(' ');
      return !/\b(sgst|cgst|igst)\b/.test(keys);
    }).sort((a, b) => b.y - a.y);

    if (!laid.values || !Object.keys(laid.values).length) {
      chargeRows.forEach((row, index) => {
        const right = row.spans.slice().sort((a, b) => b.x - a.x)[0];
        const line = lines[index];
        if (!line) {
          blanks.push({ span: right.id, label: 'line amount', binding: 'invoice.lines', why: 'empty in the record' });
          return;
        }
        values[right.id] = classicMoney(lineAmount(line));
        const caption = nearestLabel(right, spans);
        if (caption?.role === 'static' && String(line.description || line.charge_code || '').trim()) {
          values[caption.id] = String(line.description || line.charge_code);
        }
        for (const span of row.spans) {
          if (span.id === right.id) continue;
          values[span.id] = '';
          const side = nearestLabel(span, spans);
          blanks.push({ span: span.id, label: side?.text || 'charge column', binding: '', why: 'no source' });
        }
      });
      if (lines.length > chargeRows.length) {
        for (let index = chargeRows.length; index < lines.length; index += 1) {
          blanks.push({
            span: `line-${index + 1}`,
            label: lines[index].description || 'line amount',
            binding: 'invoice.lines',
            why: 'no source',
          });
        }
      }
    }
    const totalRows = rows.filter((row) => {
      const keys = row.spans.map((span) => normalizeLabel(nearestLabel(span, spans)?.text || '')).join(' ');
      return /\b(sgst|cgst|igst)\b/.test(keys);
    });
    for (const row of totalRows) {
      const numeric = row.spans.filter((span) => isNumericText(span.text)).sort((a, b) => a.x - b.x);
      const right = numeric[numeric.length - 1];
      if (right && total) values[right.id] = total;
    }

    for (const span of dynamic) {
      if (values[span.id] != null) continue;
      const label = nearestLabel(span, spans);
      const key = normalizeLabel(label?.text || '');
      if (/\b(sgst|cgst|igst)\b/.test(key)) {
        blanks.push({ span: span.id, label: label?.text || '', binding: '', why: 'no source' });
        values[span.id] = '';
        continue;
      }
      const binding = aliasBinding(key) || bindingForLabel(label?.text || '', dictionary);
      if (!binding) {
        blanks.push({ span: span.id, label: label?.text || '', binding: '', why: 'no source' });
        values[span.id] = '';
        continue;
      }
      if (!(binding in byPath)) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'wrong path' });
        values[span.id] = '';
        continue;
      }
      if (NO_SOURCE.has(binding)) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'no source' });
        values[span.id] = '';
        continue;
      }
      if (binding === 'invoice.amount') {
        values[span.id] = subtotal;
        continue;
      }
      if (binding === 'invoice.tax') {
        values[span.id] = tax;
        continue;
      }
      if (binding === 'invoice.total') {
        values[span.id] = total;
        continue;
      }
      const text = byPath[binding];
      if (!String(text || '').trim()) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'empty in the record' });
        values[span.id] = '';
        continue;
      }
      values[span.id] = String(text);
    }

    const taxMode = taxModeFor(spec.code);
    for (const span of spans) {
      const own = normalizeLabel(span.text);
      const label = nearestLabel(span, spans);
      const key = normalizeLabel(label?.text || '');
      if (taxMode === 'single' && (/\b(sgst|cgst|igst)\b/.test(own) || /\b(sgst|cgst|igst)\b/.test(key))) {
        values[span.id] = '';
        if (span.role === 'dynamic') blanks.push({ span: span.id, label: span.text || label?.text || '', binding: '', why: 'no source' });
        continue;
      }
      if (span.role === 'dynamic' || values[span.id] != null) continue;
      if (isAllowlisted(span.text)) {
        if (/rupee|fils|paise|dollars/i.test(span.text || '') && byPath['invoice.amountWords']) {
          values[span.id] = byPath['invoice.amountWords'];
        }
        continue;
      }
      if (/rupee|fils|paise|dollars|only$/i.test(span.text || '') && byPath['invoice.amountWords']) {
        values[span.id] = byPath['invoice.amountWords'];
        continue;
      }
      const binding = aliasBinding(key) || bindingForLabel(label?.text || '', dictionary);
      if (!binding) continue;
      if (NO_SOURCE.has(binding)) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'no source' });
        values[span.id] = '';
        continue;
      }
      const filled = byPath[binding];
      if (!String(filled || '').trim()) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'empty in the record' });
        values[span.id] = '';
        continue;
      }
      values[span.id] = String(filled);
    }
  }

  return {
    values,
    blanks,
    totals: { subtotal, tax, total, lines: lines.map((line) => classicMoney(lineAmount(line))) },
  };
}

function csv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function main() {
  const dictionary = loadDictionary();
  const codes = invoiceFamilyCodes();
  const rows = [['code', 'span', 'label', 'proposed_binding']];
  let dynamic = 0;
  let resolved = 0;
  const missingSpec = [];
  for (const code of codes) {
    const specPath = path.join(root, 'reports/specs', `${code}.json`);
    if (!fs.existsSync(specPath)) {
      missingSpec.push(code);
      continue;
    }
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const pages = spec.pages?.length ? spec.pages : [spec];
    for (const page of pages) {
      for (const span of page.spans || []) {
        if (span.role !== 'dynamic') continue;
        dynamic += 1;
        const label = nearestLabel(span, page.spans || []);
        const binding = bindingForLabel(label?.text || '', dictionary);
        if (binding) {
          resolved += 1;
          continue;
        }
        rows.push([code, span.id, label?.text || '', ''].map(csv).join(','));
      }
    }
  }
  const out = path.join(root, 'reports/invoice-unresolved.csv');
  fs.writeFileSync(out, `${rows.join('\n')}\n`);
  console.log(JSON.stringify({
    family: codes.length,
    withSpec: codes.length - missingSpec.length,
    missingSpec: missingSpec.length,
    dynamic,
    resolved,
    unresolved: rows.length - 1,
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
