import { salesMenu } from '@/features/sales/config/salesMenu';
import { ReportsHubPage } from '@/features/reports/components/ReportsHubPage';

/** Sales report entry points shown on Reports - Sales hub. */
export const salesReportHubTiles = salesMenu.filter((tile) =>
  ['sales-dashboard', 'sales-budget', 'visiting-card-list-report', 'shipments-list-sales'].includes(
    tile.id,
  ),
);

export default function SalesReportsPage() {
  return (
    <ReportsHubPage
      title="Reports - Sales"
      backTo="/sales"
      backLabel="Back to Sales"
      tiles={salesReportHubTiles}
    />
  );
}
