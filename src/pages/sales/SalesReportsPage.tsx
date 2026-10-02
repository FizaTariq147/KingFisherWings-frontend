import { Link } from 'react-router-dom';
import { salesMenu } from '@/features/sales/config/salesMenu';
import { ReportsHubPage } from '@/features/reports/components/ReportsHubPage';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CRM_REPORT_TYPES, crmLabel } from '@/features/crm/constants/crm.constants';

/** Sales report entry points shown on Reports - Sales hub. */
export const salesReportHubTiles = salesMenu.filter((tile) =>
  [
    'sales-dashboard',
    'sales-budget',
    'visiting-card-list-report',
    'shipments-list-sales',
    'call-sheet',
    'lead',
    'enquiries',
    'follow-ups',
  ].includes(tile.id),
);

export default function SalesReportsPage() {
  return (
    <div className="space-y-6">
      <ReportsHubPage
        title="Reports - Sales"
        backTo="/sales"
        backLabel="Back to Sales"
        tiles={salesReportHubTiles}
      />

      <Card className="p-4">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-base">CRM sales reports</CardTitle>
        </CardHeader>
        <p className="mb-3 text-sm text-[var(--color-neutral-500)]">
          Open the Sales Dashboard with a specific report type from{' '}
          <code className="text-xs">GET /crm/reports/{'{type}'}</code>.
        </p>
        <div className="flex flex-wrap gap-2">
          {CRM_REPORT_TYPES.map((type) => (
            <Link
              key={type}
              to={`/sales/sales-dashboard?report=${encodeURIComponent(type)}`}
              className="rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] hover:border-[var(--color-primary-400)] hover:text-[var(--color-primary-700)]"
            >
              {crmLabel(type)}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
