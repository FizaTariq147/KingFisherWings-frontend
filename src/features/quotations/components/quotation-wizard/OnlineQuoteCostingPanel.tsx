import type { Tariff } from '@/features/tariffs/types/tariff.types';
import { tariffChargeLabel } from '../../utils/matchOnlineQuoteTariffs';

type OnlineQuoteCostingPanelProps = {
  currencyCode: string;
  currencyError?: string;
  onCurrencyChange: (value: string) => void;
  matchedTariffs: Tariff[];
  loading?: boolean;
  error?: string | null;
  laneReady: boolean;
};

/**
 * Online Quote Costing — shows charge lines from Online Tariff Master (API), not hardcoded rates.
 */
export function OnlineQuoteCostingPanel({
  currencyCode,
  currencyError,
  onCurrencyChange,
  matchedTariffs,
  loading,
  error,
  laneReady,
}: OnlineQuoteCostingPanelProps) {
  const draftTotal = matchedTariffs.reduce((sum, t) => sum + (Number(t.sale_rate) || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Costing</h3>
        <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
          Charge lines below come from{' '}
          <span className="font-medium">Online Tariff Master</span> (
          <span className="font-mono">GET /quotations/tariffs</span>
          ), matched to this job type and lane. After submit, the server applies the best tariff via{' '}
          <span className="font-mono">POST /quotations/:id/apply-tariff</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="online_quote_currency"
            className="text-xs font-medium text-[var(--color-neutral-500)]"
          >
            Currency *
          </label>
          <input
            id="online_quote_currency"
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm uppercase focus:outline-none focus:border-[var(--color-primary-500)]"
            value={currencyCode}
            maxLength={3}
            onChange={(e) => onCurrencyChange(e.target.value.toUpperCase())}
          />
          {currencyError ? (
            <p className="text-xs text-[var(--color-danger-500)]">{currencyError}</p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
      ) : null}

      {!laneReady ? (
        <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-4 text-sm text-[var(--color-neutral-500)]">
          Complete job type and ports in earlier steps to match tariff charge lines.
        </p>
      ) : loading ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading tariff charge lines…</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--color-neutral-50)] text-left text-xs text-[var(--color-neutral-500)]">
              <tr>
                <th className="px-3 py-2">Charge</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Sale rate</th>
                <th className="px-3 py-2">Currency</th>
              </tr>
            </thead>
            <tbody>
              {matchedTariffs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-[var(--color-neutral-400)]"
                  >
                    No matching Online Tariff Master rates for this lane. Add rates under Quotations
                    → Online Tariff Master, or continue — apply-tariff will run after create if a
                    match exists on the server.
                  </td>
                </tr>
              ) : (
                matchedTariffs.map((t) => (
                  <tr key={t.id} className="border-t border-[var(--color-neutral-100)]">
                    <td className="px-3 py-2">
                      <div className="font-medium text-[var(--color-neutral-800)]">
                        {tariffChargeLabel(t)}
                      </div>
                      <div className="font-mono text-xs text-[var(--color-neutral-400)]">
                        {[t.origin_port_code, t.dest_port_code].filter(Boolean).join(' → ') ||
                          t.service_type}
                      </div>
                    </td>
                    <td className="px-3 py-2">{t.unit || '—'}</td>
                    <td className="px-3 py-2 font-mono">
                      {Number(t.sale_rate).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </td>
                    <td className="px-3 py-2 font-mono">{t.currency_code}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {matchedTariffs.length > 0 ? (
        <p className="text-right text-sm font-medium text-[var(--color-neutral-800)]">
          Matched sale total:{' '}
          <span className="font-mono">
            {currencyCode || matchedTariffs[0]?.currency_code || 'AED'}{' '}
            {draftTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      ) : null}
    </div>
  );
}
