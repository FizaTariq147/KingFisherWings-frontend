import { asRecord } from './crmUnwrap';

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Flatten CRM report payloads (arrays, keyed maps, nested data) into table rows. */
export function normalizeCrmReportRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw
      .map((row) => asRecord(row))
      .filter((row): row is Record<string, unknown> => Boolean(row));
  }

  const root = asRecord(raw);
  if (!root) return [];

  for (const key of [
    'rows',
    'items',
    'results',
    'data',
    'series',
    'breakdown',
    'by_status',
    'by_service_type',
    'by_month',
    'by_salesperson',
    'by_customer',
    'by_trade_lane',
    'pipeline',
    'leads',
    'enquiries',
    'calls',
    'follow_ups',
    'budgets',
  ]) {
    const value = root[key];
    if (Array.isArray(value)) {
      return value
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => Boolean(row));
    }
    // Map/object breakdown → rows with a label column
    const asObj = asRecord(value);
    if (asObj && !Array.isArray(value)) {
      const entries = Object.entries(asObj);
      if (
        entries.length > 0 &&
        entries.every(([, v]) => typeof v === 'number' || typeof v === 'string' || v == null)
      ) {
        return entries.map(([label, valueCell]) => ({
          label,
          value: valueCell ?? 0,
        }));
      }
    }
  }

  const nested = asRecord(root.data);
  if (nested && nested !== root) return normalizeCrmReportRows(nested);

  // Single summary object — show as one-row key/value only if it has scalar fields
  const scalars = Object.entries(root).filter(
    ([k, v]) => k !== 'raw' && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'),
  );
  if (scalars.length > 0) {
    return [Object.fromEntries(scalars)];
  }

  return [];
}

export function crmReportColumns(rows: Record<string, unknown>[]): string[] {
  const preferred = [
    'label',
    'name',
    'salesperson',
    'salesperson_name',
    'customer',
    'customer_name',
    'company_name',
    'service_type',
    'trade_lane',
    'status',
    'period',
    'count',
    'quantity',
    'volume',
    'amount',
    'revenue',
    'target',
    'actual',
    'budget',
    'variance',
    'conversion_rate',
    'won',
    'lost',
    'value',
  ];
  const seen = new Set<string>();
  const cols: string[] = [];
  for (const key of preferred) {
    if (rows.some((row) => row[key] !== undefined && row[key] !== null && row[key] !== '')) {
      cols.push(key);
      seen.add(key);
    }
  }
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      if (key === 'raw' || key.startsWith('_')) continue;
      const value = row[key];
      if (value !== null && typeof value === 'object') continue;
      cols.push(key);
      seen.add(key);
    }
  }
  return cols;
}

export function formatCrmReportCell(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
  return String(value);
}

export function crmReportSummaryMetrics(
  raw: unknown,
): Array<{ label: string; value: string | number }> {
  const root = asRecord(raw) ?? asRecord(asRecord(raw)?.data) ?? {};
  const metrics: Array<{ label: string; value: string | number }> = [];
  for (const [key, value] of Object.entries(root)) {
    if (Array.isArray(value) || (value && typeof value === 'object')) continue;
    if (typeof value === 'number' || typeof value === 'string') {
      metrics.push({ label: key, value });
    }
  }
  return metrics.slice(0, 8);
}

export function filterCrmReportRows(
  rows: Record<string, unknown>[],
  search: string,
): Record<string, unknown>[] {
  const term = search.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(term),
    ),
  );
}

export { pickNumber, pickString };
