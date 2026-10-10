import { Link } from 'react-router-dom';
import { appType } from '@/lib/erpTypography';
import { FileText, CreditCard, Webhook, Layers, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  usePlatformBillingReconcile,
  usePlatformBillingStripeStatus,
} from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from '../components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '../components/PlatformBillingFieldGrid';
import { useState } from 'react';

const NAV = [
  { to: '/superadmin/billing/plans', label: 'Plans', icon: Layers, hint: 'Create and manage subscription plans' },
  { to: '/superadmin/billing/invoices', label: 'Invoices', icon: FileText, hint: 'Platform invoices by tenant' },
  { to: '/superadmin/billing/payments', label: 'Payments', icon: CreditCard, hint: 'Verify, reject, and refund payments' },
  { to: '/superadmin/billing/webhooks', label: 'Webhooks', icon: Webhook, hint: 'Stripe webhook events and replay' },
];

export default function PlatformBillingHubPage() {
  const stripe = usePlatformBillingStripeStatus();
  const reconcile = usePlatformBillingReconcile();
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);
  const [reconcileError, setReconcileError] = useState<string | null>(null);

  const handleReconcile = async () => {
    setReconcileMessage(null);
    setReconcileError(null);
    try {
      await reconcile.mutateAsync({});
      setReconcileMessage('Reconcile request completed.');
    } catch (err) {
      setReconcileError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className={appType.pageTitle}>Platform billing</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">
          Stripe integration, plans, invoices, and tenant subscriptions
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <CardHeader className="p-0 mb-0 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Stripe status</CardTitle>
          {stripe.data?.connected != null && (
            <Badge variant={stripe.data.connected ? 'success' : 'warning'}>
              {stripe.data.connected ? 'Connected' : 'Not connected'}
            </Badge>
          )}
        </CardHeader>
        {stripe.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {stripe.isError && (
          <PlatformBillingErrorAlert error={stripe.error} onRetry={() => stripe.refetch()} />
        )}
        {stripe.data && (
          <PlatformBillingFieldGrid normalized={stripe.data as unknown as Record<string, unknown>} raw={stripe.data.raw} />
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={reconcile.isPending}
            onClick={() => void handleReconcile()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reconcile.isPending ? 'animate-spin' : ''}`} />
            Reconcile
          </Button>
        </div>
        {reconcileMessage && (
          <p className="text-xs text-emerald-700" role="status">
            {reconcileMessage}
          </p>
        )}
        {reconcileError && (
          <p className="text-xs text-[var(--color-danger-700)]" role="alert">
            {reconcileError}
          </p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {NAV.map((item) => (
          <Card key={item.to} className="p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-neutral-100)' }}
              >
                <item.icon size={18} className="text-[var(--color-neutral-500)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">{item.label}</p>
                <p className="text-xs text-[var(--color-neutral-400)]">{item.hint}</p>
              </div>
            </div>
            <Link
              to={item.to}
              className="inline-flex items-center justify-center h-8 px-3 text-xs rounded-md font-medium border border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)] w-fit"
            >
              Open {item.label.toLowerCase()}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
