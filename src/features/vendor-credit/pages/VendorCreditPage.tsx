import { useState } from 'react';
import { Download, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import {
  useDownloadVendorStatementPdf,
  useVendorCreditAging,
  useVendorCreditStatement,
} from '../hooks/useVendorCredit';

export default function VendorCreditPage() {
  const [asOf, setAsOf] = useState('');
  const asOfParam = asOf || undefined;
  const aging = useVendorCreditAging(asOfParam);
  const statement = useVendorCreditStatement(asOfParam);
  const downloadPdf = useDownloadVendorStatementPdf();
  const [pdfError, setPdfError] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Statement"
        description="Aging buckets and account statement for your vendor ledger."
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <Input label="As of" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={downloadPdf.isPending}
              onClick={() => {
                setPdfError(null);
                void downloadPdf.mutateAsync(asOfParam).catch((err) => {
                  setPdfError(vendorErrorMessage(err, 'Could not download statement PDF.'));
                });
              }}
            >
              <Download size={14} /> {downloadPdf.isPending ? 'Downloading…' : 'Statement PDF'}
            </Button>
          </div>
        }
      />
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}

      {aging.isLoading ? (
        <PortalLoadingState label="Loading aging…" />
      ) : aging.isError ? (
        <VendorQueryError error={aging.error} onRetry={() => void aging.refetch()} />
      ) : (
        <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PortalAnimatedGridItem>
            <PortalStatCard
              label="Outstanding"
              value={formatVendorMoney(aging.data?.total)}
              Icon={Wallet}
            />
          </PortalAnimatedGridItem>
          {(aging.data?.buckets ?? []).map((bucket) => (
            <PortalAnimatedGridItem key={bucket.label}>
              <PortalStatCard label={bucket.label} value={formatVendorMoney(bucket.amount)} />
            </PortalAnimatedGridItem>
          ))}
        </PortalAnimatedGrid>
      )}

      <PortalPanel>
        {statement.isLoading ? (
          <PortalLoadingState label="Loading statement…" />
        ) : statement.isError ? (
          <VendorQueryError error={statement.error} onRetry={() => void statement.refetch()} />
        ) : !statement.data?.lines.length ? (
          <PortalEmptyState title="No statement lines" description="Transactions appear here when the statement is available." />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {statement.data.lines.map((line) => (
              <PortalAnimatedListItem key={line.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {line.reference || line.type || 'Line'}
                  </div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[line.date, line.description].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="text-right text-xs shrink-0">
                  {line.debit != null ? <div>Dr {formatVendorMoney(line.debit)}</div> : null}
                  {line.credit != null ? <div>Cr {formatVendorMoney(line.credit)}</div> : null}
                  {line.balance != null ? (
                    <div className="font-semibold text-sm">{formatVendorMoney(line.balance)}</div>
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
