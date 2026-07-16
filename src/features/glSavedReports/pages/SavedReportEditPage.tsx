import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SAVED_REPORT_ROUTE_PREFIX } from '../api/savedReport.api';
import { SavedReportForm } from '../components/SavedReportForm';
import { useSavedReport, useUpdateSavedReport } from '../hooks/useSavedReports';
import type { UpdateSavedReportFormValues } from '../types/savedReport.types';
import { savedReportToFormValues } from '../utils/savedReportToFormValues';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function SavedReportEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: report, isLoading, isError, error } = useSavedReport(id);
  const update = useUpdateSavedReport(id);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !report) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Saved report not found.'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${SAVED_REPORT_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to saved report
      </button>
      <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit saved report</h2>
      {saveError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {saveError}
        </div>
      )}
      <SavedReportForm
        mode="edit"
        defaultValues={savedReportToFormValues(report)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${SAVED_REPORT_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setSaveError(null);
          try {
            await update.mutateAsync(values as UpdateSavedReportFormValues);
            navigate(`${SAVED_REPORT_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setSaveError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
