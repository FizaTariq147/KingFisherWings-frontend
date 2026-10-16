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

const REPORTS = [
  {
    key: 'job-not-invoiced-do',
    title: 'Job not invoiced (DO)',
    description: 'DO-released jobs with uninvoiced sale charges and aging.',
    icon: Wallet,
    path: '/operations/reports/job-not-invoiced-do',
  },
  {
    key: 'job-finance-report',
    title: 'Job finance by shipment date',
    description: 'Revenue, cost, GP and uninvoiced sale by shipment / job date.',
    icon: BarChart3,
    path: '/operations/reports/job-finance-report',
  },
  {
    key: 'exceptions',
    title: 'Exceptions',
    description: 'ATD without BL, missing ATA, DO uninvoiced, overdue close, and more.',
    icon: AlertTriangle,
    path: '/operations/reports/exceptions',
  },
  {
    key: 'kpi-status',
    title: 'KPI status',
    description: 'Jobs in range with KPI completion flags.',
    icon: ClipboardList,
    path: '/operations/reports/kpi-status',
  },
  {
    key: 'job-list-summary',
    title: 'Job list summary',
    description: 'Summary columns with chargeable units; job / shipment / voucher date basis.',
    icon: FileSpreadsheet,
    path: '/operations/reports/job-list-summary',
  },
  {
    key: 'voyage-jobs-shipments',
    title: 'Voyage jobs & shipments',
    description: 'Combined job + shipment list filtered by voyage / vessel.',
    icon: Ship,
    path: '/operations/reports/voyage-jobs-shipments',
  },
  {
    key: 'closed-job-report',
    title: 'Closed job report',
    description: 'Closed jobs in the selected date window.',
    icon: FileCheck,
    path: '/operations/reports/closed-job-report',
  },
] as const;

export default function OperationsReportsHubPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-neutral-900)]">
          Operations reports
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Finance, exceptions, KPI, and voyage packs for ops and costing.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
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
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
