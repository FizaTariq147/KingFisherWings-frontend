import { useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import { hrMenu, reportsHrTile } from '../../features/hr/config/hrMenu';

export default function HrMenuPage() {
  const navigate = useNavigate();
  const ReportsIcon = reportsHrTile.icon as ComponentType<{ size: number }>;

  return (
    <div className="min-h-screen bg-white">
      {/* Top search bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-2">
        <span className="text-sm text-gray-600">Search</span>
        <select className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-500 w-64 focus:outline-none focus:ring-1 focus:ring-[#FF751F]">
          <option>All</option>
        </select>
      </div>

      {/* Navy breadcrumb bar */}
           <div className="bg-[#0A2942] px-6 py-3">
        <p className="text-white text-sm">
          <span className="text-white/60">Menu</span>
          <span className="text-white/40 mx-2">/</span>
          <span className="font-medium">HR</span>
        </p>
      </div>

      {/* Tile grid */}
      <div className="p-6 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hrMenu.map((tile) => {
          const Icon = tile.icon as ComponentType<{ size: number }>;
          return (
            <button
              key={tile.id}
              onClick={() => navigate(tile.path)}
              className="text-left bg-white border border-gray-200 rounded-md p-5
                         hover:shadow-md hover:border-gray-300 transition-shadow duration-150
                         focus:outline-none"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-[15px] text-[#0A2942] font-normal leading-snug">
                  {tile.title}
                </h3>
                <span
                  className={`shrink-0 ml-3 w-9 h-9 rounded-full flex items-center justify-center
                              text-white ${tile.iconColor}`}
                >
                  <Icon size={16} />
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {tile.description}
              </p>
            </button>
          );
        })}

        {/* Reports - HR: centered icon layout */}
        <button
          onClick={() => navigate(reportsHrTile.path)}
          className="text-left bg-white border border-gray-200 rounded-md p-6
                     hover:shadow-md hover:border-gray-300 transition-shadow duration-150
                     focus:outline-none flex flex-col items-center text-center"
        >
          <span className="w-14 h-14 rounded-full flex items-center justify-center bg-sky-500 text-white mb-3">
            <ReportsIcon size={24} />
          </span>
          <h3 className="text-[15px] text-[#0A2942] font-normal mb-3">
            {reportsHrTile.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {reportsHrTile.description}
          </p>
        </button>
      </div>
    </div>
  );
}