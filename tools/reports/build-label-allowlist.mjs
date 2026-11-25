/**
 * Build reports/label-allowlist.json from the label inventory and the
 * static spans on the invoice specs. Sample values are not listed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { normalizeLabel } from './invoice-bindings.mjs';

const root = process.cwd();
const codeSource = fs.readFileSync(path.join(root, 'src/features/reports/engine/invoiceV2Codes.ts'), 'utf8');
const codes = [...codeSource.matchAll(/'([A-Z][A-Z0-9_]+)'/g)].map((match) => match[1]);

function fresa(text) {
  return /fresa|echnolog|powered by/i.test(text);
}

export function classifyStatic(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  const key = normalizeLabel(raw);
  if (!raw || !key) return 'empty';
  if (fresa(raw)) return 'sample';
  if (/@|https?:|www\./i.test(raw)) return 'sample';
  if (/\b(inr|usd|aed|eur|gbp|sgd|vnd|sar|qar|cny|jpy)\b/i.test(raw)) return 'sample';
  if (/\b(seal fee|bill of lading|freight charge|ocean freight|terminal|handling|dubai|chennai|mumbai|singapore|abu dhabi)\b/i.test(raw)) return 'sample';
  if (/^freight$/i.test(raw)) return 'sample';
  if (/\b(rupee|rupees|fils|only|thc)\b/i.test(raw)) return 'sample';
  if (/\.com|nolog/i.test(raw)) return 'sample';
  if (/\b(pvt|ltd|llc|llp|inc|gmbh|bank|a\/c|account no|ifsc|swift|gstin|pan no)\b/i.test(raw)) return 'sample';
  if (/\d/.test(raw)) return 'sample';
  if (raw.length > 90) {
    if (/terms|payment|computer-generated|signature|responsible|acknowledge|without prejudice/i.test(raw)) return 'legal';
    return 'sample';
  }
  return 'label';
}

function inventoryKeys() {
  const lines = fs.readFileSync(path.join(root, 'reports/label-inventory.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const keys = new Set();
  for (const line of lines) {
    const [label, , families, sample] = line.split(',');
    if (!label) continue;
    const invoice = /commercial/.test(families || '') || /INVOICE_/.test(sample || '') || /PROFORMA_/.test(sample || '') || /PURCHASE_INVOICE_/.test(sample || '');
    if (!invoice) continue;
    const key = normalizeLabel(label);
    if (key && classifyStatic(label) === 'label' && !key.split(' ').some((word) => word.length < 2)) keys.add(key);
  }
  return keys;
}

function cleanLabel(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (classifyStatic(raw) !== 'label') return false;
  if (raw.length < 2 || raw.length > 48) return false;
  if (/^[^A-Za-z(]/.test(raw)) return false;
  const words = raw.split(/\s+/);
  if (words.some((word) => word.replace(/[^A-Za-z]/g, '').length < 2)) return false;
  return true;
}

const labels = new Set();
const headers = new Set();
const legal = new Set();
const samples = new Set();
const fromInventory = new Set();
const knownInventory = inventoryKeys();
const headerKeys = new Set([
  'charges', 'description', 'description of charges', 'qty', 'quantity', 'unit', 'rate', 'amount',
  'currency', 'tax', 'tax amount', 'sac', 'hsn', 'ex rate', 'taxable', 'sgst', 'cgst', 'igst',
  'subtotal', 'sub total', 'grand total', 'total', 'total amount', 'vat', 'gst', 'narration',
  'remarks', 'shipper', 'consignee', 'bill to', 'vessel', 'voyage', 'container', 'container no',
  'hbl', 'hawb', 'mawb', 'mbl', 'shipment no', 'reference no', 'igm no', 'igm', 'date', 'due date',
  'invoice no', 'invoice number', 'job no', 'pol', 'pod', 'place of receipt', 'place of delivery',
  'packages', 'weight', 'volume', 's no', 'sr no', 'sl no',
]);

function chargeRowYs(spans) {
  const rows = [];
  for (const span of spans) {
    if (span.role !== 'dynamic') continue;
    if (!/^-?[\d,]+(\.\d+)?$/.test(String(span.text || '').trim())) continue;
    const row = rows.find((item) => Math.abs(item.y - span.y) <= 3);
    if (row) row.count += 1;
    else rows.push({ y: span.y, count: 1 });
  }
  return rows.filter((row) => row.count >= 3).map((row) => row.y);
}

function onChargeRow(span, ys) {
  return ys.some((y) => Math.abs(y - span.y) <= 4);
}

function valueBesideLabel(span, spans) {
  const left = spans
    .filter((other) => other !== span && other.role !== 'dynamic' && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => b.x - a.x)[0];
  if (!left) return false;
  const leftText = String(left.text || '').replace(/\s+/g, ' ').trim();
  return cleanLabel(leftText) && span.x - (left.x + (left.width || 0)) < 160;
}

for (const code of codes) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const pages = spec.pages?.length ? spec.pages : [spec];
  for (const page of pages) {
    const spans = page.spans || [];
    const chargeYs = chargeRowYs(spans);
    for (const span of spans) {
      if (span.role === 'dynamic') continue;
      const text = String(span.text || '').replace(/\s+/g, ' ').trim();
      const kind = classifyStatic(text);
      const key = normalizeLabel(text);
      const header = headerKeys.has(key);
      const caption = onChargeRow(span, chargeYs) && !header;
      const beside = !header && valueBesideLabel(span, spans);
      const title = /^(tax invoice|invoice|original|proforma invoice|debit note|credit note|purchase invoice|statement of charges)$/i.test(text);
      const fragment = new Set(['all destina', 'otal', 'oyage', 'refe no']).has(key);
      const complete = !fragment && (header || /[a-z]/.test(text) || text.length >= 8 || title);
      const keptHeader = header && cleanLabel(text) && complete;
      const keptLabel = !caption && !beside && cleanLabel(text) && complete && (title || knownInventory.has(key));
      if (kind === 'legal' && !caption && !/\d/.test(text)) legal.add(text);
      else if (keptHeader) {
        headers.add(text);
        if (knownInventory.has(key)) fromInventory.add(text);
      } else if (keptLabel && kind === 'label') {
        labels.add(text);
        if (knownInventory.has(key)) fromInventory.add(text);
      } else if (text) samples.add(text);
    }
  }
}

const document = {
  family: 'invoice',
  source: 'reports/label-inventory.csv and static spans on the 26 invoice specs',
  labels: [...labels].sort((a, b) => a.localeCompare(b)),
  headers: [...headers].sort((a, b) => a.localeCompare(b)),
  legal: [...legal].sort((a, b) => a.localeCompare(b)),
  inventoryLabels: [...fromInventory].sort((a, b) => a.localeCompare(b)),
  withheldSamples: samples.size,
};
const out = path.join(root, 'reports/label-allowlist.json');
fs.writeFileSync(out, `${JSON.stringify(document, null, 2)}\n`);
console.log(JSON.stringify({
  labels: document.labels.length,
  headers: document.headers.length,
  legal: document.legal.length,
  inventoryLabels: document.inventoryLabels.length,
  withheldSamples: samples.size,
}));
