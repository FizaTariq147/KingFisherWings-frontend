import type { ComponentType } from 'react';
import type { MenuTile } from '../../features/customers/types/menu.types';

interface Props {
  tile: MenuTile;
  onClick: (path: string) => void;
}

export function MenuTileCard({ tile, onClick }: Props) {
  const Icon = tile.icon as ComponentType<{ size: number }>;

  return (
    <button
      onClick={() => onClick(tile.path)}
      className="group text-left bg-white border border-gray-200 rounded-xl p-5
                 hover:border-[#FF751F] hover:shadow-md transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-[#FF751F]/40"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#0A2942] leading-snug">
          {tile.title}
        </h3>
        <span
          className={`shrink-0 ml-3 w-9 h-9 rounded-full flex items-center justify-center
                      text-white ${tile.iconColor} group-hover:scale-105 transition-transform`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
        {tile.description}
      </p>
    </button>
  );
}