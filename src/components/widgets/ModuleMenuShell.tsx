import { useMemo, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List } from 'lucide-react';
import type { MenuTile } from '../../features/customers/types/menu.types';
import { MenuTileCard } from './MenuTileCard';
import { MenuTileListRow } from './MenuTileListRow';
import { filterMenuTiles } from './filterMenuTiles';
import { AppAnimatedGrid, AppAnimatedGridItem } from '@/components/motion';

export type ModuleMenuViewMode = 'cards' | 'list';

type ModuleMenuShellProps = {
  title: string;
  tiles: MenuTile[];
  /** Optional extra tile (e.g. Reports) included in search + grid. */
  featuredTile?: MenuTile;
  /** Smaller section and tile headings (e.g. Customers menu). */
  compact?: boolean;
  /** Page background. */
  className?: string;
  /** Show Cards / List toggle. Default view is cards. */
  enableViewToggle?: boolean;
  /** Initial view when toggle is enabled. */
  defaultView?: ModuleMenuViewMode;
};

function ViewToggleButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded transition-colors
        ${
          active
            ? 'bg-[#0A2942] text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#0A2942]'
        }`}
    >
      <Icon size={14} />
    </button>
  );
}

/**
 * Shared module menu layout: search filters tiles by title/description,
 * jump-to select navigates directly to a module.
 */
export function ModuleMenuShell({
  title,
  tiles,
  featuredTile,
  compact = false,
  className = 'bg-gray-50',
  enableViewToggle = false,
  defaultView = 'cards',
}: ModuleMenuShellProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ModuleMenuViewMode>(defaultView);

  const allTiles = useMemo(
    () => (featuredTile ? [...tiles, featuredTile] : tiles),
    [tiles, featuredTile],
  );

  const filtered = useMemo(() => filterMenuTiles(allTiles, query), [allTiles, query]);

  const featuredId = featuredTile?.id;
  const regularTiles = featuredId
    ? filtered.filter((t) => t.id !== featuredId)
    : filtered;
  const showFeatured = Boolean(featuredTile && filtered.some((t) => t.id === featuredId));

  const sectionGroups = useMemo(() => {
    const hasSections = regularTiles.some((tile) => tile.section);
    if (!hasSections) return [{ label: null as string | null, tiles: regularTiles }];

    const groups: Array<{ label: string | null; tiles: MenuTile[] }> = [];
    for (const tile of regularTiles) {
      const label = tile.section ?? 'Other';
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.tiles.push(tile);
      } else {
        groups.push({ label, tiles: [tile] });
      }
    }
    return groups;
  }, [regularTiles]);

  const renderTileGroup = (groupTiles: MenuTile[]) => {
    if (viewMode === 'list') {
      return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {groupTiles.map((tile) => (
            <MenuTileListRow key={tile.id} tile={tile} onClick={navigate} compact={compact} />
          ))}
        </div>
      );
    }

    return (
      <AppAnimatedGrid className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groupTiles.map((tile) => (
          <AppAnimatedGridItem key={tile.id}>
            <MenuTileCard tile={tile} onClick={navigate} compact={compact} />
          </AppAnimatedGridItem>
        ))}
      </AppAnimatedGrid>
    );
  };

  return (
    <div className={`relative min-h-screen ${className}`}>
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-end gap-2">
        <label htmlFor={`module-menu-search-${title}`} className="text-sm text-gray-600">
          Search
        </label>
        <input
          id={`module-menu-search-${title}`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter modules…"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 w-64
                     focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
        />
        <select
          aria-label="Jump to module"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-500 w-56
                     focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
          value=""
          onChange={(e) => {
            const path = e.target.value;
            if (path) navigate(path);
            e.target.value = '';
          }}
        >
          <option value="">All ({allTiles.length})</option>
          {allTiles.map((tile) => (
            <option key={tile.id} value={tile.path}>
              {tile.title}
            </option>
          ))}
        </select>
      </div>

      <div className={`bg-[#0A2942] px-6 ${compact ? 'py-2' : 'py-3'}`}>
        <p className={`text-white ${compact ? 'text-xs' : 'text-sm'}`}>
          <span className="text-white/60">Menu</span>
          <span className="text-white/40 mx-2">/</span>
          <span className="font-medium">{title}</span>
          {query.trim() ? (
            <span className="text-white/50 ml-3 font-normal">
              {filtered.length} of {allTiles.length}
            </span>
          ) : null}
        </p>
      </div>

      <div className="p-6 space-y-8 pb-24">
        {sectionGroups.map((group) => (
          <div key={group.label ?? 'default'} className="space-y-4">
            {group.label ? (
              <h2
                className={`font-semibold uppercase tracking-wide text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {group.label}
              </h2>
            ) : null}
            {renderTileGroup(group.tiles)}
          </div>
        ))}

        {showFeatured && featuredTile ? renderTileGroup([featuredTile]) : null}

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No modules match “{query.trim()}”.
          </p>
        ) : null}
      </div>

      {enableViewToggle ? (
        <div
          className="fixed bottom-5 right-5 z-20 flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
          role="group"
          aria-label="View mode"
        >
          <ViewToggleButton
            active={viewMode === 'cards'}
            label="Cards"
            icon={LayoutGrid}
            onClick={() => setViewMode('cards')}
          />
          <ViewToggleButton
            active={viewMode === 'list'}
            label="List"
            icon={List}
            onClick={() => setViewMode('list')}
          />
        </div>
      ) : null}
    </div>
  );
}
