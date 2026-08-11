import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { useDownloadVendorInvoicePdf, useVendorInvoice } from '../hooks/useVendorInvoices';

export default function VendorInvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useVendorInvoice(id);
  const download = useDownloadVendorInvoicePdf();
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (isLoading) return <PortalLoadingState label="Loading invoice…" />;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <VendorQueryError error={error} onRetry={() => void refetch()} />
        <Link to="/vendor/invoices" className="block text-sm text-[var(--color-primary)] underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/vendor/invoices"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to invoices
      </Link>
      <PortalPageHeader
        title={data.number}
        description={[data.invoiceDate, data.dueDate ? `Due ${data.dueDate}` : null].filter(Boolean).join(' · ') || 'Invoice detail'}
        actions={
          <>
            {data.status ? <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge> : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/vendor/disputes?invoice_id=${encodeURIComponent(data.id)}`)}
            >
              Raise dispute
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={download.isPending}
              onClick={() => {
                setPdfError(null);
                void download
                  .mutateAsync({ id: data.id, name: `${data.number}.pdf` })
                  .catch((err) => {
                    setPdfError(vendorErrorMessage(err, 'Could not download invoice PDF.'));
                  });
              }}
            >
              <Download size={14} />
              {download.isPending ? 'Downloading…' : 'PDF'}
            </Button>
          </>
        }
      />
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}

      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalAnimatedGridItem>
          <PortalStatCard label="Total" value={formatVendorMoney(data.totalAmount, data.currencyCode)} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Outstanding" value={formatVendorMoney(data.outstandingBalance, data.currencyCode)} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Paid" value={formatVendorMoney(data.paidAmount, data.currencyCode)} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Tax" value={formatVendorMoney(data.taxTotal, data.currencyCode)} />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>

      {data.remarks ? (
        <PortalPanel padded>
          <p className="text-sm text-[var(--color-neutral-700)]">{data.remarks}</p>
        </PortalPanel>
      ) : null}

      <PortalPanel>
        {data.lines.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--color-neutral-500)]">No line items.</p>
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {data.lines.map((line) => (
              <PortalAnimatedListItem key={line.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{line.description}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    Qty {line.quantity ?? '—'} · {formatVendorMoney(line.unitPrice, data.currencyCode)}
                  </div>
                </div>
                <div className="text-sm font-semibold">{formatVendorMoney(line.lineTotal, data.currencyCode)}</div>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}
