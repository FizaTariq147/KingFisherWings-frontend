import { mastersMenu } from '../../features/masters/config/mastersMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function MastersMenuPage() {
  return <ModuleMenuShell title="Masters" tiles={mastersMenu} />;
}
