import type { MenuTile } from '@/features/customers/types/menu.types';
import { ReportsHubPage } from '@/features/reports/components/ReportsHubPage';

/** NVOCC report tiles — intentionally empty until report screens are ready. */
export const nvoccReportHubTiles: MenuTile[] = [];

export default function NvoccReportsPage() {
  return (
    <ReportsHubPage
      title="Reports - NVOCC"
      backTo="/nvocc"
      backLabel="Back to NVOCC"
      tiles={nvoccReportHubTiles}
    />
  );
}
