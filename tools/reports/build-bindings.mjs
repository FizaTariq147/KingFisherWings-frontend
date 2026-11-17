/**
 * Apply reports/binding-dictionary.csv to the pilot specs.
 * The nearest static label to the left, otherwise above, selects the row.
 * Run: node tools/reports/build-bindings.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PILOTS = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY',
];

export function normalizeLabel(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function loadDictionary() {
  const lines = fs.readFileSync(path.join(root, 'reports/binding-dictionary.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const rows = new Map();
  for (const line of lines) {
    const [label, binding, family] = line.split(',');
    if (label && binding) rows.set(label, { binding, family });
  }
  return rows;
}

function nearestLabel(span, spans) {
  const left = spans
    .filter((other) => other.role === 'static' && other !== span && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => (span.x - (b.x + b.width)) - (span.x - (a.x + a.width)))[0];
  if (left) return { label: left, side: 'left' };
  const above = spans
    .filter((other) => other.role === 'static' && other !== span && other.y > span.y + 2 && other.x < span.x + span.width && other.x + other.width > span.x)
    .sort((a, b) => (a.y - span.y) - (b.y - span.y))[0];
  return above ? { label: above, side: 'above' } : null;
}

function csv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const dictionary = loadDictionary();
const unresolved = [['code', 'span', 'text', 'nearest_label', 'side', 'reason']];
for (const code of PILOTS) {
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  if (!fs.existsSync(specPath)) continue;
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const pages = spec.pages?.length ? spec.pages : [spec];
  for (const page of pages) {
    for (const span of page.spans) {
      if (span.role !== 'dynamic') {
        span.binding = '';
        continue;
      }
      const found = nearestLabel(span, page.spans);
      const key = found ? normalizeLabel(found.label.text) : '';
      let row = key ? dictionary.get(key) : null;
      if (!row && key.length >= 4) {
        const matches = [...dictionary.keys()].filter((entry) => entry.startsWith(key));
        if (matches.length === 1) row = dictionary.get(matches[0]);
      }
      if (!row) {
        span.binding = '';
        unresolved.push([code, span.id, span.text, found?.label.text || '', found?.side || '', key ? 'label is not in the dictionary' : 'no static label to the left or above'].map(csv).join(','));
        continue;
      }
      span.binding = row.binding;
    }
  }
  if (spec.pages?.length) spec.spans = spec.pages[0].spans;
  spec.bindings = pages.flatMap((page) => page.spans)
    .filter((span) => span.role === 'dynamic' && span.binding)
    .map((span) => ({ id: span.id, path: span.binding }));
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
  const lines = ['id,page,text,binding,reason'];
  for (const page of pages) {
    for (const span of page.spans.filter((item) => item.role === 'dynamic')) {
      lines.push([span.id, String(span.id).match(/^p(\d+)/)?.[1] || '1', span.text, span.binding, span.binding ? 'dictionary' : 'unresolved'].map(csv).join(','));
    }
  }
  fs.writeFileSync(path.join(root, 'reports/specs', `${code}.dynamic.csv`), `${lines.join('\n')}\n`);
}
fs.writeFileSync(path.join(root, 'reports/output/unresolved-bindings.csv'), `${unresolved.join('\n')}\n`);
console.log(JSON.stringify({ dictionary: dictionary.size, unresolved: unresolved.length - 1 }));
