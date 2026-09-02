import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { useVendorPaymentRequest } from '../hooks/useVendorPaymentRequests';

export default function VendorPaymentRequestDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = useVendorPaymentRequest(id);

  if (isLoading) return <PortalLoadingState label="Loading payment request…" />;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <VendorQueryError error={error} onRetry={() => void refetch()} />
        <Link to="/vendor/payment-requests" className="text-sm underline">
          Back to payment requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/vendor/payment-requests"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to payment requests
      </Link>
      <PortalPageHeader
        title={data.number || data.id}
        description="Payment request detail"
        actions={
          data.status ? (
            <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge>
          ) : undefined
        }
      />
      <PortalPanel padded className="space-y-2 text-sm">
        <p>
          <span className="text-[var(--color-neutral-500)]">Amount: </span>
          {formatVendorMoney(data.amount, data.currencyCode) || '—'}
        </p>
        <p>
          <span className="text-[var(--color-neutral-500)]">Requested: </span>
          {data.requestedAt || '—'}
        </p>
        {data.approvedAt ? (
          <p>
            <span className="text-[var(--color-neutral-500)]">Approved: </span>
            {data.approvedAt}
          </p>
        ) : null}
        {data.paidAt ? (
          <p>
            <span className="text-[var(--color-neutral-500)]">Paid: </span>
            {data.paidAt}
          </p>
        ) : null}
        {data.paymentId ? (
          <p>
            <span className="text-[var(--color-neutral-500)]">Payment ID: </span>
            {data.paymentId}
          </p>
        ) : null}
        {data.notes ? (
          <p>
            <span className="text-[var(--color-neutral-500)]">Notes: </span>
            {data.notes}
          </p>
        ) : null}
      </PortalPanel>
      <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
        Refresh
      </Button>
    </div>
  );
}
