import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePlatformOnboardingStore } from '@/features/platform/store/platformOnboardingStore';
import { CompanyForm } from '../components/CompanyForm';
import { CompanyTenantSelector } from '../components/CompanyTenantSelector';
import { useCompanyTenantScope } from '../hooks/useCompanyTenantScope';

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const { tenantId, companiesBasePath } = useCompanyTenantScope();
  const addDraftCompany = usePlatformOnboardingStore((s) => s.addDraftCompany);
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const [apiError, setApiError] = useState<string | null>(null);

  const isOnboarding = !tenantId;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate(companiesBasePath)}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
      >
        ← Back to companies
      </button>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create Company</h2>
      </div>

      {isOnboarding ? (
        <CompanyForm
          mode="create"
          layout="wizard"
          defaultValues={draftCompanies[0] ?? undefined}
          submitLabel="Save company draft"
          onCancel={() => navigate(companiesBasePath)}
          onSubmit={async (values) => {
            setApiError(null);
            addDraftCompany(values as Parameters<typeof addDraftCompany>[0]);
            navigate('/superadmin/tenants/new');
          }}
        />
      ) : (
        <div className="mx-auto max-w-4xl space-y-4">
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

          <Card className="space-y-3 p-6">
            <p className="text-sm text-[var(--color-neutral-600)]">
              Company profiles for platform admin come from <code className="text-xs">/tenants</code>
              . Open the tenant to edit company fields.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(`/superadmin/tenants/${tenantId}/edit`)}>
                Edit tenant company profile
              </Button>
              <Button variant="secondary" onClick={() => navigate(companiesBasePath)}>
                Back to companies
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
