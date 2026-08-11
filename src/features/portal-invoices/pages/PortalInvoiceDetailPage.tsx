import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
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
import { useDownloadPortalInvoicePdf, usePortalInvoice } from '../hooks/usePortalInvoices';

export default function PortalInvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalInvoice(id);
  const download = useDownloadPortalInvoicePdf();
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (isLoading) return <PortalLoadingState label="Loading invoice…" />;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Invoice not found.'}</p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
        <Link to="/portal/invoices" className="block text-sm text-[var(--color-primary)] underline">Back to invoices</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/portal/invoices" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]">
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
              onClick={() => navigate(`/portal/disputes?invoice_id=${encodeURIComponent(data.id)}`)}
            >
              Raise dispute
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/portal/messages?invoice_id=${encodeURIComponent(data.id)}`)}
            >
              Message
            </Button>
            {data.jobId ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/portal/shipments/${data.jobId}`)}
              >
                Shipment
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="secondary" disabled={download.isPending}
              onClick={() => {
                setPdfError(null);
                void download
                  .mutateAsync({ id: data.id, name: `${data.number}.pdf` })
                  .catch((err) => {
                    setPdfError(
                      err instanceof PortalApiError || err instanceof Error
                        ? err.message
                        : 'Could not download invoice PDF.',
                    );
                  });
              }}>
              <Download size={14} /> {download.isPending ? 'Downloading…' : 'Download PDF'}
            </Button>
          </>
        }
      />
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}
      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalAnimatedGridItem><PortalStatCard label="Total" value={data.totalAmount ?? '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Outstanding" value={data.outstandingBalance ?? '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Paid" value={data.paidAmount ?? '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Currency" value={data.currencyCode || '—'} /></PortalAnimatedGridItem>
      </PortalAnimatedGrid>
      {data.remarks ? <PortalPanel padded><p className="text-sm text-[var(--color-neutral-700)]">{data.remarks}</p></PortalPanel> : null}
      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Lines</h2>
        {!data.lines.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No lines.</p>
        ) : (
          <PortalAnimatedList className="space-y-2">
            {data.lines.map((line) => (
              <PortalAnimatedListItem
                key={line.id}
                className="flex justify-between gap-3 border-b border-[var(--color-neutral-100)] pb-2 text-sm last:border-0"
              >
                <span>{line.description}</span>
                <span className="font-medium tabular-nums">{line.lineTotal ?? '—'}</span>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}
