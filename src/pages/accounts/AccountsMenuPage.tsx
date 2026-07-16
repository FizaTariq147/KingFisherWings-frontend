import { accountsMenu } from '../../features/chartOfAccounts/config/accountsMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function AccountsMenuPage() {
  return <ModuleMenuShell title="accounts" tiles={accountsMenu} />;
}
