import { managementMenu, reportsMisTile } from '../../features/management/config/managementMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function ManagementMenuPage() {
  return (
    <ModuleMenuShell
      title="Management"
      tiles={managementMenu}
      featuredTile={reportsMisTile}
    />
  );
}
