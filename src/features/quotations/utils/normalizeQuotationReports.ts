import { normalizeQuotation } from './normalizeQuotation';

/** Helpers to render quotation report API payloads as tables / metric cards. */

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function formatReportLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function formatReportCell(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '—';
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    return trimmed;
  }
  if (Array.isArray(value)) return String(value.length);
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['name', 'label', 'title', 'code', 'full_name', 'quotation_number', 'quote_no']) {
      const nested = record[key];
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
    return '—';
  }
  return String(value);
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return undefined;
}

function nestedName(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  const record = asRecord(value);
  if (!record) return '';
  return pickString(
    record,
    'name',
    'party_name',
    'full_name',
    'legal_name',
    'display_name',
    'company_name',
    'code',
    'title',
    'label',
  );
}

function resolveCustomerName(record: Record<string, unknown>): string {
  const nestedQuote = asRecord(record.quotation);
  return (
    pickString(record, 'customer_name', 'party_name', 'customer') ||
    nestedName(record.customer) ||
    nestedName(record.party) ||
    (nestedQuote
      ? pickString(nestedQuote, 'customer_name', 'party_name') ||
        nestedName(nestedQuote.customer) ||
        nestedName(nestedQuote.party)
      : '') ||
    ''
  );
}

const SKIP_METRIC_KEYS = new Set([
  'id',
  'items',
  'rows',
  'results',
  'data',
  'list',
  'meta',
  'pagination',
  'links',
  'errors',
]);

/** Flatten scalar fields from an analytics object into metric cards. */
export function extractReportMetrics(
  data: unknown,
): Array<{ key: string; label: string; value: string }> {
  const root = asRecord(data);
  if (!root) return [];

  const sources: Record<string, unknown>[] = [root];
  for (const key of ['summary', 'totals', 'metrics', 'stats', 'statistics', 'data']) {
    const nested = asRecord(root[key]);
    if (nested) sources.push(nested);
  }

  const out: Array<{ key: string; label: string; value: string }> = [];
  const seen = new Set<string>();

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (SKIP_METRIC_KEYS.has(key) || seen.has(key)) continue;
      if (value == null) continue;
      if (typeof value === 'object') continue;
      seen.add(key);
      out.push({
        key,
        label: formatReportLabel(key),
        value: formatReportCell(value),
      });
    }
  }

  return out;
}

/** Prefer known list keys, else first array-of-objects found. */
export function extractReportRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      const record = asRecord(item);
      return record ?? { value: item, id: String(index) };
    });
  }

  const root = asRecord(data);
  if (!root) return [];

  for (const key of [
    'items',
    'rows',
    'results',
    'reasons',
    'lost_reasons',
    'by_reason',
    'breakdown',
    'quotations',
    'charges',
    'lines',
    'data',
  ]) {
    const value = root[key];
    if (Array.isArray(value) && value.length > 0) {
      return extractReportRows(value);
    }
  }

  // Object map of reason → count
  const entries = Object.entries(root).filter(
    ([key, value]) => !SKIP_METRIC_KEYS.has(key) && (typeof value === 'number' || typeof value === 'string'),
  );
  if (entries.length > 0 && extractReportMetrics(root).length === entries.length) {
    return [];
  }

  return [];
}

export function columnsFromRows(
  rows: Record<string, unknown>[],
  preferred: string[] = [],
  maxColumns = 10,
): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key === 'id' || key.endsWith('_id')) continue;
      if (typeof row[key] === 'object' && row[key] !== null && !Array.isArray(row[key])) {
        // keep nested objects only if they stringify nicely via formatReportCell
      }
      keys.add(key);
    }
  }

  const preferredFound = preferred.filter((key) => keys.has(key));
  const rest = [...keys].filter((key) => !preferredFound.includes(key));
  return [...preferredFound, ...rest].slice(0, maxColumns);
}

/** Normalize chargewise list items into display rows (quote + charge line when present). */
export function normalizeChargewiseRows(items: unknown[]): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  for (const item of items) {
    const record = asRecord(item);
    if (!record) continue;

    const quotation = normalizeQuotation(item) ?? normalizeQuotation(record.quotation);
    const linesRaw =
      record.lines ??
      record.charges ??
      record.charge_lines ??
      quotation?.lines ??
      asRecord(record.quotation)?.lines;
    const lines = Array.isArray(linesRaw) ? linesRaw : null;

    const quoteNo =
      quotation?.quotation_number ||
      quotation?.quote_no ||
      pickString(record, 'quotation_number', 'quote_no', 'quote_number', 'number', 'code') ||
      pickString(asRecord(record.quotation) ?? {}, 'quotation_number', 'quote_no', 'quote_number') ||
      '—';
    const customer =
      quotation?.customer_name ||
      resolveCustomerName(record) ||
      '—';
    const status = quotation?.status || pickString(record, 'status') || pickString(asRecord(record.quotation) ?? {}, 'status') || '—';
    const jobType =
      quotation?.job_type ||
      pickString(record, 'job_type', 'service_type') ||
      pickString(asRecord(record.quotation) ?? {}, 'job_type', 'service_type') ||
      '—';
    const date =
      (
        quotation?.created_at ||
        quotation?.valid_until ||
        pickString(record, 'quotation_date', 'created_at', 'date', 'valid_until') ||
        pickString(asRecord(record.quotation) ?? {}, 'quotation_date', 'created_at', 'date')
      ).slice(0, 10) || '—';
    const currency =
      quotation?.currency_code ||
      pickString(record, 'currency_code', 'currency') ||
      pickString(asRecord(record.quotation) ?? {}, 'currency_code', 'currency') ||
      '—';

    if (lines && lines.length > 0) {
      for (const line of lines) {
        const lineRec = asRecord(line);
        if (!lineRec) continue;
        rows.push({
          quotation_number: quoteNo,
          customer,
          status,
          job_type: jobType,
          date,
          charge:
            pickString(lineRec, 'charge_name', 'charge_code', 'description', 'name', 'code') || '—',
          qty: pickNumber(lineRec, 'qty', 'quantity') ?? '—',
          sale_rate: pickNumber(lineRec, 'sale_rate', 'rate', 'unit_price'),
          amount: pickNumber(lineRec, 'sale_amount', 'amount', 'total', 'line_total'),
          currency: pickString(lineRec, 'currency_code', 'currency') || currency,
        });
      }
      continue;
    }

    // Flat charge-line shaped payload
    if (
      pickString(record, 'charge_code', 'charge_name', 'description') ||
      pickNumber(record, 'sale_rate', 'sale_amount', 'amount') != null
    ) {
      rows.push({
        quotation_number:
          pickString(record, 'quotation_number', 'quote_no', 'quote_number') || quoteNo,
        customer,
        status,
        job_type: jobType,
        date,
        charge:
          pickString(record, 'charge_name', 'charge_code', 'description', 'name', 'code') || '—',
        qty: pickNumber(record, 'qty', 'quantity') ?? '—',
        sale_rate: pickNumber(record, 'sale_rate', 'rate', 'unit_price'),
        amount: pickNumber(record, 'sale_amount', 'amount', 'total', 'line_total'),
        currency,
      });
      continue;
    }

    rows.push({
      quotation_number: quoteNo,
      customer,
      status,
      job_type: jobType,
      date,
      currency,
      total:
        pickNumber(record, 'total_amount', 'grand_total', 'total', 'sale_total') ??
        quotation?.total_amount,
      gp: pickNumber(record, 'gross_profit', 'gp', 'gp_amount'),
    });
  }

  return rows;
}
