import { useNavigate } from 'react-router-dom';
import { mastersMenu } from '../../features/masters/config/mastersMenu';
import { MenuTileCard } from '../../components/widgets/MenuTileCard';

export default function MastersMenuPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb header */}
      <div className="bg-[#0A2942] px-6 py-3">
        <p className="text-white text-sm">
          <span className="text-white/60">Menu</span>
          <span className="text-white/40 mx-2">/</span>
          <span className="font-medium">Masters</span>
        </p>
      </div>

      {/* Tile grid */}
      <div className="p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mastersMenu.map((tile) => (
          <MenuTileCard key={tile.id} tile={tile} onClick={navigate} />
        ))}
      </div>
    </div>
  );
}