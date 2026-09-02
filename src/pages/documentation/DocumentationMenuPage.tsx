import { documentationMenu, reportsDocsTile } from '../../features/documents/config/documentationMenu';
import { DocumentationPermissionNotice } from '@/features/documentation/components/DocumentationPermissionNotice';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function DocumentationMenuPage() {
  return (
    <div className="space-y-3">
      <DocumentationPermissionNotice />
      <ModuleMenuShell
        title="Documentation"
        tiles={documentationMenu}
        featuredTile={reportsDocsTile}
      />
    </div>
  );
}
