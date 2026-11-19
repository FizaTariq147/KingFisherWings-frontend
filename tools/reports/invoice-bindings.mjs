/**
 * Resolve invoice-spec dynamic spans with reports/binding-dictionary.csv.
 * Does not write the specs. Missing labels stay unresolved.
 *
 *   node tools/reports/invoice-bindings.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  return '';
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
