import { useMemo, useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  BILLING_INTERVALS,
  type CreateBillingPlanDto,
} from '../types/platformBilling.types';
import {
  useCreatePlatformBillingPlan,
  useDeletePlatformBillingPlan,
  usePlatformBillingPlans,
  useUpdatePlatformBillingPlan,
} from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from '../components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '../components/PlatformBillingFieldGrid';
import { PlatformBillingListPager } from '../components/PlatformBillingListPager';
import type { BillingPlan } from '../types/platformBilling.types';

const PAGE_SIZE = 20;

const emptyCreateForm = (): CreateBillingPlanDto => ({
  code: '',
  name: '',
  description: '',
  subscription_plan: '',
  amount: 0,
  currency_code: '',
  interval: 'MONTH',
  sync_to_stripe: true,
});

export default function PlatformBillingPlansPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateBillingPlanDto>(emptyCreateForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePlatformBillingPlans({
    page,
    limit: PAGE_SIZE,
  });
  const createPlan = useCreatePlatformBillingPlan();

  const plans = data?.items ?? [];

  const subscriptionPlanOptions = useMemo(() => {
    const set = new Set<string>();
    for (const plan of plans) {
      if (plan.subscriptionPlan?.trim()) set.add(plan.subscriptionPlan.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [plans]);

  const intervalOptions = useMemo(() => {
    const set = new Set<string>(BILLING_INTERVALS);
    for (const plan of plans) {
      if (plan.interval?.trim()) set.add(plan.interval.trim().toUpperCase());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [plans]);

  const currencyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const plan of plans) {
      if (plan.currencyCode?.trim()) set.add(plan.currencyCode.trim().toUpperCase());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [plans]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.subscription_plan.trim()) {
      setCreateError('Subscription plan is required.');
      return;
    }
    if (!createForm.currency_code.trim()) {
      setCreateError('Currency code is required.');
      return;
    }
    try {
      await createPlan.mutateAsync({
        ...createForm,
        subscription_plan: createForm.subscription_plan.trim().toUpperCase(),
        currency_code: createForm.currency_code.trim().toUpperCase(),
        amount: Number(createForm.amount),
        description: createForm.description?.trim() || undefined,
      });
      setCreateForm(emptyCreateForm());
      setShowCreate(false);
    } catch (err) {
      setCreateError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/superadmin/billing" label="Back to billing hub" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={appType.pageTitle}>Billing plans</h2>
          <p className="text-sm text-[var(--color-neutral-400)]">Platform subscription plans and Stripe sync</p>
        </div>
        <Button type="button" size="sm" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Hide form' : 'New plan'}
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 space-y-4">
          <CardHeader className="p-0 mb-0">
            <CardTitle className="text-base">Create plan</CardTitle>
          </CardHeader>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void handleCreate(e)}>
            <Field label="Code">
              <Input
                value={createForm.code}
                onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value }))}
                required
              />
            </Field>
            <Field label="Name">
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </Field>
            <Field label="Subscription plan">
              <Input
                list="platform-billing-subscription-plan-options"
                value={createForm.subscription_plan}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    subscription_plan: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="From existing plans or API"
                required
              />
              <datalist id="platform-billing-subscription-plan-options">
                {subscriptionPlanOptions.map((code) => (
                  <option key={code} value={code} />
                ))}
              </datalist>
            </Field>
            <Field label="Interval">
              <Input
                list="platform-billing-interval-options"
                value={createForm.interval}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, interval: e.target.value.toUpperCase() }))
                }
                required
              />
              <datalist id="platform-billing-interval-options">
                {intervalOptions.map((iv) => (
                  <option key={iv} value={iv} />
                ))}
              </datalist>
            </Field>
            <Field label="Amount">
              <Input
                type="number"
                step="0.01"
                value={createForm.amount}
                onChange={(e) => setCreateForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                required
              />
            </Field>
            <Field label="Currency">
              <Input
                list="platform-billing-currency-options"
                value={createForm.currency_code}
                onChange={(e) => setCreateForm((f) => ({ ...f, currency_code: e.target.value.toUpperCase() }))}
                required
                maxLength={3}
                placeholder="ISO 4217"
              />
              <datalist id="platform-billing-currency-options">
                {currencyOptions.map((code) => (
                  <option key={code} value={code} />
                ))}
              </datalist>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Input
                value={createForm.description ?? ''}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
            <Field label="Stripe price ID">
              <Input
                value={createForm.stripe_price_id ?? ''}
                onChange={(e) => setCreateForm((f) => ({ ...f, stripe_price_id: e.target.value || undefined }))}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={Boolean(createForm.sync_to_stripe)}
                onChange={(e) => setCreateForm((f) => ({ ...f, sync_to_stripe: e.target.checked }))}
              />
              Sync to Stripe
            </label>
            {createError && (
              <p className="text-sm text-[var(--color-danger-700)] sm:col-span-2" role="alert">
                {createError}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" disabled={createPlan.isPending}>
                Create plan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isError && <PlatformBillingErrorAlert error={error} onRetry={() => refetch()} />}
      {isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading plans…</p>}

      <div className="space-y-3">
        {plans.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            editing={editingId === plan.id}
            onEdit={() => setEditingId(editingId === plan.id ? null : plan.id)}
            onCloseEdit={() => setEditingId(null)}
          />
        ))}
        {plans.length === 0 && !isLoading && !isError && (
          <Card className="p-4 text-sm text-[var(--color-neutral-500)]">No plans found.</Card>
        )}
      </div>

      <PlatformBillingListPager meta={data?.meta} page={page} onPageChange={setPage} />
    </div>
  );
}

function PlanRow({
  plan,
  editing,
  onEdit,
  onCloseEdit,
}: {
  plan: BillingPlan;
  editing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
}) {
  const updatePlan = useUpdatePlatformBillingPlan(plan.id);
  const deletePlan = useDeletePlatformBillingPlan();
  const [name, setName] = useState(plan.name ?? '');
  const [description, setDescription] = useState(plan.description ?? '');
  const [stripePriceId, setStripePriceId] = useState(plan.stripePriceId ?? '');
  const [actionError, setActionError] = useState<string | null>(null);

  const runUpdate = async (patch: Parameters<typeof updatePlan.mutateAsync>[0]) => {
    setActionError(null);
    try {
      await updatePlan.mutateAsync(patch);
      onCloseEdit();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const deactivate = () => void runUpdate({ is_active: false });
  const activate = () => void runUpdate({ is_active: true });

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    void runUpdate({
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      stripe_price_id: stripePriceId.trim() || undefined,
    });
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--color-neutral-800)]">
            {plan.name || plan.code || plan.id}
          </p>
          <p className="text-xs text-[var(--color-neutral-500)] font-mono">{plan.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {plan.isActive === false ? (
            <Badge variant="neutral">Inactive</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
          <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
            {editing ? 'Close' : 'Edit'}
          </Button>
          {plan.isActive !== false ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={updatePlan.isPending}
              onClick={deactivate}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={updatePlan.isPending}
              onClick={activate}
            >
              Activate
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={deletePlan.isPending}
            onClick={() => {
              if (!window.confirm('Delete this plan permanently?')) return;
              void deletePlan.mutateAsync(plan.id).catch((err) => setActionError(getErrorMessage(err)));
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      <PlatformBillingFieldGrid normalized={plan as unknown as Record<string, unknown>} raw={plan.raw} />
      {editing && (
        <form className="grid gap-3 sm:grid-cols-2 border-t pt-3" onSubmit={saveEdit}>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Stripe price ID">
            <Input value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={updatePlan.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      )}
      {actionError && (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {actionError}
        </p>
      )}
    </Card>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="text-xs text-[var(--color-neutral-500)]">{label}</span>
      {children}
    </label>
  );
}
