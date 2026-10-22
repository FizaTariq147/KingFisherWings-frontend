import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAddShipmentExchangeRate } from '../hooks/useShipmentTabMutations';
import { useShipmentDetailTab } from '../hooks/useShipments';
import { getErrorMessage } from '../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function rateRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['items', 'rates', 'exchange_rates', 'data', 'results']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

/**
 * Ex Rate tab — list from detail/ex_rate + POST /shipments/:id/exchange-rates.
 */
export function ShipmentExchangeRatesPanel({
  shipmentId,
  tabKey = 'ex_rate',
  defaultCurrency = 'USD',
  onChanged,
}: {
  shipmentId: string;
  tabKey?: string;
  defaultCurrency?: string;
  onChanged?: () => void;
}) {
  const tabQuery = useShipmentDetailTab(shipmentId, tabKey);
  const addRate = useAddShipmentExchangeRate(shipmentId);

  const [currencyCode, setCurrencyCode] = useState(defaultCurrency || 'USD');
  const [rate, setRate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [applyToCharges, setApplyToCharges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => rateRows(tabQuery.data), [tabQuery.data]);

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

  return (
    <div className="space-y-4 p-3 text-sm">
      {error ? (
        <p className="rounded-sm border border-[var(--color-danger-200,#fecaca)] bg-[var(--color-danger-50,#fef2f2)] px-3 py-2 text-[var(--color-danger-600)]">
          {error}
        </p>
      ) : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <section className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Exchange rates
        </p>
        {tabQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading exchange rates…</p>
        ) : tabQuery.isError ? (
          <p className="text-[var(--color-danger-600)]">
            {getErrorMessage(tabQuery.error) || 'Failed to load exchange rates.'}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No exchange rates yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row, i) => {
              const id = String(row.id ?? row.rate_id ?? i);
              const code = String(row.currency_code ?? row.currency ?? '—');
              const value = String(row.exchange_rate ?? row.rate ?? '—');
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] bg-white px-2.5 py-2"
                >
                  <span className="font-medium text-[#0f172a]">
                    {code} · {value}
                  </span>
                  {row.effective_date ? (
                    <span className="text-[12px] text-[#64748b]">
                      {String(row.effective_date)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Add exchange rate
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input
            label="Currency code"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
          />
          <Input label="Exchange rate" value={rate} onChange={(e) => setRate(e.target.value)} />
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">
              Effective date
            </span>
            <input
              type="date"
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </label>
        </div>
        <label className="inline-flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={applyToCharges}
            onChange={(e) => setApplyToCharges(e.target.checked)}
          />
          Apply to charges
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="create"
            disabled={
              addRate.isPending ||
              !currencyCode.trim() ||
              !rate.trim() ||
              Number.isNaN(Number(rate))
            }
            onClick={() =>
              void run(async () => {
                await addRate.mutateAsync({
                  currency_code: currencyCode.trim(),
                  exchange_rate: Number(rate),
                  ...(effectiveDate.trim() ? { effective_date: effectiveDate.trim() } : {}),
                  apply_to_charges: applyToCharges,
                });
                setRate('');
              }, 'Exchange rate saved.')
            }
          >
            {addRate.isPending ? 'Saving…' : 'Add rate'}
          </Button>
          <p className="text-[11px] text-[#64748b]">
            POST /shipments/:id/exchange-rates — API errors shown above.
          </p>
        </div>
      </section>
    </div>
  );
}
