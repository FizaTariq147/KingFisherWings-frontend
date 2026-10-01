import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import {
  formatBillingScalar,
  statusBadgeVariant,
} from '@/features/platform-billing/utils/platformBillingUi';
import {
  useCustomerPaymentHistory,
  useVendorPaymentHistory,
} from '../hooks/useOnlinePayments';

type PartyOnlinePaymentHistoryPanelProps = {
  partyId: string;
  partyType: string;
};

export function PartyOnlinePaymentHistoryPanel({
  partyId,
  partyType,
}: PartyOnlinePaymentHistoryPanelProps) {
  const type = partyType.toUpperCase();
  const isCustomer = type === 'CUSTOMER';
  const isVendor = type === 'VENDOR';
  const enabled = isCustomer || isVendor;

  const customerHistory = useCustomerPaymentHistory(partyId, { page: 1, limit: 20 }, isCustomer);
  const vendorHistory = useVendorPaymentHistory(partyId, { page: 1, limit: 20 }, isVendor);
  const active = isVendor ? vendorHistory : customerHistory;

  if (!enabled) {
    return (
      <Card className="p-4 text-sm text-[var(--color-neutral-500)]">
        Online payment history is available for customer and vendor parties.
      </Card>
    );
  }

  const payments = active.data?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--color-neutral-500)]">
          Posted receipts / payments from{' '}
          {isVendor ? `/payments/history/vendor/{id}` : `/payments/history/customer/{id}`}
        </p>
        <Link
          to={
            isVendor
              ? `/finance/online-payments/history?scope=vendor&vendor_id=${encodeURIComponent(partyId)}`
              : `/finance/online-payments/history?scope=customer&customer_id=${encodeURIComponent(partyId)}`
          }
          className="text-xs text-[var(--color-primary-600)] hover:underline"
        >
          Open full history
        </Link>
      </div>

      {active.isError && (
        <PlatformBillingErrorAlert error={active.error} onRetry={() => active.refetch()} />
      )}
      {active.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}

      <div className="space-y-2">
        {payments.map((pay) => (
          <Card key={pay.id} className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  to={`/finance/online-payments/${pay.id}`}
                  className="text-sm font-medium text-[var(--color-primary-600)] hover:underline"
                >
                  {pay.id}
                </Link>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                  {formatBillingScalar(pay.amount)} {formatBillingScalar(pay.currencyCode)}
                  {pay.invoiceId ? ` · Invoice ${pay.invoiceId}` : ''}
                </p>
              </div>
              {pay.status && <Badge variant={statusBadgeVariant(pay.status)}>{pay.status}</Badge>}
            </div>
          </Card>
        ))}
        {payments.length === 0 && !active.isLoading && !active.isError && (
          <Card className="p-4 text-sm text-[var(--color-neutral-500)]">No payment history found.</Card>
        )}
      </div>
    </div>
  );
}
