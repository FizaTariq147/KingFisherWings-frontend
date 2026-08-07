import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalEmptyState,
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

export default function PortalCreditPage() {
  const navigate = useNavigate();
  const [asOf, setAsOf] = useState('');
  const asOfParam = asOf || undefined;
  const summary = usePortalCreditSummary();
  const aging = usePortalCreditAging(asOfParam);
  const statement = usePortalCreditStatement(asOfParam);
  const downloadPdf = useDownloadPortalStatementPdf();

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
              onClick={() => void downloadPdf.mutateAsync(asOfParam)}
            >
              <Download size={14} /> Statement PDF
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/portal/credit-requests')}>
              Limit requests
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard
          label="Credit limit"
          value={summary.data?.creditLimit ?? (summary.isLoading ? '…' : '—')}
          Icon={Wallet}
        />
        <PortalStatCard
          label="Used"
          value={summary.data?.used ?? (summary.isLoading ? '…' : '—')}
        />
        <PortalStatCard
          label="Available"
          value={summary.data?.available ?? (summary.isLoading ? '…' : '—')}
          tone="accent"
        />
        <PortalStatCard
          label="Status"
          value={summary.data?.creditStatus || (summary.isLoading ? '…' : '—')}
        />
      </div>

      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Aging</h2>
        {aging.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading aging…</p>
        ) : aging.isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">
            {aging.error instanceof PortalApiError || aging.error instanceof Error
              ? aging.error.message
              : 'Failed to load aging.'}
          </p>
        ) : !aging.data?.buckets.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No aging buckets.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {aging.data.buckets.map((b) => (
              <div
                key={b.label}
                className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-3"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                  {b.label}
                </div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{b.amount}</div>
              </div>
            ))}
          </div>
        )}
      </PortalPanel>

      <PortalPanel>
        <div className="border-b border-[var(--color-neutral-100)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Statement</h2>
        </div>
        {statement.isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading statement…</p>
        ) : statement.isError ? (
          <p className="p-6 text-sm text-[var(--color-danger-600)]">
            {statement.error instanceof PortalApiError || statement.error instanceof Error
              ? statement.error.message
              : 'Failed to load statement.'}
          </p>
        ) : !statement.data?.lines.length ? (
          <PortalEmptyState title="No statement lines" description="No AR movements for this period." />
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {statement.data.lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {line.reference || line.description || 'Entry'}
                  </div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[line.date, line.type].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  {line.debit != null ? <div>Dr {line.debit}</div> : null}
                  {line.credit != null ? <div>Cr {line.credit}</div> : null}
                  {line.balance != null ? (
                    <div className="text-xs text-[var(--color-neutral-500)]">Bal {line.balance}</div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
    </div>
  );
}
