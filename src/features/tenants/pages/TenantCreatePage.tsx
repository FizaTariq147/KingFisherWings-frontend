import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NO_COMPANY_BEFORE_TENANT_MESSAGE } from '@/features/platform/constants/onboarding';
import { usePlatformOnboardingStore } from '@/features/platform/store/platformOnboardingStore';
import { mapDraftCompanyToTenantForm } from '@/features/platform/utils/mapPendingCompanyToTenantForm';
import { useCompanyRegistry } from '@/features/companies/hooks/useCompanies';
import { authService } from '@/features/auth/services/auth.service';
import { TenantForm } from '../components/TenantForm';
import { useCreateTenant, useActivateTenant } from '../hooks/useTenants';
import { wakeApi } from '@/lib/wakeApi';

export default function TenantCreatePage() {
  const navigate = useNavigate();
  const createTenant = useCreateTenant();
  const activateTenant = useActivateTenant();
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const removeDraftCompany = usePlatformOnboardingStore((s) => s.removeDraftCompany);
  const setLastProvisionedTenantId = usePlatformOnboardingStore((s) => s.setLastProvisionedTenantId);
  const { data: companiesData, isLoading: companiesLoading } = useCompanyRegistry({ limit: 200 });
  const [apiError, setApiError] = useState<string | null>(null);

  const hasCompanyProfile =
    draftCompanies.length > 0 || (companiesData?.companies.length ?? 0) > 0;

  const defaultValues = useMemo(
    () => (draftCompanies[0] ? mapDraftCompanyToTenantForm(draftCompanies[0]) : undefined),
    [draftCompanies],
  );

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
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Step 2 — Create tenant</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Provision a workspace that belongs to an existing company
        </p>
      </div>

      {!companiesLoading && !hasCompanyProfile ? (
        <Card className="p-6 space-y-4">
          <p className="text-sm text-[var(--color-neutral-700)]">{NO_COMPANY_BEFORE_TENANT_MESSAGE}</p>
          <Button onClick={() => navigate('/superadmin/companies/new')}>Create company</Button>
        </Card>
      ) : (
        <>
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
            defaultValues={defaultValues}
            isSubmitting={createTenant.isPending}
            onSubmit={async (values) => {
              setApiError(null);
              try {
                await wakeApi();
                const formValues = values as Parameters<typeof createTenant.mutateAsync>[0];
                const tenant = await createTenant.mutateAsync(formValues);
                try {
                  await activateTenant.mutateAsync(tenant.id);
                } catch {
                  // Create may already leave tenant active; ignore activate failures.
                }

                const loginSlug = String(formValues.slug || tenant.slug || '')
                  .trim()
                  .toLowerCase();
                const loginPassword = String(formValues.password || '');
                const loginEmail = String(formValues.email || '')
                  .trim()
                  .toLowerCase();

                let loginVerifyOk: boolean | undefined;
                let loginVerifyVia: 'staff' | 'tenant' | undefined;
                let loginVerifyMessage: string | undefined;
                if (loginSlug && loginPassword) {
                  const verify = await authService.verifyTenantCredentials({
                    tenant_slug: loginSlug,
                    password: loginPassword,
                  });
                  loginVerifyOk = verify.ok;
                  if (verify.ok) {
                    loginVerifyVia = verify.via;
                  } else {
                    loginVerifyMessage = verify.message;
                  }
                }

                const selectedCompanyId = (values as { selected_company_id?: string })
                  .selected_company_id;
                if (selectedCompanyId) {
                  removeDraftCompany(selectedCompanyId);
                }
                setLastProvisionedTenantId(tenant.id);
                navigate(`/superadmin/tenants/${tenant.id}`, {
                  state: {
                    fromTenantCreate: true,
                    tenantLoginSlug: loginSlug,
                    tenantLoginPassword: loginPassword,
                    tenantLoginEmail: loginEmail,
                    loginVerifyOk,
                    loginVerifyVia,
                    loginVerifyMessage,
                  },
                });
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : 'Failed to create tenant. Please try again.';
                setApiError(message);
              }
            }}
          />

          <p className="text-xs text-[var(--color-neutral-400)]">
            Need another company first?{' '}
            <Link
              to="/superadmin/companies/new"
              className="font-medium text-[var(--color-primary-500)] hover:underline"
            >
              Register company
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
