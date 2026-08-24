import type { ComponentType } from 'react';
import { ChevronRight } from 'lucide-react';
import type { MenuTile } from '../../features/customers/types/menu.types';

interface Props {
  tile: MenuTile;
  onClick: (path: string) => void;
  compact?: boolean;
}

export function MenuTileListRow({ tile, onClick, compact = false }: Props) {
  const Icon = tile.icon as ComponentType<{ size: number }>;

  return (
    <button
      type="button"
      onClick={() => onClick(tile.path)}
      className="group flex w-full items-center gap-4 bg-white px-4 py-3 text-left
                 transition-colors hover:bg-orange-50/60
                 focus:outline-none focus-visible:bg-orange-50/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF751F]/40"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${tile.iconColor}`}
      >
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <h3
            className={`font-semibold text-[#0A2942] ${compact ? 'text-[12px]' : 'text-[14px]'}`}
          >
            {tile.title}
          </h3>
          {tile.badgeLoading ? (
            <span className={`text-gray-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>Loading…</span>
          ) : tile.badge != null ? (
            <span className={`font-medium text-[#FF751F] ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {tile.badge.toLocaleString()}
              {tile.badgeHint ? ` ${tile.badgeHint}` : ''}
            </span>
          ) : null}
        </div>
        <p className={`mt-0.5 text-gray-500 line-clamp-1 ${compact ? 'text-xs' : 'text-sm'}`}>
          {tile.description}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-gray-300 transition-colors group-hover:text-[#FF751F]"
      />
    </button>
  );
}
