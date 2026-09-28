import type { ReactNode } from 'react';
import type { WmsStockRow } from '../types/wms.types';

interface WmsStockTableProps {
  rows: WmsStockRow[];
  isLoading?: boolean;
  emptyLabel?: string;
  /** id → display label for warehouses / items / parties */
  warehouseLabels?: Map<string, string>;
  itemLabels?: Map<string, string>;
  partyLabels?: Map<string, string>;
  extraColumns?: Array<{
    key: string;
    label: string;
    render?: (row: WmsStockRow) => ReactNode;
  }>;
}

function warehouseDisplay(
  row: WmsStockRow,
  labels?: Map<string, string>,
): { primary: string; secondary?: string } {
  const code = row.warehouse_code?.trim();
  const name = row.warehouse_name?.trim();
  if (code || name) {
    return {
      primary: [code, name].filter(Boolean).join(' — '),
    };
  }
  if (row.warehouse_id && labels?.has(row.warehouse_id)) {
    return { primary: labels.get(row.warehouse_id)! };
  }
  return { primary: '—' };
}

function itemDisplay(
  row: WmsStockRow,
  labels?: Map<string, string>,
): { primary: string; secondary?: string } {
  const code = row.item_code?.trim();
  const name = row.item_name?.trim();
  if (code || name) {
    return {
      primary: code || name || '—',
      secondary: code && name && code !== name ? name : undefined,
    };
  }
  if (row.item_id && labels?.has(row.item_id)) {
    return { primary: labels.get(row.item_id)! };
  }
  return { primary: '—' };
}

export function WmsStockTable({
  rows,
  isLoading,
  emptyLabel = 'No stock rows found.',
  warehouseLabels,
  itemLabels,
  partyLabels,
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
          {rows.map((row, idx) => {
            const item = itemDisplay(row, itemLabels);
            const warehouse = warehouseDisplay(row, warehouseLabels);
            return (
              <tr
                key={row.id ?? `${row.item_id}-${row.warehouse_id}-${idx}`}
                className="border-b border-[var(--color-neutral-100)]"
              >
                <td className="px-3 py-2.5 text-sm font-normal">
                  <div>{item.primary}</div>
                  {item.secondary ? (
                    <div className="text-xs text-[var(--color-neutral-500)]">{item.secondary}</div>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-sm font-normal text-[var(--color-neutral-800)]">
                  {warehouse.primary}
                </td>
                <td className="px-3 py-2.5 text-sm font-normal">
                  {row.quantity != null ? row.quantity : '—'}
                </td>
                <td className="px-3 py-2.5 text-sm font-normal">{row.uom_code ?? '—'}</td>
                {extraColumns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 text-sm font-normal">
                    {col.render
                      ? col.render(row)
                      : col.key === 'party_id' || col.key === 'party'
                        ? partyLabels && row.party_id && partyLabels.has(row.party_id)
                          ? partyLabels.get(row.party_id)
                          : row.party_name || (row.party_id ? '—' : '—')
                        : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
