import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import type { Tenant } from '@/features/tenants/types/tenant.types';
import {
  useCancelTenantPlatformSubscription,
  useChangeTenantPlatformPlan,
  usePlatformBillingPlans,
  useTenantPaymentGateway,
  useTenantPlatformSubscription,
  useUpdateTenantPaymentGateway,
} from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from './PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from './PlatformBillingFieldGrid';
import type { UpdatePaymentGatewaySettingsDto } from '../types/platformBilling.types';

type PlatformTenantSubscriptionPanelProps = {
  tenant: Tenant;
};

export function PlatformTenantSubscriptionPanel({ tenant }: PlatformTenantSubscriptionPanelProps) {
  const tenantId = tenant.id;
  const subscription = useTenantPlatformSubscription(tenantId);
  const gateway = useTenantPaymentGateway(tenantId);
  const plans = usePlatformBillingPlans({ limit: 100 });
  const changePlan = useChangeTenantPlatformPlan(tenantId);
  const cancelSub = useCancelTenantPlatformSubscription(tenantId);
  const updateGateway = useUpdateTenantPaymentGateway(tenantId);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [gwEnabled, setGwEnabled] = useState<boolean | undefined>(undefined);
  const [gwUsePlatform, setGwUsePlatform] = useState<boolean | undefined>(undefined);
  const [gwAllowPartial, setGwAllowPartial] = useState<boolean | undefined>(undefined);
  const [gwPublishable, setGwPublishable] = useState('');
  const [gwSecret, setGwSecret] = useState('');
  const [gwWebhookSecret, setGwWebhookSecret] = useState('');
  const [gwDescriptor, setGwDescriptor] = useState('');

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(`${label} completed.`);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const subView = subscription.data;
  const gwView = gateway.data;

  return (
    <div className="space-y-4">
      {actionError && (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {actionError}
        </p>
      )}
      {actionMessage && (
        <p className="text-sm text-emerald-700" role="status">
          {actionMessage}
        </p>
      )}

      <Card className="p-4 space-y-4">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Live subscription</CardTitle>
        </CardHeader>
        {subscription.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {subscription.isError && (
          <PlatformBillingErrorAlert error={subscription.error} onRetry={() => subscription.refetch()} />
        )}
        {subView ? (
          <PlatformBillingFieldGrid
            normalized={subView as unknown as Record<string, unknown>}
            raw={subView.raw}
          />
        ) : (
          !subscription.isLoading &&
          !subscription.isError && (
            <p className="text-sm text-[var(--color-neutral-500)]">
              No subscription record from billing API. Legacy tenant plan:{' '}
              <span className="font-medium capitalize">{String(tenant.subscription_plan)}</span>
              {' · '}
              {String(tenant.status)}
            </p>
          )
        )}

        {!subscription.isLoading && (
          <p className="text-xs text-[var(--color-neutral-400)] border-t pt-3">
            Legacy fallback — plan {String(tenant.subscription_plan)}, trial ends{' '}
            {tenant.trial_ends ? new Date(tenant.trial_ends).toLocaleDateString() : '—'}, subscription
            ends{' '}
            {tenant.subscription_ends
              ? new Date(tenant.subscription_ends).toLocaleDateString()
              : '—'}
          </p>
        )}

        <form
          className="flex flex-wrap items-end gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedPlanId) {
              setActionError('Select a billing plan.');
              return;
            }
            void run('Plan change', () => changePlan.mutateAsync({ plan_id: selectedPlanId }));
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] min-w-[220px]">
            Change to plan
            <select
              className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              <option value="">Select plan…</option>
              {(plans.data?.items ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.code || p.id}
                  {p.amount != null ? ` — ${p.amount} ${p.currencyCode ?? ''}` : ''}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" size="sm" disabled={changePlan.isPending || plans.isLoading}>
            Change plan
          </Button>
        </form>

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
            At period end
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] flex-1 min-w-[200px]">
            Cancel reason
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </label>
          <Button type="submit" size="sm" variant="danger" disabled={cancelSub.isPending}>
            Cancel subscription
          </Button>
        </form>
      </Card>

      <Card className="p-4 space-y-4">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Payment gateway</CardTitle>
        </CardHeader>
        {gateway.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {gateway.isError && (
          <PlatformBillingErrorAlert error={gateway.error} onRetry={() => gateway.refetch()} />
        )}
        {gwView && (
          <PlatformBillingFieldGrid
            normalized={gwView as unknown as Record<string, unknown>}
            raw={gwView.raw}
          />
        )}
        <form
          className="grid gap-3 sm:grid-cols-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const dto: UpdatePaymentGatewaySettingsDto = {};
            if (gwEnabled !== undefined) dto.is_enabled = gwEnabled;
            if (gwUsePlatform !== undefined) dto.use_platform_account = gwUsePlatform;
            if (gwAllowPartial !== undefined) dto.allow_partial_payments = gwAllowPartial;
            if (gwPublishable.trim()) dto.publishable_key = gwPublishable.trim();
            if (gwSecret.trim()) dto.secret_key = gwSecret.trim();
            if (gwWebhookSecret.trim()) dto.webhook_secret = gwWebhookSecret.trim();
            if (gwDescriptor.trim()) dto.statement_descriptor = gwDescriptor.trim();
            if (Object.keys(dto).length === 0) {
              setActionError('Change at least one gateway field before saving.');
              return;
            }
            void run('Gateway update', async () => {
              await updateGateway.mutateAsync(dto);
              setGwSecret('');
              setGwWebhookSecret('');
            });
          }}
        >
          <ToggleField
            label="Enabled"
            checked={gwEnabled ?? gwView?.isEnabled ?? false}
            onChange={setGwEnabled}
          />
          <ToggleField
            label="Use platform account"
            checked={gwUsePlatform ?? gwView?.usePlatformAccount ?? false}
            onChange={setGwUsePlatform}
          />
          <ToggleField
            label="Allow partial payments"
            checked={gwAllowPartial ?? gwView?.allowPartialPayments ?? false}
            onChange={setGwAllowPartial}
          />
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] sm:col-span-2">
            Publishable key (leave blank to keep current)
            <Input
              value={gwPublishable}
              onChange={(e) => setGwPublishable(e.target.value)}
              placeholder={gwView?.publishableKey ?? 'pk_…'}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Secret key (write-only)
            <Input
              type="password"
              value={gwSecret}
              onChange={(e) => setGwSecret(e.target.value)}
              placeholder="Enter to replace — never shown after save"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Webhook secret (write-only)
            <Input
              type="password"
              value={gwWebhookSecret}
              onChange={(e) => setGwWebhookSecret(e.target.value)}
              placeholder="Enter to replace"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] sm:col-span-2">
            Statement descriptor
            <Input value={gwDescriptor} onChange={(e) => setGwDescriptor(e.target.value)} />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={updateGateway.isPending}>
              Save gateway settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
