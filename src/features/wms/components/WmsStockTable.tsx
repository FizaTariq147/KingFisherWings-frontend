import type { WmsStockRow } from '../types/wms.types';

interface WmsStockTableProps {
  rows: WmsStockRow[];
  isLoading?: boolean;
  emptyLabel?: string;
  extraColumns?: Array<{ key: string; label: string; render?: (row: WmsStockRow) => string }>;
}

export function WmsStockTable({
  rows,
  isLoading,
  emptyLabel = 'No stock rows found.',
  extraColumns = [],
}: WmsStockTableProps) {
  if (isLoading) {
    return <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (!rows.length) {
    return <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">{emptyLabel}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-neutral-200)] text-left text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
            <th className="px-3 py-2 font-medium">Item</th>
            <th className="px-3 py-2 font-medium">Warehouse</th>
            <th className="px-3 py-2 font-medium">Qty</th>
            <th className="px-3 py-2 font-medium">UOM</th>
            {extraColumns.map((col) => (
              <th key={col.key} className="px-3 py-2 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id ?? `${row.item_id}-${row.warehouse_id}-${idx}`}
              className="border-b border-[var(--color-neutral-100)]"
            >
              <td className="px-3 py-2.5">
                <div className="font-medium text-[var(--color-neutral-800)]">
                  {row.item_code || row.item_id?.slice(0, 8) || '—'}
                </div>
                {row.item_name ? (
                  <div className="text-xs text-[var(--color-neutral-500)]">{row.item_name}</div>
                ) : null}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-neutral-600)]">
                {row.warehouse_name || row.warehouse_id?.slice(0, 8) || '—'}
              </td>
              <td className="px-3 py-2.5 font-medium">{row.quantity ?? '—'}</td>
              <td className="px-3 py-2.5 text-[var(--color-neutral-500)]">{row.uom_code ?? '—'}</td>
              {extraColumns.map((col) => (
                <td key={col.key} className="px-3 py-2.5 text-[var(--color-neutral-600)]">
                  {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
