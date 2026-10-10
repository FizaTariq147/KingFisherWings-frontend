import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { CHART_OF_ACCOUNT_ROUTE_PREFIX } from '../api/chartOfAccount.api';
import { ChartOfAccountForm } from '../components/ChartOfAccountForm';
import {
  useChartOfAccount,
  useChartOfAccounts,
  useUpdateChartOfAccount,
} from '../hooks/useChartOfAccounts';
import type { UpdateChartOfAccountFormValues } from '../types/chartOfAccount.types';
import { chartOfAccountToFormValues } from '../utils/chartOfAccountToFormValues';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ChartOfAccountEditPage() {
  const { id = '' } = useParams();
  const { goBack } = useReturnNavigation(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/${id}`);
  const { data: account, isLoading, isError, error } = useChartOfAccount(id);
  const { data: listData } = useChartOfAccounts({ is_active: true });
  const update = useUpdateChartOfAccount(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !account) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Account not found.'}
      </p>
    );
  }

  const parentOptions = (listData?.accounts ?? []).filter((a) => a.id !== id);

  return (
    <div className="space-y-4">
      <FormPageHeader
        title={`Edit ${account.account_code}`}
        subtitle={account.account_name}
        onBack={goBack}
        backLabel="Back to account"
      />
      {formError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {formError}
        </div>
      )}
      <ChartOfAccountForm
        mode="edit"
        defaultValues={chartOfAccountToFormValues({
          ...account,
          parent_id: account.parent_id ?? undefined,
        })}
        parentOptions={parentOptions}
        isSubmitting={update.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateChartOfAccountFormValues);
            goBack();
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
