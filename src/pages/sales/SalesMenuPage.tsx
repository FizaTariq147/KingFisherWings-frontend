import { salesMenu, reportsSalesTile } from '../../features/sales/config/salesMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function SalesMenuPage() {
  return (
    <ModuleMenuShell
      title="Sales"
      tiles={salesMenu}
      featuredTile={reportsSalesTile}
      className="bg-white"
    />
  );
}
