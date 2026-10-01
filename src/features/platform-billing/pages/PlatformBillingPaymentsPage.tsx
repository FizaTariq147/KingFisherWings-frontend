import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { usePlatformPayments } from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from '../components/PlatformBillingErrorAlert';
import { PlatformBillingListPager } from '../components/PlatformBillingListPager';
import { formatBillingScalar, statusBadgeVariant } from '../utils/platformBillingUi';

const PAGE_SIZE = 20;

export default function PlatformBillingPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError, error, refetch } = usePlatformPayments({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    status: status.trim() || undefined,
  });

  const payments = data?.items ?? [];

  return (
    <div className="space-y-4">
      <PageBackLink to="/superadmin/billing" label="Back to billing hub" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Platform payments</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">Review proofs, verify, reject, or refund</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Input
          placeholder="Status filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      {isError && <PlatformBillingErrorAlert error={error} onRetry={() => refetch()} />}
      {isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading payments…</p>}

      <div className="space-y-2">
        {payments.map((pay) => (
          <Card key={pay.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  to={`/superadmin/billing/payments/${pay.id}`}
                  className="text-sm font-semibold text-[var(--color-primary-600)] hover:underline"
                >
                  {pay.id}
                </Link>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                  {formatBillingScalar(pay.amount)} {formatBillingScalar(pay.currencyCode)}
                  {pay.method ? ` · ${pay.method}` : ''}
                  {pay.invoiceId ? ` · Invoice ${pay.invoiceId}` : ''}
                </p>
              </div>
              {pay.status && <Badge variant={statusBadgeVariant(pay.status)}>{pay.status}</Badge>}
            </div>
          </Card>
        ))}
        {payments.length === 0 && !isLoading && !isError && (
          <Card className="p-4 text-sm text-[var(--color-neutral-500)]">No payments found.</Card>
        )}
      </div>

      <PlatformBillingListPager meta={data?.meta} page={page} onPageChange={setPage} />
    </div>
  );
}
