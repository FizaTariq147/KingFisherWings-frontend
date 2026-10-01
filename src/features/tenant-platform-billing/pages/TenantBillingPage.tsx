import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '@/features/platform-billing/components/PlatformBillingFieldGrid';
import { PlatformBillingListPager } from '@/features/platform-billing/components/PlatformBillingListPager';
import type { StartCheckoutDto } from '../types/tenantPlatformBilling.types';
import type { TenantBillingPlan } from '../types/tenantPlatformBilling.types';
import {
  useTenantBillingPlans,
  useTenantCancelSubscription,
  useTenantChangePlan,
  useTenantPlatformInvoices,
  useTenantPlatformPayments,
  useTenantSubscription,
  useTenantSubscriptionCheckout,
} from '../hooks/useTenantPlatformBilling';
import { formatBillingScalar, openCheckout, statusBadgeVariant } from '../utils/tenantPlatformBillingUi';

const LIST_PAGE_SIZE = 10;

function planPriceLabel(plan: TenantBillingPlan): string {
  const chunks: string[] = [];
  if (plan.amount != null) chunks.push(String(plan.amount));
  if (plan.currencyCode) chunks.push(plan.currencyCode);
  let label = chunks.join(' ');
  if (plan.interval) label = label ? `${label} / ${plan.interval}` : plan.interval;
  return label;
}

function checkoutDtoForPlan(plan: TenantBillingPlan): StartCheckoutDto {
  const dto: Record<string, unknown> = { plan_id: plan.id };
  if (plan.amount != null) dto.amount = plan.amount;
  return dto as StartCheckoutDto;
}

export default function TenantBillingPage() {
  const subscription = useTenantSubscription();
  const plans = useTenantBillingPlans({ limit: 100 });
  const checkout = useTenantSubscriptionCheckout();
  const changePlan = useTenantChangePlan();
  const cancelSub = useTenantCancelSubscription();

  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const invoices = useTenantPlatformInvoices({ page: invoicePage, limit: LIST_PAGE_SIZE });
  const payments = useTenantPlatformPayments({ page: paymentPage, limit: LIST_PAGE_SIZE });

  const [cancelReason, setCancelReason] = useState('');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await fn();
      setActionMessage(`${label} completed.`);
      return result;
    } catch (err) {
      setActionError(getErrorMessage(err));
      return null;
    }
  };

  const hasSubscription = Boolean(subscription.data?.planId || subscription.data?.status);

  return (
    <div className="space-y-4 max-w-5xl">
      <PageBackLink to="/settings" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Platform billing</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">
          Subscription, platform invoices, and payment history for this workspace.
        </p>
      </div>

      {actionError ? (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {actionError}
        </p>
      ) : null}
      {actionMessage ? (
        <p className="text-sm text-emerald-700" role="status">
          {actionMessage}
        </p>
      ) : null}

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Current subscription</CardTitle>
          {subscription.data?.status ? (
            <Badge variant={statusBadgeVariant(subscription.data.status)}>{subscription.data.status}</Badge>
          ) : null}
        </CardHeader>
        {subscription.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {subscription.isError && (
          <PlatformBillingErrorAlert error={subscription.error} onRetry={() => subscription.refetch()} />
        )}
        {subscription.data ? (
          <PlatformBillingFieldGrid
            normalized={subscription.data as unknown as Record<string, unknown>}
            raw={subscription.data.raw}
          />
        ) : (
          !subscription.isLoading &&
          !subscription.isError && (
            <p className="text-sm text-[var(--color-neutral-500)]">No active subscription from the billing API.</p>
          )
        )}
        <form
          className="flex flex-wrap items-end gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run('Cancel subscription', () =>
              cancelSub.mutateAsync({
                at_period_end: cancelAtPeriodEnd,
                reason: cancelReason.trim() || undefined,
              }),
            );
          }}
        >
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cancelAtPeriodEnd}
              onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
            />
            Cancel at period end
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] flex-1 min-w-[200px]">
            Reason (optional)
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </label>
          <Button type="submit" size="sm" variant="danger" disabled={cancelSub.isPending}>
            Cancel subscription
          </Button>
        </form>
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Available plans</CardTitle>
        </CardHeader>
        {plans.isError && (
          <PlatformBillingErrorAlert error={plans.error} onRetry={() => plans.refetch()} />
        )}
        {plans.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading plans…</p>}
        <div className="space-y-3">
          {(plans.data?.items ?? []).map((plan) => {
            const price = planPriceLabel(plan);
            const isCurrent = subscription.data?.planId === plan.id;
            return (
              <div
                key={plan.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-neutral-200)] px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                    {plan.name || plan.code || plan.id}
                    {isCurrent ? (
                      <span className="ml-2 inline-flex">
                        <Badge variant="info">Current</Badge>
                      </span>
                    ) : null}
                  </p>
                  {price ? (
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">{price}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={checkout.isPending}
                    onClick={() =>
                      void run('Checkout', async () => {
                        const session = await checkout.mutateAsync(checkoutDtoForPlan(plan));
                        openCheckout(session);
                        return session;
                      })
                    }
                  >
                    Checkout
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={changePlan.isPending || !hasSubscription}
                    onClick={() =>
                      void run('Change plan', () => changePlan.mutateAsync({ plan_id: plan.id }))
                    }
                  >
                    Change plan
                  </Button>
                </div>
              </div>
            );
          })}
          {(plans.data?.items.length ?? 0) === 0 && !plans.isLoading && (
            <p className="text-sm text-[var(--color-neutral-500)]">No plans returned from the API.</p>
          )}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Platform invoices</CardTitle>
        </CardHeader>
        {invoices.isError && (
          <PlatformBillingErrorAlert error={invoices.error} onRetry={() => invoices.refetch()} />
        )}
        {invoices.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading invoices…</p>}
        <div className="space-y-2">
          {(invoices.data?.items ?? []).map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            >
              <div>
                <Link
                  to={`/settings/billing/invoices/${inv.id}`}
                  className="font-medium text-[var(--color-primary-600)] hover:underline"
                >
                  {inv.number || inv.id}
                </Link>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {formatBillingScalar(inv.totalAmount)} {formatBillingScalar(inv.currencyCode)}
                  {inv.dueDate ? ` · Due ${inv.dueDate}` : ''}
                </p>
              </div>
              {inv.status ? <Badge variant={statusBadgeVariant(inv.status)}>{inv.status}</Badge> : null}
            </div>
          ))}
          {(invoices.data?.items.length ?? 0) === 0 && !invoices.isLoading && (
            <p className="text-sm text-[var(--color-neutral-500)]">No platform invoices yet.</p>
          )}
        </div>
        <PlatformBillingListPager
          meta={invoices.data?.meta}
          page={invoicePage}
          onPageChange={setInvoicePage}
        />
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Payment history</CardTitle>
        </CardHeader>
        {payments.isError && (
          <PlatformBillingErrorAlert error={payments.error} onRetry={() => payments.refetch()} />
        )}
        {payments.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading payments…</p>}
        <div className="space-y-2">
          {(payments.data?.items ?? []).map((pay) => (
            <div
              key={pay.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            >
              <div>
                <Link
                  to={`/settings/billing/payments/${pay.id}`}
                  className="font-medium text-[var(--color-primary-600)] hover:underline"
                >
                  {pay.id}
                </Link>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {formatBillingScalar(pay.amount)} {formatBillingScalar(pay.currencyCode)}
                  {pay.method ? ` · ${pay.method}` : ''}
                </p>
              </div>
              {pay.status ? <Badge variant={statusBadgeVariant(pay.status)}>{pay.status}</Badge> : null}
            </div>
          ))}
          {(payments.data?.items.length ?? 0) === 0 && !payments.isLoading && (
            <p className="text-sm text-[var(--color-neutral-500)]">No payments recorded yet.</p>
          )}
        </div>
        <PlatformBillingListPager
          meta={payments.data?.meta}
          page={paymentPage}
          onPageChange={setPaymentPage}
        />
      </Card>
    </div>
  );
}
