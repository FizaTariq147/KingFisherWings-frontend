import type { ComponentType } from 'react';
import type { MenuTile } from '../../features/customers/types/menu.types';

interface Props {
  tile: MenuTile;
  onClick: (path: string) => void;
  compact?: boolean;
}

export function MenuTileCard({ tile, onClick, compact = false }: Props) {
  const Icon = tile.icon as ComponentType<{ size: number }>;

  return (
    <button
      onClick={() => onClick(tile.path)}
      className="group text-left bg-white border border-gray-200 rounded-xl p-5
                 hover:border-[#FF751F] hover:shadow-md transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-[#FF751F]/40"
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h3
            className={`font-semibold text-[#0A2942] leading-snug ${compact ? 'text-[13px]' : 'text-[15px]'}`}
          >
            {tile.title}
          </h3>
          {tile.badgeLoading ? (
            <p className={`mt-1 text-gray-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>Loading…</p>
          ) : tile.badge != null ? (
            <p className={`mt-1 font-medium text-[#FF751F] ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {tile.badge.toLocaleString()}
              {tile.badgeHint ? ` ${tile.badgeHint}` : ''}
            </p>
          ) : null}
        </div>
        <span
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                      text-white ${tile.iconColor} group-hover:scale-105 transition-transform`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className={`text-gray-500 leading-relaxed line-clamp-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        {tile.description}
      </p>
    </button>
  );
}
