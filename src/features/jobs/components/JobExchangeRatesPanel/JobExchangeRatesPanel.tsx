import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useJobDetailTab } from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function rateRows(tabData: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!tabData) return [];
  for (const key of ['items', 'rates', 'exchange_rates', 'data']) {
    if (Array.isArray(tabData[key])) {
      return (tabData[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  if (Array.isArray(tabData as unknown)) return [];
  return [];
}

/** Ex Rate tab — POST /exchange-rates · DELETE /exchange-rates/:rateId */
export function JobExchangeRatesPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const resources = useJobTabResourceMutations(job.id);
  const tabQuery = useJobDetailTab(job.id, 'ex_rate');
  const [currencyCode, setCurrencyCode] = useState(job.currency_code || 'USD');
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

  const pending =
    resources.upsertExchangeRate.isPending || resources.deleteExchangeRate.isPending;

  return (
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      {tabQuery.isLoading ? (
        <p className="text-[13px] text-[#64748b]">Loading exchange rates…</p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-[#64748b]">No rate rows in detail/ex_rate yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, i) => {
            const id = String(row.id ?? row.rate_id ?? '').trim();
            const code = String(row.currency_code ?? row.currency ?? '—');
            const value = String(row.exchange_rate ?? row.rate ?? '—');
            return (
              <li
                key={id || i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] px-2.5 py-2"
              >
                <span className="font-medium">
                  {code} · {value}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={pending || !id || !isUuid(id)}
                  onClick={() =>
                    void run(
                      () => resources.deleteExchangeRate.mutateAsync(id),
                      'Rate deleted.',
                    )
                  }
                >
                  Delete
                </Button>
              </li>
            );
          })}
        </ul>
      )}

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
      <Button
        type="button"
        size="sm"
        variant="create"
        disabled={pending || !currencyCode.trim() || !rate.trim() || Number.isNaN(Number(rate))}
        onClick={() =>
          void run(
            () =>
              resources.upsertExchangeRate.mutateAsync({
                currency_code: currencyCode.trim(),
                exchange_rate: Number(rate),
                ...(effectiveDate.trim() ? { effective_date: effectiveDate.trim() } : {}),
                apply_to_charges: applyToCharges,
              }),
            'Exchange rate saved.',
          )
        }
      >
        Upsert rate
      </Button>
    </div>
  );
}
