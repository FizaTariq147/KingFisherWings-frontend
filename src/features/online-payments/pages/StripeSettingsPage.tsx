import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '@/features/platform-billing/components/PlatformBillingFieldGrid';
import type { UpdatePaymentGatewaySettingsDto } from '../types/onlinePayments.types';
import {
  useOnlinePaymentsStripeConfig,
  useOnlinePaymentsStripeSettings,
  useOnlinePaymentsStripeStatus,
  useReconcileOnlinePaymentsStripe,
  useRotateOnlinePaymentsStripeWebhook,
  useUpdateOnlinePaymentsStripeSettings,
} from '../hooks/useOnlinePayments';

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

export default function StripeSettingsPage() {
  const stripeStatus = useOnlinePaymentsStripeStatus();
  const stripeConfig = useOnlinePaymentsStripeConfig();
  const stripeSettings = useOnlinePaymentsStripeSettings();
  const updateSettings = useUpdateOnlinePaymentsStripeSettings();
  const rotateWebhook = useRotateOnlinePaymentsStripeWebhook();
  const reconcile = useReconcileOnlinePaymentsStripe();

  const settingsView = stripeSettings.data;

  const [gwEnabled, setGwEnabled] = useState<boolean | undefined>(undefined);
  const [gwUsePlatform, setGwUsePlatform] = useState<boolean | undefined>(undefined);
  const [gwAllowPartial, setGwAllowPartial] = useState<boolean | undefined>(undefined);
  const [gwPublishable, setGwPublishable] = useState('');
  const [gwSecret, setGwSecret] = useState('');
  const [gwWebhookSecret, setGwWebhookSecret] = useState('');
  const [gwDescriptor, setGwDescriptor] = useState('');
  const [gwBankAccountId, setGwBankAccountId] = useState('');
  const [gwFeeGlAccountId, setGwFeeGlAccountId] = useState('');

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(`${label} completed.`);
      await stripeSettings.refetch();
      await stripeConfig.refetch();
      await stripeStatus.refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const usePlatformFromRaw =
    settingsView?.raw &&
    typeof settingsView.raw.use_platform_account === 'boolean'
      ? settingsView.raw.use_platform_account
      : typeof settingsView?.raw?.usePlatformAccount === 'boolean'
        ? settingsView.raw.usePlatformAccount
        : undefined;

  const allowPartialFromRaw =
    settingsView?.raw &&
    typeof settingsView.raw.allow_partial_payments === 'boolean'
      ? settingsView.raw.allow_partial_payments
      : typeof settingsView?.raw?.allowPartialPayments === 'boolean'
        ? settingsView.raw.allowPartialPayments
        : undefined;

  return (
    <div className="space-y-4">
      <PageBackLink to="/settings" label="Back to settings" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Online Payments / Stripe</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">
          Connect Stripe, manage gateway settings, and run maintenance actions
        </p>
      </div>

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

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Stripe status</CardTitle>
        </CardHeader>
        {stripeStatus.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {stripeStatus.isError && (
          <PlatformBillingErrorAlert error={stripeStatus.error} onRetry={() => stripeStatus.refetch()} />
        )}
        {stripeStatus.data && (
          <PlatformBillingFieldGrid
            normalized={stripeStatus.data as unknown as Record<string, unknown>}
            raw={stripeStatus.data.raw}
          />
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Stripe config</CardTitle>
        </CardHeader>
        {stripeConfig.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {stripeConfig.isError && (
          <PlatformBillingErrorAlert error={stripeConfig.error} onRetry={() => stripeConfig.refetch()} />
        )}
        {stripeConfig.data && (
          <PlatformBillingFieldGrid
            normalized={stripeConfig.data as unknown as Record<string, unknown>}
            raw={stripeConfig.data.raw}
          />
        )}
      </Card>

      <Card className="p-4 space-y-4">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Gateway settings</CardTitle>
        </CardHeader>
        {stripeSettings.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {stripeSettings.isError && (
          <PlatformBillingErrorAlert error={stripeSettings.error} onRetry={() => stripeSettings.refetch()} />
        )}
        {settingsView && (
          <PlatformBillingFieldGrid
            normalized={settingsView as unknown as Record<string, unknown>}
            raw={settingsView.raw}
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
            if (gwBankAccountId.trim()) dto.bank_account_id = gwBankAccountId.trim();
            if (gwFeeGlAccountId.trim()) dto.fee_gl_account_id = gwFeeGlAccountId.trim();
            if (Object.keys(dto).length === 0) {
              setActionError('Change at least one field before saving.');
              return;
            }
            void run('Settings update', async () => {
              await updateSettings.mutateAsync(dto);
              setGwSecret('');
              setGwWebhookSecret('');
            });
          }}
        >
          <ToggleField
            label="Enabled"
            checked={gwEnabled ?? settingsView?.isEnabled ?? false}
            onChange={setGwEnabled}
          />
          <ToggleField
            label="Use platform account"
            checked={gwUsePlatform ?? usePlatformFromRaw ?? false}
            onChange={setGwUsePlatform}
          />
          <ToggleField
            label="Allow partial payments"
            checked={gwAllowPartial ?? allowPartialFromRaw ?? false}
            onChange={setGwAllowPartial}
          />
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] sm:col-span-2">
            Publishable key (leave blank to keep current)
            <Input
              value={gwPublishable}
              onChange={(e) => setGwPublishable(e.target.value)}
              placeholder={
                settingsView?.publishableKey ??
                (typeof settingsView?.raw?.publishable_key === 'string'
                  ? settingsView.raw.publishable_key
                  : undefined)
              }
              autoComplete="off"
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
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Bank account ID
            <Input value={gwBankAccountId} onChange={(e) => setGwBankAccountId(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Fee GL account ID
            <Input value={gwFeeGlAccountId} onChange={(e) => setGwFeeGlAccountId(e.target.value)} />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={updateSettings.isPending}>
              Save settings
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={rotateWebhook.isPending}
            onClick={() => void run('Webhook rotation', () => rotateWebhook.mutateAsync())}
          >
            Rotate webhook
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={reconcile.isPending}
            onClick={() => void run('Reconcile', () => reconcile.mutateAsync({}))}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reconcile.isPending ? 'animate-spin' : ''}`} />
            Reconcile
          </Button>
        </div>
      </Card>
    </div>
  );
}
