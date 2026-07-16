import { customerServiceMenu } from '../../features/customers/config/customerServiceMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function CustomerServiceMenuPage() {
  return <ModuleMenuShell title="Customer Service" tiles={customerServiceMenu} />;
}
