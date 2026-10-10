import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { CompanyForm } from '../components/CompanyForm';
import { CompanyTenantSelector } from '../components/CompanyTenantSelector';
import { useCompany, useUpdateCompany } from '../hooks/useCompanies';
import { useCompanyTenantScope } from '../hooks/useCompanyTenantScope';
import type { UpdateCompanyFormValues } from '../types/company.types';

export default function CompanyEditPage() {
  const { id } = useParams();
  const { tenantId, companyPath } = useCompanyTenantScope();
  const detailPath = companyPath(`/${id}`);
  const { goBack } = useReturnNavigation(detailPath);
  const { data: company, isLoading, isError } = useCompany(tenantId, id!);
  const updateCompany = useUpdateCompany(tenantId, id!);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!tenantId) {
    return (
      <Card className="p-6 text-sm text-[var(--color-neutral-500)]">
        <CompanyTenantSelector />
        <p className="mt-4">Select a tenant workspace to edit this company.</p>
      </Card>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading company…</p>;
  }

  if (isError || !company) {
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
        Company not found or failed to load.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <FormPageHeader
        title={`Edit ${company.name}`}
        subtitle={company.code}
        onBack={goBack}
        backLabel="Back to company"
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

      <CompanyForm
        mode="edit"
        defaultValues={company}
        isSubmitting={updateCompany.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          setApiError(null);
          try {
            await updateCompany.mutateAsync(values as UpdateCompanyFormValues);
            goBack();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save changes.';
            setApiError(message);
          }
        }}
      />
    </div>
  );
}
