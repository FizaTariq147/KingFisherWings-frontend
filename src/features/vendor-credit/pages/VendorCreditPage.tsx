import { useState } from 'react';
import { Download, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
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
  const lines = statement.data?.lines ?? [];

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
              <Download size={14} /> {downloadPdf.isPending ? 'Preparing PDF…' : 'Statement PDF'}
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
        ) : !lines.length ? (
          <PortalEmptyState
            title="No statement lines"
            description="Transactions appear here when the statement is available."
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
              {statement.data?.advancesUnallocated != null &&
              statement.data.advancesUnallocated > 0 ? (
                <span>
                  Advances unallocated {formatVendorMoney(statement.data.advancesUnallocated)}
                </span>
              ) : null}
              {statement.data?.openingBalance != null ? (
                <span>Opening {formatVendorMoney(statement.data.openingBalance)}</span>
              ) : null}
              {statement.data?.closingBalance != null ? (
                <span className="font-semibold text-[var(--color-neutral-800)]">
                  Open balance {formatVendorMoney(statement.data.closingBalance)}
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
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {line.debit != null ? formatVendorMoney(line.debit) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {line.credit != null ? formatVendorMoney(line.credit) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold">
                      {line.balance != null ? formatVendorMoney(line.balance) : '—'}
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
