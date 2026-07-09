import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { TenantForm } from '../components/TenantForm';
import { useCreateTenant } from '../hooks/useTenants';

export default function TenantCreatePage() {
  const navigate = useNavigate();
  const createTenant = useCreateTenant();
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => navigate('/superadmin/tenants')}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors"
      >
        ← Back to tenants
      </button>

      <div>
        <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">New tenant</h1>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Provision a new workspace and admin account
        </p>
      </div>

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
        mode="create"
        isSubmitting={createTenant.isPending}
        onSubmit={async (values) => {
          setApiError(null);
          try {
            const tenant = await createTenant.mutateAsync(
              values as Parameters<typeof createTenant.mutateAsync>[0],
            );
            navigate(`/superadmin/tenants/${tenant.id}`);
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create tenant. Please try again.';
            setApiError(message);
          }
        }}
      />
    </div>
  );
}
