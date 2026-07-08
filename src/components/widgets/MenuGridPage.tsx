import { useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import type { MenuTile } from '../../features/customers/types/menu.types';

interface MenuGridPageProps {
  breadcrumb: string;
  tiles: MenuTile[];
  featuredTile?: MenuTile; // renders with the centered icon layout, like "Reports - Quotation"
}

export function MenuGridPage({ breadcrumb, tiles, featuredTile }: MenuGridPageProps) {
  const navigate = useNavigate();
  const FeaturedIcon = featuredTile?.icon as ComponentType<{ size: number }> | undefined;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top search bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-2">
        <span className="text-sm text-gray-600">Search</span>
        <select className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-500 w-64 focus:outline-none focus:ring-1 focus:ring-[#FF751F]">
          <option>All</option>
        </select>
      </div>

      {/* Navy breadcrumb bar */}
      <div className="bg-[#0A2942] px-6 py-3">
        <p className="text-white text-[15px] font-medium">
          Menu <span className="text-[#FF751F]">-&gt;</span> {breadcrumb}
        </p>
      </div>

      {/* Tile grid */}
      <div className="p-6 flex-1 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon as ComponentType<{ size: number }>;
          return (
            <button
              key={tile.id}
              onClick={() => navigate(tile.path)}
              className="text-left bg-[#F5F7FA] border border-gray-200 rounded-md p-5
                         hover:shadow-md hover:border-[#FF751F] transition-all duration-150
                         focus:outline-none focus:ring-2 focus:ring-[#FF751F]/40"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-[16px] text-[#0A2942] font-medium leading-snug">
                  {tile.title}
                </h3>
                <span className="shrink-0 ml-3 w-9 h-9 rounded-full flex items-center justify-center
                                  bg-white text-[#FF751F] border-2 border-[#FF751F]">
                  <Icon size={16} />
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {tile.description}
              </p>
            </button>
          );
        })}

        {featuredTile && FeaturedIcon && (
          <button
            onClick={() => navigate(featuredTile.path)}
            className="text-left bg-[#F5F7FA] border border-gray-200 rounded-md p-6
                       hover:shadow-md hover:border-[#FF751F] transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-[#FF751F]/40
                       flex flex-col items-center text-center"
          >
            <span className="w-14 h-14 rounded-full flex items-center justify-center
                              bg-white text-[#0A2942] border-2 border-[#0A2942] mb-3">
              <FeaturedIcon size={24} />
            </span>
            <h3 className="text-[16px] text-[#0A2942] font-medium mb-3">
              {featuredTile.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {featuredTile.description}
            </p>
          </button>
        )}
      </div>

      {/* Footer status bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 text-sm text-white">
        <div className="bg-[#0A2942] px-4 py-2 text-center sm:text-left">
          User : info@kingfisherwings.com
        </div>
        <div className="bg-[#FF751F] px-4 py-2 text-center">
          08-Jul-26 10:35 AM Asia/Dubai
        </div>
        <div className="bg-red-600 px-4 py-2 text-center sm:text-right">
          Powered by KingFisher Tech Gold
        </div>
      </div>
    </div>
  );
}