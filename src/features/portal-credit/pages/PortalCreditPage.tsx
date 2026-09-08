import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, BadgeCheck, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import {
  useDownloadPortalStatementPdf,
  usePortalCreditAging,
  usePortalCreditStatement,
  usePortalCreditSummary,
} from '../hooks/usePortalCredit';

function formatMoney(amount?: number, currency?: string): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
}

export default function PortalCreditPage() {
  const navigate = useNavigate();
  const [asOf, setAsOf] = useState('');
  const asOfParam = asOf || undefined;
  const summary = usePortalCreditSummary();
  const aging = usePortalCreditAging(asOfParam);
  const statement = usePortalCreditStatement(asOfParam);
  const downloadPdf = useDownloadPortalStatementPdf();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const currency = statement.data?.currencyCode || summary.data?.currencyCode;
  const lines = statement.data?.lines ?? [];

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Credit"
        description="Credit limit, aging, and account statement."
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="As of"
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={downloadPdf.isPending}
              onClick={() => {
                setPdfError(null);
                void downloadPdf.mutateAsync(asOfParam).catch((err) => {
                  setPdfError(
                    err instanceof PortalApiError || err instanceof Error
                      ? err.message
                      : 'Could not download statement PDF.',
                  );
                });
              }}
            >
              <Download size={14} /> {downloadPdf.isPending ? 'Preparing PDF…' : 'Statement PDF'}
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/portal/credit-requests')}>
              Limit requests
            </Button>
          </div>
        }
      />
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}

      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Credit limit"
            value={
              summary.isLoading
                ? '…'
                : formatMoney(summary.data?.creditLimit, summary.data?.currencyCode)
            }
            Icon={Wallet}
            theme="navy"
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Used"
            value={
              summary.isLoading
                ? '…'
                : formatMoney(summary.data?.used, summary.data?.currencyCode)
            }
            Icon={TrendingUp}
            theme="orange"
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Available"
            value={
              summary.isLoading
                ? '…'
                : formatMoney(summary.data?.available, summary.data?.currencyCode)
            }
            Icon={BadgeCheck}
            theme="green"
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Status"
            value={summary.data?.creditStatus || (summary.isLoading ? '…' : '—')}
            Icon={BadgeCheck}
            theme="purple"
          />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>

      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Aging</h2>
        {aging.isLoading ? (
          <PortalLoadingState label="Loading aging…" className="py-6" />
        ) : aging.isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">
            {aging.error instanceof PortalApiError || aging.error instanceof Error
              ? aging.error.message
              : 'Failed to load aging.'}
          </p>
        ) : !aging.data?.buckets.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No aging buckets.</p>
        ) : (
          <PortalAnimatedGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {aging.data.buckets.map((b) => (
              <PortalAnimatedGridItem key={b.label}>
                <div className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                    {b.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold tabular-nums">
                    {formatMoney(b.amount, currency)}
                  </div>
                </div>
              </PortalAnimatedGridItem>
            ))}
          </PortalAnimatedGrid>
        )}
      </PortalPanel>

      <PortalPanel>
        <div className="border-b border-[var(--color-neutral-100)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Statement</h2>
        </div>
        {statement.isLoading ? (
          <PortalLoadingState label="Loading statement…" />
        ) : statement.isError ? (
          <p className="p-6 text-sm text-[var(--color-danger-600)]">
            {statement.error instanceof PortalApiError || statement.error instanceof Error
              ? statement.error.message
              : 'Failed to load statement.'}
          </p>
        ) : !lines.length ? (
          <PortalEmptyState
            title="No statement lines"
            description="Invoices and payments appear here once posted for your account."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="flex flex-wrap gap-4 border-b border-[var(--color-neutral-100)] px-4 py-3 text-sm text-[var(--color-neutral-600)]">
              {statement.data?.asOf || asOf ? (
                <span>As of {statement.data?.asOf || asOf}</span>
              ) : null}
              {statement.data?.invoiceCount != null ? (
                <span>{statement.data.invoiceCount} invoice(s)</span>
              ) : null}
              {statement.data?.openingBalance != null ? (
                <span>Opening {formatMoney(statement.data.openingBalance, currency)}</span>
              ) : null}
              {statement.data?.closingBalance != null ? (
                <span className="font-semibold text-[var(--color-neutral-800)]">
                  Open balance {formatMoney(statement.data.closingBalance, currency)}
                </span>
              ) : null}
              {statement.data?.composedFromLedgers ? (
                <span className="text-[var(--color-neutral-400)]">
                  Built from invoices & payments
                </span>
              ) : null}
            </div>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-neutral-50)] text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Type</th>
                  <th className="px-4 py-2.5 font-semibold">Reference</th>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Debit</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Credit</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {lines.map((line) => (
                  <tr key={line.id} className="text-[var(--color-neutral-800)]">
                    <td className="whitespace-nowrap px-4 py-2.5">{line.date || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {line.type?.replaceAll('_', ' ') || '—'}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{line.reference || '—'}</td>
                    <td className="max-w-[240px] truncate px-4 py-2.5 text-[var(--color-neutral-600)]">
                      {line.description || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                      {line.debit != null ? formatMoney(line.debit) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                      {line.credit != null ? formatMoney(line.credit) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums">
                      {line.balance != null ? formatMoney(line.balance) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalPanel>
    </div>
  );
}
