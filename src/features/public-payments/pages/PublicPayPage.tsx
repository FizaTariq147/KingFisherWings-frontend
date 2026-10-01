import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  formatBillingScalar,
  openBillingCheckoutUrl,
  statusBadgeVariant,
} from '@/features/platform-billing/utils/platformBillingUi';
import { PlatformBillingFieldGrid } from '@/features/platform-billing/components/PlatformBillingFieldGrid';
import { usePublicPayCheckout, usePublicPaySummary } from '../hooks/usePublicPayments';

export default function PublicPayPage() {
  const { token = '' } = useParams();
  const summary = usePublicPaySummary(token);
  const checkout = usePublicPayCheckout(token);
  const [partialAmount, setPartialAmount] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const display = summary.data;
  const canPay = useMemo(() => {
    if (!display) return false;
    const outstanding = display.outstandingAmount;
    if (outstanding != null && outstanding <= 0) return false;
    const status = (display.status ?? '').toUpperCase();
    if (['PAID', 'CANCELLED', 'CANCELED', 'VOID', 'EXPIRED'].includes(status)) return false;
    return true;
  }, [display]);

  const startCheckout = async () => {
    setActionError(null);
    try {
      const amountRaw = partialAmount.trim();
      const amount = amountRaw ? Number(amountRaw) : undefined;
      if (amountRaw && (!Number.isFinite(amount) || (amount ?? 0) <= 0)) {
        setActionError('Enter a valid payment amount.');
        return;
      }
      const result = await checkout.mutateAsync(
        amount != null ? { amount } : {},
      );
      if (!result.checkoutUrl) {
        setActionError('Checkout did not return a payment URL.');
        return;
      }
      openBillingCheckoutUrl(result);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
          Secure payment
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
          {display?.companyName ? `Pay ${display.companyName}` : 'Pay invoice'}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Review the balance and continue to Stripe Checkout.
        </p>

        {summary.isLoading && (
          <p className="mt-8 text-sm text-[var(--color-neutral-500)]">Loading invoice…</p>
        )}

        {summary.isError && (
          <Card className="mt-8 p-4">
            <p className="text-sm text-[var(--color-danger-700)]" role="alert">
              {getErrorMessage(summary.error) || 'This payment link is invalid or expired.'}
            </p>
          </Card>
        )}

        {display && (
          <div className="mt-8 space-y-4">
            <Card className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-neutral-800)]">
                    Invoice {display.invoiceNumber || display.invoiceId || '—'}
                  </h2>
                  {display.dueDate && (
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                      Due {formatBillingScalar(display.dueDate)}
                    </p>
                  )}
                </div>
                {display.status && (
                  <Badge variant={statusBadgeVariant(display.status)}>{display.status}</Badge>
                )}
              </div>

              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Total</dt>
                  <dd>
                    {formatBillingScalar(display.totalAmount)}{' '}
                    {formatBillingScalar(display.currencyCode)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Outstanding</dt>
                  <dd className="font-medium">
                    {formatBillingScalar(display.outstandingAmount ?? display.totalAmount)}{' '}
                    {formatBillingScalar(display.currencyCode)}
                  </dd>
                </div>
              </dl>

              <PlatformBillingFieldGrid
                normalized={display as unknown as Record<string, unknown>}
                raw={display.raw}
              />
            </Card>

            {canPay ? (
              <Card className="p-4 space-y-3">
                <CardHeader className="p-0 mb-0">
                  <CardTitle className="text-base">Pay now</CardTitle>
                </CardHeader>
                {display.allowPartialPayments && (
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
                    Partial amount (optional)
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      placeholder="Leave blank to pay full balance"
                    />
                  </label>
                )}
                {actionError && (
                  <p className="text-sm text-[var(--color-danger-700)]" role="alert">
                    {actionError}
                  </p>
                )}
                <Button
                  type="button"
                  disabled={checkout.isPending}
                  onClick={() => void startCheckout()}
                >
                  {checkout.isPending ? 'Opening checkout…' : 'Continue to payment'}
                </Button>
              </Card>
            ) : (
              <Card className="p-4">
                <p className="text-sm text-[var(--color-neutral-600)]">
                  This invoice does not require payment right now.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
