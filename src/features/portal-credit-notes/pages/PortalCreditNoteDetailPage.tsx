import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  isPortalOnlinePayAvailable,
  portalPaymentStatusBadgeVariant,
} from '@/features/portal-payments/utils/portalPaymentsUi';
import { usePortalInvoiceStripeConfig } from '@/features/portal-invoices/hooks/usePortalInvoices';
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
import {
  useDownloadPortalCreditNotePdf,
  useDownloadPortalDebitAttachment,
  usePayPortalDebitNote,
  usePortalCreditNote,
  usePortalDebitNotePaymentStatus,
} from '../hooks/usePortalCreditNotes';
import type { PortalNoteKind } from '../services/portalCreditNotes.service';

function isPayableStatus(status?: string): boolean {
  const s = String(status || '').toUpperCase();
  if (!s) return true;
  return !/PAID|CANCELLED|VOID|DRAFT/.test(s);
}

export default function PortalCreditNoteDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const kind: PortalNoteKind = location.pathname.includes('/debit-notes') ? 'debit' : 'credit';
  const listPath = kind === 'debit' ? '/portal/debit-notes' : '/portal/credit-notes';
  const { data, isLoading, isError, error, refetch } = usePortalCreditNote(id, kind);
  const download = useDownloadPortalCreditNotePdf();
  const downloadAttachment = useDownloadPortalDebitAttachment();
  const stripeConfig = usePortalInvoiceStripeConfig();
  const payDebit = usePayPortalDebitNote(id);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [payStarted, setPayStarted] = useState(false);

  const balanceDue = useMemo(() => {
    if (!data) return null;
    if (data.outstandingBalance != null) return data.outstandingBalance;
    if (data.totalAmount != null && data.paidAmount != null) {
      return Math.max(0, data.totalAmount - data.paidAmount);
    }
    return data.totalAmount ?? null;
  }, [data]);

  const canPay =
    kind === 'debit' &&
    Boolean(data) &&
    isPayableStatus(data?.status) &&
    (balanceDue == null || balanceDue > 0);

  const onlinePayAvailable = isPortalOnlinePayAvailable(stripeConfig.data);
  const showPayNow = canPay && onlinePayAvailable;
  const paymentStatus = usePortalDebitNotePaymentStatus(
    id,
    Boolean(id) && kind === 'debit' && (onlinePayAvailable || payStarted),
  );

  const startPayNow = async () => {
    setPayError(null);
    setPayStarted(true);
    try {
      const result = await payDebit.mutateAsync({});
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      void paymentStatus.refetch();
      void refetch();
    } catch (err) {
      setPayError(
        err instanceof PortalApiError || err instanceof Error
          ? err.message
          : 'Could not start online payment.',
      );
    }
  };

  if (isLoading) return <PortalLoadingState label="Loading…" />;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">
          {error instanceof PortalApiError || error instanceof Error ? error.message : 'Not found.'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <Link to={listPath} className="block text-sm underline text-[var(--color-primary)]">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to={listPath}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} /> Back to {kind === 'debit' ? 'debit notes' : 'credit notes'}
      </Link>
      <PortalPageHeader
        title={data.number}
        description={
          data.jobNumber
            ? `Job ${data.jobNumber}`
            : data.creditedInvoiceNumber
              ? `Against invoice ${data.creditedInvoiceNumber}`
              : kind === 'debit'
                ? 'Debit note detail'
                : 'Credit note detail'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {data.status ? <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge> : null}
            {showPayNow ? (
              <Button
                type="button"
                size="sm"
                disabled={payDebit.isPending}
                onClick={() => void startPayNow()}
              >
                <CreditCard size={14} aria-hidden="true" />
                {payDebit.isPending ? 'Starting…' : 'Pay now'}
              </Button>
            ) : null}
            {data.jobId ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/portal/shipments/${data.jobId}`)}
              >
                Job
              </Button>
            ) : null}
            {kind === 'debit' && data.hasAttachment ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={downloadAttachment.isPending}
                onClick={() => {
                  setPdfError(null);
                  void downloadAttachment
                    .mutateAsync({
                      id: data.id,
                      name: data.attachmentName || 'debit-note-attachment',
                    })
                    .catch((err) => {
                      setPdfError(
                        err instanceof PortalApiError || err instanceof Error
                          ? err.message
                          : 'Could not download attachment.',
                      );
                    });
                }}
              >
                <Paperclip size={14} />{' '}
                {downloadAttachment.isPending ? 'Downloading…' : 'Attachment'}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={download.isPending}
              onClick={() => {
                setPdfError(null);
                void download
                  .mutateAsync({
                    id: data.id,
                    kind,
                    name: `${data.number || kind}.pdf`,
                  })
                  .catch((err) => {
                    setPdfError(
                      err instanceof PortalApiError || err instanceof Error
                        ? err.message
                        : 'Could not download PDF.',
                    );
                  });
              }}
            >
              <Download size={14} /> {download.isPending ? 'Downloading…' : 'Download PDF'}
            </Button>
          </div>
        }
      />
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}
      {payError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {payError}
        </p>
      ) : null}
      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-3">
        <PortalAnimatedGridItem>
          <PortalStatCard label="Total" value={data.totalAmount ?? '—'} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Currency" value={data.currencyCode || '—'} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label={kind === 'debit' ? 'Balance due' : 'Date'}
            value={
              kind === 'debit'
                ? (balanceDue ?? data.creditDate ?? '—')
                : data.creditDate || '—'
            }
          />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>
      {kind === 'debit' && (onlinePayAvailable || payStarted) && paymentStatus.data?.status ? (
        <PortalPanel padded>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Online payment</span>
            <Badge variant={portalPaymentStatusBadgeVariant(paymentStatus.data.status)}>
              {paymentStatus.data.status.replaceAll('_', ' ')}
            </Badge>
          </div>
        </PortalPanel>
      ) : null}
      {data.remarks ? (
        <PortalPanel padded>
          <p className="text-sm">{data.remarks}</p>
        </PortalPanel>
      ) : null}
      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold">Lines</h2>
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
