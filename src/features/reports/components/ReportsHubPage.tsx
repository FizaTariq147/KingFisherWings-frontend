import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { MenuTile } from '@/features/customers/types/menu.types';
import { MenuTileCard } from '@/components/widgets/MenuTileCard';
import { filterMenuTiles } from '@/components/widgets/filterMenuTiles';
import { AppAnimatedGrid, AppAnimatedGridItem } from '@/components/motion';
import { ReportsPageBackLink } from './ReportsPageBackLink';
import { isFromReports, withFromReports } from '../hooks/useReportsBackLink';

type ReportsHubPageProps = {
  title: string;
  backTo: string;
  backLabel: string;
  tiles: MenuTile[];
};

export function ReportsHubPage({ title, backTo, backLabel, tiles }: ReportsHubPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const fromReports = isFromReports(searchParams);

  const goTo = (path: string) => {
    navigate(fromReports ? withFromReports(path) : path);
  };

  const filtered = useMemo(() => filterMenuTiles(tiles, query), [tiles, query]);

  const sectionGroups = useMemo(() => {
    const hasSections = filtered.some((tile) => tile.section);
    if (!hasSections) return [{ label: null as string | null, tiles: filtered }];

    const groups: Array<{ label: string | null; tiles: MenuTile[] }> = [];
    for (const tile of filtered) {
      const label = tile.section ?? 'Other';
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.tiles.push(tile);
      } else {
        groups.push({ label, tiles: [tile] });
      }
    }
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <ReportsPageBackLink fallbackTo={backTo} fallbackLabel={backLabel} />

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 border-b border-gray-200">
          <h1 className="text-sm font-semibold text-gray-800">{title}</h1>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter reports…"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
          />
        </div>

        <div className="p-6 space-y-8">
          {sectionGroups.map((group) => (
            <div key={group.label ?? 'default'} className="space-y-4">
              {group.label ? (
                <h2 className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{group.label}</h2>
              ) : null}
              <AppAnimatedGrid className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.tiles.map((tile) => (
                  <AppAnimatedGridItem key={tile.id}>
                    <MenuTileCard tile={tile} onClick={goTo} compact />
                  </AppAnimatedGridItem>
                ))}
              </AppAnimatedGrid>
            </div>
          ))}

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No reports match your search.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
