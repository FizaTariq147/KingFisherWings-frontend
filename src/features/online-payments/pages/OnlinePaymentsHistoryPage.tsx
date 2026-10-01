import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  useCustomerPaymentHistory,
  useInvoicePaymentHistory,
  useOnlinePaymentHistory,
  useVendorPaymentHistory,
} from '../hooks/useOnlinePayments';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import { PlatformBillingListPager } from '@/features/platform-billing/components/PlatformBillingListPager';
import { formatBillingScalar, statusBadgeVariant } from '@/features/platform-billing/utils/platformBillingUi';

const PAGE_SIZE = 20;

type HistoryScope = 'all' | 'customer' | 'vendor' | 'invoice';

export default function OnlinePaymentsHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialScope = (searchParams.get('scope') as HistoryScope) || 'all';
  const initialScopeId =
    searchParams.get('customer_id') ||
    searchParams.get('vendor_id') ||
    searchParams.get('invoice_id') ||
    '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [scope, setScope] = useState<HistoryScope>(
    ['customer', 'vendor', 'invoice'].includes(initialScope) ? initialScope : 'all',
  );
  const [scopeId, setScopeId] = useState(initialScopeId);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    status: status.trim() || undefined,
  };

  const allHistory = useOnlinePaymentHistory(listParams, scope === 'all');
  const customerHistory = useCustomerPaymentHistory(
    scopeId.trim(),
    listParams,
    scope === 'customer' && Boolean(scopeId.trim()),
  );
  const vendorHistory = useVendorPaymentHistory(
    scopeId.trim(),
    listParams,
    scope === 'vendor' && Boolean(scopeId.trim()),
  );
  const invoiceHistory = useInvoicePaymentHistory(
    scopeId.trim(),
    listParams,
    scope === 'invoice' && Boolean(scopeId.trim()),
  );

  const active =
    scope === 'customer'
      ? customerHistory
      : scope === 'vendor'
        ? vendorHistory
        : scope === 'invoice'
          ? invoiceHistory
          : allHistory;

  const payments = active.data?.items ?? [];
  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const pay of payments) {
      if (pay.status?.trim()) set.add(pay.status.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [payments]);

  const syncScopeToUrl = (nextScope: HistoryScope, nextId: string) => {
    const params = new URLSearchParams();
    if (nextScope !== 'all') params.set('scope', nextScope);
    if (nextScope === 'customer' && nextId.trim()) params.set('customer_id', nextId.trim());
    if (nextScope === 'vendor' && nextId.trim()) params.set('vendor_id', nextId.trim());
    if (nextScope === 'invoice' && nextId.trim()) params.set('invoice_id', nextId.trim());
    setSearchParams(params, { replace: true });
  };

  const needsScopeId = scope !== 'all';
  const scopeReady = !needsScopeId || Boolean(scopeId.trim());

  return (
    <div className="space-y-4">
      <PageBackLink to="/finance/online-payments" label="Back to online payments" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Online payment history</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">
          Posted ERP payments &amp; receipts from /payments/history (and scoped variants)
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
          Scope
          <select
            className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm min-w-[160px]"
            value={scope}
            onChange={(e) => {
              const next = e.target.value as HistoryScope;
              setScope(next);
              setPage(1);
              if (next === 'all') setScopeId('');
              syncScopeToUrl(next, next === 'all' ? '' : scopeId);
            }}
          >
            <option value="all">All history</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="invoice">Invoice</option>
          </select>
        </label>
        {needsScopeId && (
          <Input
            placeholder={`${scope} id`}
            value={scopeId}
            onChange={(e) => {
              setScopeId(e.target.value);
              setPage(1);
              syncScopeToUrl(scope, e.target.value);
            }}
            className="max-w-xs"
          />
        )}
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
          Status
          <Input
            list="online-history-status-options"
            placeholder="Status filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
          <datalist id="online-history-status-options">
            {statusOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
      </div>

      {needsScopeId && !scopeReady && (
        <Card className="p-4 text-sm text-[var(--color-neutral-500)]">
          Enter a {scope} id to load scoped payment history.
        </Card>
      )}

      {scopeReady && active.isError && (
        <PlatformBillingErrorAlert error={active.error} onRetry={() => active.refetch()} />
      )}
      {scopeReady && active.isLoading && (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading history…</p>
      )}

      {scopeReady && (
        <>
          <div className="space-y-2">
            {payments.map((pay) => (
              <Card key={pay.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link
                      to={`/finance/online-payments/${pay.id}`}
                      className="text-sm font-semibold text-[var(--color-primary-600)] hover:underline"
                    >
                      {pay.id}
                    </Link>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                      {formatBillingScalar(pay.amount)} {formatBillingScalar(pay.currencyCode)}
                      {pay.method ? ` · ${pay.method}` : ''}
                      {pay.invoiceId ? ` · Invoice ${pay.invoiceId}` : ''}
                      {pay.customerId ? ` · Customer ${pay.customerId}` : ''}
                      {pay.vendorId ? ` · Vendor ${pay.vendorId}` : ''}
                    </p>
                  </div>
                  {pay.status && <Badge variant={statusBadgeVariant(pay.status)}>{pay.status}</Badge>}
                </div>
              </Card>
            ))}
            {payments.length === 0 && !active.isLoading && !active.isError && (
              <Card className="p-4 text-sm text-[var(--color-neutral-500)]">No history records found.</Card>
            )}
          </div>

          <PlatformBillingListPager meta={active.data?.meta} page={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
