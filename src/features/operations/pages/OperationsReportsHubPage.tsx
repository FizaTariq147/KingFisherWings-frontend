import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Ship,
  Wallet,
  ClipboardList,
  FileCheck,
} from 'lucide-react';
import { OPERATIONS_REPORTS } from '../config/operationsReports';
import type { OperationsReportKey } from '../types/operations.types';

const ICONS: Record<OperationsReportKey, typeof Wallet> = {
  'job-not-invoiced-do': Wallet,
  'job-finance-report': BarChart3,
  exceptions: AlertTriangle,
  'kpi-status': ClipboardList,
  'job-list-summary': FileSpreadsheet,
  'voyage-jobs-shipments': Ship,
  'closed-job-report': FileCheck,
};

export default function OperationsReportsHubPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-900)]">
            Operations reports
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Live ops analytics from `/operations/*`. Format PDFs stay in the Reports catalogue.
          </p>
        </div>
        <Link
          to="/reports/catalog"
          className="text-sm text-[var(--color-primary-700)] hover:underline"
        >
          Report formats catalogue
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OPERATIONS_REPORTS.map((r) => {
          const Icon = ICONS[r.key];
          return (
            <Link
              key={r.key}
              to={r.path}
              className="group rounded-md border border-[var(--color-neutral-200)] bg-white p-4 transition hover:border-[var(--color-primary-300)] hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)]">
                    {r.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{r.description}</p>
                  {r.formatCode ? (
                    <p className="mt-1.5 truncate text-[10px] text-[var(--color-neutral-400)]">
                      {r.formatCode}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
