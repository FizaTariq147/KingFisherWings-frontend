import { vendorServiceMenu } from '../../features/vendors/config/vendorServiceMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function VendorServiceMenuPage() {
  return <ModuleMenuShell title="Vendors" tiles={vendorServiceMenu} />;
}
