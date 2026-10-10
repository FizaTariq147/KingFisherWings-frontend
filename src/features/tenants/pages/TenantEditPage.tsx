import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { TenantForm } from '../components/TenantForm';
import { useTenant, useUpdateTenant } from '../hooks/useTenants';
import type { UpdateTenantFormValues } from '../types/tenant.types';
import { formatTenantSlug } from '../utils/formatTenantSlug';

export default function TenantEditPage() {
  const { id } = useParams();
  const { goBack } = useReturnNavigation(`/superadmin/tenants/${id}`);
  const { data: tenant, isLoading, isError } = useTenant(id!);
  const updateTenant = useUpdateTenant(id!);
  const [apiError, setApiError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading tenant…</p>;
  }

  if (isError || !tenant) {
    return (
      <div
        role="alert"
        className="rounded-lg border px-4 py-3 text-sm"
        style={{
          background: 'var(--color-danger-100)',
          borderColor: '#FECACA',
          color: 'var(--color-danger-700)',
        }}
      >
        Tenant not found or failed to load.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <FormPageHeader
        title={`Edit ${tenant.display_name}`}
        subtitle={`${tenant.code} · ${formatTenantSlug(tenant.slug)}`}
        onBack={goBack}
        backLabel="Back to tenant"
      />

      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <TenantForm
        mode="edit"
        defaultValues={{
          ...tenant,
          trial_ends: toDateInputValue(tenant.trial_ends),
          subscription_ends: toDateInputValue(tenant.subscription_ends),
        }}
        isSubmitting={updateTenant.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          setApiError(null);
          try {
            await updateTenant.mutateAsync(values as UpdateTenantFormValues);
            goBack();
          } catch (err) {
            const message =
              err instanceof Error ? err.message : 'Failed to save changes. Please try again.';
            setApiError(message);
          }
        }}
      />
    </div>
  );
}

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
