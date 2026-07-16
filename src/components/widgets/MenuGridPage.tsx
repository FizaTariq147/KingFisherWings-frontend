import { ModuleMenuShell } from './ModuleMenuShell';
import type { MenuTile } from '../../features/customers/types/menu.types';

interface MenuGridPageProps {
  breadcrumb: string;
  tiles: MenuTile[];
  featuredTile?: MenuTile;
}

/** @deprecated Prefer ModuleMenuShell — kept as a thin alias. */
export function MenuGridPage({ breadcrumb, tiles, featuredTile }: MenuGridPageProps) {
  return (
    <ModuleMenuShell title={breadcrumb} tiles={tiles} featuredTile={featuredTile} className="bg-white" />
  );
}
