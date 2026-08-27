import { useMemo } from 'react';
import { useWmsItemOptions, useWmsWarehouseOptions } from './WmsFormHelpers';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pick(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function pickNum(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key];
    if (v == null || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return String(n);
  }
  return '—';
}

export interface WmsDocLineRow {
  key: string;
  itemId: string;
  itemLabel: string;
  quantity: string;
  cbm: string;
  unitCost: string;
  batchCode: string;
  remarks: string;
}

export function normalizeDocLines(lines: unknown[] | undefined): Array<Record<string, unknown>> {
  if (!Array.isArray(lines)) return [];
  return lines.map((line) => asRecord(line) ?? {}).filter((r) => Object.keys(r).length > 0);
}

interface WmsDocumentLinesTableProps {
  lines: unknown[] | undefined;
  variant?: 'asn' | 'grn' | 'gdo';
}

export function WmsDocumentLinesTable({ lines, variant = 'asn' }: WmsDocumentLinesTableProps) {
  const { options: itemOptions } = useWmsItemOptions();
  const itemLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of itemOptions) {
      if (opt.value) map.set(opt.value, opt.label);
    }
    return map;
  }, [itemOptions]);

  const rows = useMemo(() => {
    return normalizeDocLines(lines).map((r, idx) => {
      const itemId = pick(r, 'item_id', 'itemId', 'wms_item_id');
      const nestedItem = asRecord(r.item) ?? asRecord(r.wms_item);
      const nestedLabel = nestedItem
        ? [pick(nestedItem, 'code'), pick(nestedItem, 'name')].filter(Boolean).join(' — ')
        : '';
      const itemLabel =
        nestedLabel ||
        pick(r, 'item_code', 'itemCode', 'item_name', 'itemName', 'sku', 'code') ||
        itemLabelById.get(itemId) ||
        (itemId ? `${itemId.slice(0, 8)}…` : '—');

      return {
        key: pick(r, 'id') || `${itemId}-${idx}`,
        itemLabel,
        quantity: pickNum(r, 'quantity', 'qty', 'expected_qty', 'received_qty'),
        cbm: pickNum(r, 'cbm', 'volume_cbm'),
        unitCost: pickNum(r, 'unit_cost', 'unitCost', 'cost'),
        batchCode: pick(r, 'batch_code', 'batchCode', 'lot_code') || '—',
        remarks: pick(r, 'remarks', 'note', 'notes') || '—',
      };
    });
  }, [lines, itemLabelById]);

  if (!rows.length) {
    return <p className="text-sm text-[var(--color-neutral-400)]">No lines on this document.</p>;
  }

  const showCbm = variant === 'asn' || variant === 'grn';
  const showCost = variant === 'grn';
  const showBatch = variant === 'grn';

  return (
    <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-left text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Item</th>
            <th className="px-3 py-2 font-medium">Qty</th>
            {showCbm ? <th className="px-3 py-2 font-medium">CBM</th> : null}
            {showCost ? <th className="px-3 py-2 font-medium">Unit cost</th> : null}
            {showBatch ? <th className="px-3 py-2 font-medium">Batch</th> : null}
            <th className="px-3 py-2 font-medium">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.key} className="border-b border-[var(--color-neutral-100)] last:border-0">
              <td className="px-3 py-2.5 text-[var(--color-neutral-500)]">{idx + 1}</td>
              <td className="px-3 py-2.5 font-medium text-[var(--color-neutral-800)]">{row.itemLabel}</td>
              <td className="px-3 py-2.5">{row.quantity}</td>
              {showCbm ? <td className="px-3 py-2.5">{row.cbm}</td> : null}
              {showCost ? <td className="px-3 py-2.5">{row.unitCost}</td> : null}
              {showBatch ? <td className="px-3 py-2.5">{row.batchCode}</td> : null}
              <td className="px-3 py-2.5 text-[var(--color-neutral-600)]">{row.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WmsDetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-[var(--color-neutral-100)] py-2 last:border-0">
      <span className="w-36 shrink-0 text-[var(--color-neutral-500)]">{label}</span>
      <span className="break-all text-[var(--color-neutral-800)]">{value || '—'}</span>
    </div>
  );
}

export function useWmsWarehouseLabel(warehouseId?: string): string {
  const { options } = useWmsWarehouseOptions();
  return useMemo(() => {
    if (!warehouseId) return '—';
    return options.find((o) => o.value === warehouseId)?.label || warehouseId;
  }, [options, warehouseId]);
}

export function statusBadgeClass(status?: string): string {
  const s = (status ?? '').toLowerCase();
  if (s.includes('confirm') || s.includes('post') || s.includes('complete')) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (s.includes('cancel') || s.includes('reject')) {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-slate-100 text-slate-700';
}
