import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AccountsCreatePageLayout } from '@/features/accounts/components';
import { isTenantUserManagerRole, resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';
import { CHART_OF_ACCOUNT_ROUTE_PREFIX } from '../api/chartOfAccount.api';
import { ChartOfAccountForm } from '../components/ChartOfAccountForm';
import { useChartOfAccounts, useCreateChartOfAccount } from '../hooks/useChartOfAccounts';
import type { CreateChartOfAccountFormValues } from '../types/chartOfAccount.types';
import {
  canManageChartOfAccounts,
  formatPermissionError,
  GL_MANAGE_COA_DENIED_MESSAGE,
} from '../utils/coaPermissions';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ChartOfAccountCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const create = useCreateChartOfAccount();
  const { data: listData } = useChartOfAccounts({ is_active: true });
  const [error, setError] = useState<string | null>(null);

  const isTenantAdmin = isTenantUserManagerRole(resolveAuthRoleSlug(user?.role));
  const permissionBlocked = !canManageChartOfAccounts({
    permissions: user?.permissions,
    role: user?.role,
  });

  return (
    <AccountsCreatePageLayout
      backLabel="Back to chart of accounts"
      backTo={CHART_OF_ACCOUNT_ROUTE_PREFIX}
      title="Create GL account"
      subtitle="Add a postable or header account to the ledger."
      banner={permissionBlocked ? GL_MANAGE_COA_DENIED_MESSAGE : undefined}
      error={error}
    >
      <ChartOfAccountForm
        mode="create"
        parentOptions={listData?.accounts ?? []}
        isSubmitting={create.isPending || permissionBlocked}
        onCancel={() => navigate(CHART_OF_ACCOUNT_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          if (permissionBlocked) {
            setError(GL_MANAGE_COA_DENIED_MESSAGE);
            return;
          }
          try {
            const created = await create.mutateAsync(values as CreateChartOfAccountFormValues);
            navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(formatPermissionError(getErrorMessage(err), { isTenantAdmin }));
          }
        }}
      />
    </AccountsCreatePageLayout>
  );
}
