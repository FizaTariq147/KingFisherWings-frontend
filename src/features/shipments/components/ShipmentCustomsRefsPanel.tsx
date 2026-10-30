import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAddShipmentCustomsRef } from '../hooks/useShipmentTabMutations';
import { useShipmentDetailTab } from '../hooks/useShipments';
import { getErrorMessage } from '../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function refRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['items', 'refs', 'customs_refs', 'data', 'results']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

/**
 * Shipping Bill / BOE (customs) tab —
 * list from detail tab + POST /shipments/:id/customs-refs.
 */
export function ShipmentCustomsRefsPanel({
  shipmentId,
  tabKey = 'shipping_bill_boe',
  onChanged,
}: {
  shipmentId: string;
  tabKey?: string;
  onChanged?: () => void;
}) {
  const tabQuery = useShipmentDetailTab(shipmentId, tabKey);
  const addRef = useAddShipmentCustomsRef(shipmentId);

  const [sbNumber, setSbNumber] = useState('');
  const [boeNumber, setBoeNumber] = useState('');
  const [customsHouse, setCustomsHouse] = useState('');
  const [customsStatus, setCustomsStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => refRows(tabQuery.data), [tabQuery.data]);

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

  const dto = () => ({
    sb_number: sbNumber.trim() || undefined,
    boe_number: boeNumber.trim() || undefined,
    customs_house: customsHouse.trim() || undefined,
    customs_status: customsStatus.trim() || undefined,
    remarks: remarks.trim() || undefined,
  });

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
          Shipping bill / BOE
        </p>
        {tabQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading customs refs…</p>
        ) : tabQuery.isError ? (
          <p className="text-[var(--color-danger-600)]">
            {getErrorMessage(tabQuery.error) || 'Failed to load customs refs.'}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No shipping bill / BOE refs yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row, i) => {
              const id = String(row.id ?? row.ref_id ?? i);
              const sb = String(row.sb_number ?? row.shipping_bill_number ?? '—');
              const boe = String(row.boe_number ?? '—');
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] bg-white px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#0f172a]">
                      SB {sb} · BOE {boe}
                    </p>
                    {row.customs_house || row.customs_status ? (
                      <p className="truncate text-[12px] text-[#64748b]">
                        {[row.customs_house, row.customs_status]
                          .filter(Boolean)
                          .map(String)
                          .join(' · ')}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Add shipping bill / BOE
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input label="SB number" value={sbNumber} onChange={(e) => setSbNumber(e.target.value)} />
          <Input
            label="BOE number"
            value={boeNumber}
            onChange={(e) => setBoeNumber(e.target.value)}
          />
          <Input
            label="Customs house"
            value={customsHouse}
            onChange={(e) => setCustomsHouse(e.target.value)}
          />
          <Input
            label="Customs status"
            value={customsStatus}
            onChange={(e) => setCustomsStatus(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="create"
            disabled={addRef.isPending || (!sbNumber.trim() && !boeNumber.trim())}
            onClick={() =>
              void run(async () => {
                await addRef.mutateAsync(dto());
                setSbNumber('');
                setBoeNumber('');
                setCustomsHouse('');
                setCustomsStatus('');
                setRemarks('');
              }, 'Customs ref added.')
            }
          >
            {addRef.isPending ? 'Adding…' : 'Add ref'}
          </Button>
          <p className="text-[11px] text-[#64748b]">
            POST /shipments/:id/customs-refs — API errors shown above.
          </p>
        </div>
      </section>
    </div>
  );
}
