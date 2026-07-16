import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountsCreatePageLayout } from '@/features/accounts/components';
import { SAVED_REPORT_ROUTE_PREFIX } from '../api/savedReport.api';
import { SavedReportForm } from '../components/SavedReportForm';
import { useCreateSavedReport } from '../hooks/useSavedReports';
import type { CreateSavedReportFormValues } from '../types/savedReport.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function SavedReportCreatePage() {
  const navigate = useNavigate();
  const create = useCreateSavedReport();
  const [error, setError] = useState<string | null>(null);

  return (
    <AccountsCreatePageLayout
      backLabel="Back to My Reports"
      backTo={SAVED_REPORT_ROUTE_PREFIX}
      title="Save report"
      subtitle="Keep a report type and its filters so you can reopen them quickly."
      error={error}
    >
      <SavedReportForm
        mode="create"
        isSubmitting={create.isPending}
        onCancel={() => navigate(SAVED_REPORT_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateSavedReportFormValues);
            navigate(`${SAVED_REPORT_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </AccountsCreatePageLayout>
  );
}
