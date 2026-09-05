import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, BadgeCheck, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
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

export default function PortalCreditPage() {
  const navigate = useNavigate();
  const [asOf, setAsOf] = useState('');
  const asOfParam = asOf || undefined;
  const summary = usePortalCreditSummary();
  const aging = usePortalCreditAging(asOfParam);
  const statement = usePortalCreditStatement(asOfParam);
  const downloadPdf = useDownloadPortalStatementPdf();
  const [pdfError, setPdfError] = useState<string | null>(null);

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
            value={summary.data?.creditLimit ?? (summary.isLoading ? '…' : '—')}
            Icon={Wallet}
            theme="navy"
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Used"
            value={summary.data?.used ?? (summary.isLoading ? '…' : '—')}
            Icon={TrendingUp}
            theme="orange"
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Available"
            value={summary.data?.available ?? (summary.isLoading ? '…' : '—')}
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
                  <div className="mt-1 text-lg font-semibold tabular-nums">{b.amount}</div>
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
        ) : !statement.data?.lines.length ? (
          <PortalEmptyState title="No statement lines" description="No AR movements for this period." />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {statement.data.lines.map((line) => (
              <PortalAnimatedListItem
                key={line.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
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
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}
