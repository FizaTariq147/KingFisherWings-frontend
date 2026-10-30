import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useShipmentDetailTab } from '../hooks/useShipments';
import { useAddShipmentDimensions } from '../hooks/useShipmentDimensions';
import { getErrorMessage } from '../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function dimensionRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['items', 'dimensions', 'lines', 'data', 'results', 'rows']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

function toNum(value: string): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Shipment Dimensions tab — list from GET detail/dimensions +
 * POST /shipments/:id/dimensions to add lines (same pattern as Party / other tabs).
 */
export function ShipmentDimensionsPanel({
  shipmentId,
  tabKey = 'dimensions',
  onChanged,
}: {
  shipmentId: string;
  /** API tab key from GET /shipments/:id/detail (dimensions | dimension). */
  tabKey?: string;
  onChanged?: () => void;
}) {
  const tabQuery = useShipmentDetailTab(shipmentId, tabKey);
  const addDimensions = useAddShipmentDimensions(shipmentId);

  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [pcs, setPcs] = useState('1');
  const [gWeight, setGWeight] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => dimensionRows(tabQuery.data), [tabQuery.data]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void tabQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const canAdd =
    toNum(length) != null ||
    toNum(width) != null ||
    toNum(height) != null ||
    toNum(pcs) != null ||
    toNum(gWeight) != null;

  return (
    <div className="space-y-4 p-3 text-sm">
      {error ? (
        <p className="rounded-sm border border-[var(--color-danger-200,#fecaca)] bg-[var(--color-danger-50,#fef2f2)] px-3 py-2 text-[var(--color-danger-600)]">
          {error}
        </p>
      ) : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Dimension lines
        </p>
        {tabQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading dimensions…</p>
        ) : tabQuery.isError ? (
          <p className="text-[var(--color-danger-600)]">
            {getErrorMessage(tabQuery.error) || 'Failed to load dimensions.'}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No dimension lines.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e8edf2] text-left text-[11px] uppercase text-[#64748b]">
                  <th className="py-1 pr-2">Line</th>
                  <th className="py-1 pr-2">L×W×H</th>
                  <th className="py-1 pr-2">Pcs</th>
                  <th className="py-1 pr-2">G.Wt</th>
                  <th className="py-1">HS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const id = String(row.id ?? row.line_id ?? i);
                  const lineNo = row.line_no ?? i + 1;
                  return (
                    <tr key={id} className="border-b border-[#f1f5f9]">
                      <td className="py-1.5 pr-2">{String(lineNo)}</td>
                      <td className="py-1.5 pr-2">
                        {[row.length, row.width, row.height]
                          .map((v) => (v == null || v === '' ? '—' : String(v)))
                          .join(' × ')}
                      </td>
                      <td className="py-1.5 pr-2">{String(row.no_of_pcs ?? row.pcs ?? '—')}</td>
                      <td className="py-1.5 pr-2">{String(row.g_weight ?? '—')}</td>
                      <td className="py-1.5">{String(row.hs_code ?? '—')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Add dimension
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Input label="Length" value={length} onChange={(e) => setLength(e.target.value)} />
          <Input label="Width" value={width} onChange={(e) => setWidth(e.target.value)} />
          <Input label="Height" value={height} onChange={(e) => setHeight(e.target.value)} />
          <Input label="Pcs" value={pcs} onChange={(e) => setPcs(e.target.value)} />
          <Input label="G. weight" value={gWeight} onChange={(e) => setGWeight(e.target.value)} />
          <Input label="HS code" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="create"
            disabled={addDimensions.isPending || !canAdd}
            onClick={() =>
              void run(async () => {
                await addDimensions.mutateAsync({
                  length: toNum(length),
                  width: toNum(width),
                  height: toNum(height),
                  no_of_pcs: toNum(pcs),
                  g_weight: toNum(gWeight),
                  hs_code: hsCode.trim() || undefined,
                });
                setLength('');
                setWidth('');
                setHeight('');
                setPcs('1');
                setGWeight('');
                setHsCode('');
              }, 'Dimension line added.')
            }
          >
            {addDimensions.isPending ? 'Adding…' : 'Add dimension'}
          </Button>
          <p className="text-[11px] text-[#64748b]">
            Uses POST /shipments/:id/dimensions. API errors are shown above.
          </p>
        </div>
      </section>
    </div>
  );
}
