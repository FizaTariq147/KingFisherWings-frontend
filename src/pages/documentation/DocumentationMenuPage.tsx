import { documentationMenu, reportsDocsTile } from '../../features/documents/config/documentationMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function DocumentationMenuPage() {
  return (
    <ModuleMenuShell
      title="Documentation"
      tiles={documentationMenu}
      featuredTile={reportsDocsTile}
    />
  );
}
