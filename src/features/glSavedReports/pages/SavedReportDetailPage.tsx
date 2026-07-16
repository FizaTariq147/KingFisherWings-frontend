import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { SAVED_REPORT_ROUTE_PREFIX } from '../api/savedReport.api';
import { SAVED_REPORT_TYPE_LABELS } from '../constants/savedReport.constants';
import { useDeleteSavedReport, useSavedReport } from '../hooks/useSavedReports';
import { getErrorMessage } from '../utils/getErrorMessage';

function reportRunPath(reportType: string): string | null {
  switch (reportType) {
    case 'BALANCE_SHEET':
    case 'PROFIT_AND_LOSS':
    case 'CASH_FLOW':
    case 'TRIAL_BALANCE':
    case 'VAT_RETURN':
      return '/gl/reports';
    case 'AR_AGING':
      return '/gl/ar/aging';
    case 'AP_AGING':
      return '/gl/ap/aging';
    case 'MIS_DASHBOARD':
    case 'JOB_PROFITABILITY':
      return '/gl/mis/dashboard';
    default:
      return null;
  }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

export default function SavedReportDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: report, isLoading, isError, error, refetch } = useSavedReport(id);
  const remove = useDeleteSavedReport();

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !report) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Saved report not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const runPath = reportRunPath(report.report_type);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(SAVED_REPORT_ROUTE_PREFIX)}
      >
        ← My Reports
      </button>

      <div className="flex flex-wrap gap-2 items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{report.name}</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            {SAVED_REPORT_TYPE_LABELS[report.report_type]}
            {report.is_shared ? ' · Shared' : ' · Private'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {runPath ? (
            <Button type="button" onClick={() => navigate(runPath)}>
              Open report
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`${SAVED_REPORT_ROUTE_PREFIX}/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (!window.confirm('Delete this saved report?')) return;
              await remove.mutateAsync(id);
              navigate(SAVED_REPORT_ROUTE_PREFIX);
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Field label="Report type" value={SAVED_REPORT_TYPE_LABELS[report.report_type]} />
          <Field label="Shared" value={report.is_shared ? 'Yes' : 'No'} />
          <Field label="Company ID" value={report.company_id} />
          <Field label="Created" value={report.created_at} />
          <Field label="Updated" value={report.updated_at} />
          <div className="sm:col-span-2">
            <Field label="Description" value={report.description} />
          </div>
        </dl>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-[var(--color-neutral-700)] mb-2">Filters</h3>
        <pre className="text-xs bg-[var(--color-neutral-50)] rounded-md p-3 overflow-x-auto">
          {JSON.stringify(report.filters ?? {}, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
