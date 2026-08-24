import { documentationMenu } from '@/features/documents/config/documentationMenu';
import { ReportsHubPage } from '@/features/reports/components/ReportsHubPage';

const documentationReportTiles = documentationMenu.filter((tile) =>
  ['all-jobs', 'boe-dashboard', 'bayan-edi-job-list', 'bayan-edi-shipment-house-list', 'bulk-cost-entry'].includes(
    tile.id,
  ),
);

export default function DocumentationReportsPage() {
  return (
    <ReportsHubPage
      title="Reports - Docs"
      backTo="/documentation"
      backLabel="Back to Documentation"
      tiles={documentationReportTiles}
    />
  );
}
