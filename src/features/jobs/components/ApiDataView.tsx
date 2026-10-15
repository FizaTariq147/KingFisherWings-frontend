import { erpTable } from '@/lib/erpTypography';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function formatCell(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toLocaleString() : '—';
  }
  if (typeof value === 'string') return value.trim() || '—';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (value.every((v) => v == null || ['string', 'number', 'boolean'].includes(typeof v))) {
      return value.map((v) => formatCell(v)).join(', ');
    }
    return `${value.length} item${value.length === 1 ? '' : 's'}`;
  }
  const rec = asRecord(value);
  if (!rec) return String(value);
  const label =
    rec.name ??
    rec.label ??
    rec.code ??
    rec.description ??
    rec.shipment_number ??
    rec.job_number ??
    rec.id;
  if (label != null && String(label).trim()) return String(label).trim();
  return Object.keys(rec).length ? `${Object.keys(rec).length} fields` : '—';
}

function humanLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['items', 'data', 'results', 'rows', 'lines', 'charges', 'history']) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  return [];
}

const SKIP_KEYS = new Set(['__typename', 'tenant_id', 'company_id']);

function preferredColumns(rows: Record<string, unknown>[]): string[] {
  const preferred = [
    'line_no',
    'charge',
    'charge_code',
    'description',
    'container_number',
    'event',
    'action',
    'status',
    'party_name',
    'vendor',
    'bill_to',
    'quantity',
    'qty',
    'unit_price',
    'amount',
    'sale_amount',
    'cost_amount',
    'currency_code',
    'currency',
    'ex_rate',
    'free_days_allowed',
    'free_days_used',
    'damage_description',
    'delivery_date',
    'packages_delivered',
    'actual_delivery_date',
    'examination_date',
    'examination_result',
    'examining_officer',
    'remarks',
    'created_at',
    'updated_at',
  ];
  const present = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!SKIP_KEYS.has(key) && typeof row[key] !== 'object') present.add(key);
    }
  }
  const cols = preferred.filter((k) => present.has(k));
  if (cols.length > 0) return cols.slice(0, 8);
  return [...present].filter((k) => k !== 'id').slice(0, 8);
}

interface ApiDataViewProps {
  data: unknown;
  emptyLabel?: string;
  className?: string;
  maxHeightClass?: string;
}

/**
 * Renders API payloads as ERP tables / key-value grids — never raw JSON.
 */
export function ApiDataView({
  data,
  emptyLabel = 'No data.',
  className = '',
  maxHeightClass = 'max-h-64',
}: ApiDataViewProps) {
  if (data == null) {
    return <p className="text-sm text-[var(--color-neutral-400)]">{emptyLabel}</p>;
  }

  const list = unwrapList(data);
  if (list.length > 0) {
    const rows = list
      .map((item) => asRecord(item))
      .filter((r): r is Record<string, unknown> => Boolean(r));
    if (rows.length === 0) {
      return (
        <p className="text-sm text-[var(--color-neutral-400)]">
          {list.length} record{list.length === 1 ? '' : 's'}
        </p>
      );
    }
    const columns = preferredColumns(rows);
    return (
      <div
        className={`overflow-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)] ${maxHeightClass} ${className}`}
      >
        <table className="w-full min-w-[480px] text-left text-[13px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className={erpTable.th}>
                  {humanLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={String(row.id ?? idx)} className={erpTable.row}>
                {columns.map((col) => (
                  <td key={col} className={erpTable.td}>
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const rec = asRecord(data);
  if (!rec) {
    return <p className="text-sm text-[#334155]">{formatCell(data)}</p>;
  }

  const entries = Object.entries(rec).filter(
    ([key, value]) => !SKIP_KEYS.has(key) && value != null && value !== '',
  );
  if (entries.length === 0) {
    return <p className="text-sm text-[var(--color-neutral-400)]">{emptyLabel}</p>;
  }

  // Nested lists under object keys (e.g. { charges: [...] })
  const nestedLists = entries.filter(([, v]) => Array.isArray(v) && (v as unknown[]).length > 0);
  const scalars = entries.filter(([, v]) => !Array.isArray(v) || (v as unknown[]).length === 0);

  return (
    <div className={`space-y-3 ${className}`}>
      {scalars.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {scalars.map(([key, value]) => (
            <div
              key={key}
              className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
                {humanLabel(key)}
              </p>
              <p className="mt-0.5 text-[13px] text-[#334155]">{formatCell(value)}</p>
            </div>
          ))}
        </div>
      ) : null}
      {nestedLists.map(([key, value]) => (
        <div key={key} className="space-y-1">
          <p className="text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
            {humanLabel(key)}
          </p>
          <ApiDataView data={value} emptyLabel={`No ${humanLabel(key).toLowerCase()}.`} />
        </div>
      ))}
    </div>
  );
}
