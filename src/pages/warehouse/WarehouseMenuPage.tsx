import { ModuleMenuShell } from '@/components/widgets/ModuleMenuShell';
import { wmsMenu } from '@/features/wms/config/wmsMenu';

export default function WarehouseMenuPage() {
  return <ModuleMenuShell title="Warehouse" tiles={wmsMenu} compact hideTitleBar />;
}
