import { hrMenu, reportsHrTile } from '../../features/hr/config/hrMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function HrMenuPage() {
  return (
    <ModuleMenuShell title="HR" tiles={hrMenu} featuredTile={reportsHrTile} className="bg-white" />
  );
}
