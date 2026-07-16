import { financeMenu } from '../../features/invoices/config/financeMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function FinanceMenuPage() {
  return <ModuleMenuShell title="Finance" tiles={financeMenu} />;
}
