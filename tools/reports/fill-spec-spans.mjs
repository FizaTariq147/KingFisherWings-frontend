/**
 * Fill the dynamic spans of any report spec from one open record.
 * Invoice and credit/debit layouts use the invoice binder. Every other module
 * resolves labels with reports/binding-dictionary.csv and the document context.
 * Missing values stay empty. Nothing is invented.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillInvoiceSpans, nearestLabel, normalizeLabel } from './invoice-bindings.mjs';
import { NO_SOURCE_PATHS, buildDocumentContext, moduleForCode } from './document-context.mjs';

export { nearestLabel };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const INVOICE_MODULES = new Set(['invoice', 'credit_debit']);

/** Short, ambiguous labels only match exactly. */
const EXACT_ONLY = new Set([
  'bank', 'account', 'user', 'printed', 'origin', 'destination', 'reference', 'department',
  'address', 'phone', 'email', 'web', 'website', 'remarks', 'type', 'date', 'total',
  'amount', 'tax', 'gst', 'description', 'freight', 'company', 'beneficiary',
]);

/** Dictionary rows keyed by normalized label. A document-family row wins over the others. */
export function loadDictionary() {
  const lines = fs.readFileSync(path.join(root, 'reports/binding-dictionary.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const rows = new Map();
  const rank = (family) => (family === 'document' ? 2 : family === 'invoice' ? 1 : 0);
  const ranks = new Map();
  for (const line of lines) {
    const [label, binding, family = ''] = line.split(',');
    if (!label || !binding) continue;
    if (!rows.has(label) || rank(family) > (ranks.get(label) ?? 0)) {
      rows.set(label, binding);
      ranks.set(label, rank(family));
    }
  }
  return rows;
}

function bindingForLabel(label, dictionary) {
  const key = normalizeLabel(label);
  if (!key) return '';
  if (dictionary.has(key)) return dictionary.get(key);
  const words = key.split(' ');
  if (words.length > 5) return '';
  let best = '';
  let bestLength = 0;
  for (const entry of dictionary.keys()) {
    if (entry.length < 4 || EXACT_ONLY.has(entry)) continue;
    const hit = key.startsWith(`${entry} `) || key.endsWith(` ${entry}`);
    if (hit && entry.length > bestLength) {
      best = dictionary.get(entry);
      bestLength = entry.length;
    }
  }
  return best;
}

function pagesOf(spec) {
  return spec.pages?.length ? spec.pages : [spec];
}

function resolveSpan(span, spans, dictionary, context) {
  const label = nearestLabel(span, spans);
  const labelText = label?.text || '';
  const binding = bindingForLabel(labelText, dictionary);
  if (!binding) return { label: labelText, binding: '', status: 'no source', value: '' };
  if (NO_SOURCE_PATHS.has(binding)) return { label: labelText, binding, status: 'no source', value: '' };
  if (!(binding in context)) return { label: labelText, binding, status: 'wrong path', value: '' };
  const value = String(context[binding] || '');
  if (!value.trim()) return { label: labelText, binding, status: 'empty', value: '' };
  return { label: labelText, binding, status: 'filled', value };
}

function emptyAnalysis() {
  return { dynamic: 0, bound: 0, filled: 0, empty: 0, noSource: 0, boundRatio: 0, rows: [] };
}

function finish(analysis) {
  analysis.boundRatio = analysis.dynamic ? Math.round((analysis.bound / analysis.dynamic) * 1000) / 1000 : 0;
  return analysis;
}

/**
 * Count how many dynamic spans resolve to a real binding path.
 * bound = a path with a source. filled = bound and non-empty for this record.
 * empty = bound but empty in this record. noSource = no path, no source, or a wrong path.
 */
export function analyzeSpecBindings(spec, record = {}) {
  const analysis = emptyAnalysis();
  const module = moduleForCode(spec.code);
  if (INVOICE_MODULES.has(module)) {
    const filled = fillInvoiceSpans(spec, record);
    const blanks = new Map(filled.blanks.map((blank) => [blank.span, blank]));
    for (const page of pagesOf(spec)) {
      for (const span of page.spans || []) {
        if (span.role !== 'dynamic') continue;
        analysis.dynamic += 1;
        const value = String(filled.values[span.id] ?? '').trim();
        const blank = blanks.get(span.id);
        if (value) {
          analysis.bound += 1;
          analysis.filled += 1;
          analysis.rows.push({ span: span.id, label: nearestLabel(span, page.spans)?.text || '', binding: blank?.binding || '', status: 'filled' });
        } else if (blank?.why === 'empty in the record') {
          analysis.bound += 1;
          analysis.empty += 1;
          analysis.rows.push({ span: span.id, label: blank.label, binding: blank.binding, status: 'empty' });
        } else {
          analysis.noSource += 1;
          analysis.rows.push({ span: span.id, label: blank?.label || nearestLabel(span, page.spans)?.text || '', binding: blank?.binding || '', status: blank?.why === 'wrong path' ? 'wrong path' : 'no source' });
        }
      }
    }
    return finish(analysis);
  }

  const dictionary = loadDictionary();
  const context = buildDocumentContext(record);
  for (const page of pagesOf(spec)) {
    const spans = page.spans || [];
    for (const span of spans) {
      if (span.role !== 'dynamic') continue;
      analysis.dynamic += 1;
      const resolved = resolveSpan(span, spans, dictionary, context);
      if (resolved.status === 'filled') {
        analysis.bound += 1;
        analysis.filled += 1;
      } else if (resolved.status === 'empty') {
        analysis.bound += 1;
        analysis.empty += 1;
      } else {
        analysis.noSource += 1;
      }
      analysis.rows.push({ span: span.id, label: resolved.label, binding: resolved.binding, status: resolved.status });
    }
  }
  return finish(analysis);
}

/** Same result shape as fillInvoiceSpans: { values, blanks }. */
export function fillSpecSpans(spec, record = {}) {
  const module = moduleForCode(spec.code);
  if (INVOICE_MODULES.has(module)) return fillInvoiceSpans(spec, record);

  const dictionary = loadDictionary();
  const context = buildDocumentContext(record);
  const values = {};
  const blanks = [];
  for (const page of pagesOf(spec)) {
    const spans = page.spans || [];
    for (const span of spans) {
      if (span.role !== 'dynamic') continue;
      const resolved = resolveSpan(span, spans, dictionary, context);
      values[span.id] = resolved.value;
      if (resolved.status === 'filled') continue;
      blanks.push({
        span: span.id,
        label: resolved.label,
        binding: resolved.binding,
        why: resolved.status === 'empty' ? 'empty in the record' : resolved.status === 'wrong path' ? 'wrong path' : 'no source',
      });
    }
  }
  return { values, blanks };
}
