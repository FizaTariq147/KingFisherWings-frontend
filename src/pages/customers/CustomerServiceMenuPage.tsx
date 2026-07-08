import { useNavigate } from 'react-router-dom';
import { customerServiceMenu } from '../../features/customers/config/customerServiceMenu';
import { MenuTileCard } from '../../components/widgets/MenuTileCard';

export default function CustomerServiceMenuPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
         {/* Top search bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-2">
        <span className="text-sm text-gray-600">Search</span>
        <select className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-500 w-64 focus:outline-none focus:ring-1 focus:ring-[#FF751F]">
          <option>All</option>
        </select>
      </div>
      {/* Breadcrumb header */}
      <div className="bg-[#0A2942] px-6 py-3">
        <p className="text-white text-sm">
          <span className="text-white/60">Menu</span>
          <span className="text-white/40 mx-2">/</span>
          <span className="font-medium">Customer Service</span>
        </p>
      </div>

      {/* Tile grid */}
      <div className="p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {customerServiceMenu.map((tile) => (
          <MenuTileCard key={tile.id} tile={tile} onClick={navigate} />
        ))}
      </div>
    </div>
  );
}