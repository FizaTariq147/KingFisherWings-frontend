import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plane } from 'lucide-react';
import { TextInput } from '../../components/widgets/FilterField';

export default function AirCargoTrackingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Search card */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Air Cargo Tracking</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        <div className="p-5 flex items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">MAWB No.</label>
            <div className="w-52">
              <TextInput />
            </div>
          </div>
          <button className="flex items-center gap-1.5 bg-orange-500 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
            <Plane size={14} />
            Track
          </button>
        </div>
      </div>

      {/* Track results card */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-[15px] font-medium text-gray-800">Track</h2>
        </div>
        <div className="p-5">
          <div className="border border-gray-300 rounded-md min-h-[420px]" />
        </div>
      </div>
    </div>
  );
}