import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MenuTile } from '../../features/customers/types/menu.types';
import { MenuTileCard } from './MenuTileCard';
import { filterMenuTiles } from './filterMenuTiles';
import { AppAnimatedGrid, AppAnimatedGridItem } from '@/components/motion';

type ModuleMenuShellProps = {
  title: string;
  tiles: MenuTile[];
  /** Optional extra tile (e.g. Reports) included in search + grid. */
  featuredTile?: MenuTile;
  /** Smaller section and tile headings (e.g. Customers menu). */
  compact?: boolean;
  /** Page background. */
  className?: string;
};

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
}: ModuleMenuShellProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

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

  return (
    <div className={`min-h-screen ${className}`}>
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

      <div className="p-6 space-y-8">
        {sectionGroups.map((group) => (
          <div key={group.label ?? 'default'} className="space-y-4">
            {group.label ? (
              <h2
                className={`font-semibold uppercase tracking-wide text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {group.label}
              </h2>
            ) : null}
            <AppAnimatedGrid className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.tiles.map((tile) => (
                <AppAnimatedGridItem key={tile.id}>
                  <MenuTileCard tile={tile} onClick={navigate} compact={compact} />
                </AppAnimatedGridItem>
              ))}
            </AppAnimatedGrid>
          </div>
        ))}

        {showFeatured && featuredTile ? (
          <AppAnimatedGrid className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AppAnimatedGridItem>
              <MenuTileCard tile={featuredTile} onClick={navigate} compact={compact} />
            </AppAnimatedGridItem>
          </AppAnimatedGrid>
        ) : null}

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No modules match “{query.trim()}”.
          </p>
        ) : null}
      </div>
    </div>
  );
}
