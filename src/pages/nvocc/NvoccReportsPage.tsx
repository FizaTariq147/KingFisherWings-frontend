import { nvoccMenu } from '@/features/nvocc/config/nvoccMenu';
import { ReportsHubPage } from '@/features/reports/components/ReportsHubPage';

export default function NvoccReportsPage() {
  return (
    <ReportsHubPage
      title="Reports - NVOCC"
      backTo="/nvocc"
      backLabel="Back to NVOCC"
      tiles={nvoccMenu}
    />
  );
}
