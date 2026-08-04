import { settingsMenu } from '../../features/settings/config/settingsMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function SettingsMenuPage() {
  return <ModuleMenuShell title="Settings" tiles={settingsMenu} />;
}
