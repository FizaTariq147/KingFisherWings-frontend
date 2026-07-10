import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { usePlatformOnboardingStore } from '@/features/platform/store/platformOnboardingStore';
import { CompanyForm } from '../components/CompanyForm';
import { CompanyTenantSelector } from '../components/CompanyTenantSelector';
import { useCreateCompany } from '../hooks/useCompanies';
import { useCompanyTenantScope } from '../hooks/useCompanyTenantScope';

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const { tenantId, companiesBasePath, companyPath } = useCompanyTenantScope();
  const createCompany = useCreateCompany(tenantId);
  const addDraftCompany = usePlatformOnboardingStore((s) => s.addDraftCompany);
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const [apiError, setApiError] = useState<string | null>(null);

  const isOnboarding = !tenantId;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => navigate(companiesBasePath)}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
      >
        ← Back to companies
      </button>

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Step 1 — Register company</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          {isOnboarding
            ? 'Save the company profile first. It will appear in the company list even before a tenant exists.'
            : 'Register an additional company under an existing tenant workspace.'}
        </p>
      </div>

      {isOnboarding ? (
        <CompanyForm
          mode="create"
          defaultValues={draftCompanies[0] ?? undefined}
          submitLabel="Save company"
          onSubmit={async (values) => {
            setApiError(null);
            addDraftCompany(values as Parameters<typeof addDraftCompany>[0]);
            navigate('/superadmin/companies');
          }}
        />
      ) : (
        <>
          <Card className="p-4">
            <CompanyTenantSelector />
          </Card>

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

          <CompanyForm
            mode="create"
            isSubmitting={createCompany.isPending}
            onSubmit={async (values) => {
              setApiError(null);
              try {
                const company = await createCompany.mutateAsync(
                  values as Parameters<typeof createCompany.mutateAsync>[0],
                );
                navigate(companyPath(`/${company.id}`));
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to create company.';
                setApiError(message);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
