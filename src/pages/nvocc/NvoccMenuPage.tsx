import { nvoccMenu, reportsNvoccTile } from '../../features/nvocc/config/nvoccMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function NvoccMenuPage() {
  return (
    <ModuleMenuShell
      title="NVOCC"
      tiles={nvoccMenu}
      featuredTile={reportsNvoccTile}
      className="bg-white"
    />
  );
}
