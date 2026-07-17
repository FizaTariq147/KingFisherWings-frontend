import { PageBackLink } from '@/components/ui/PageBackLink';
import { Plane } from 'lucide-react';
import { TextInput } from '../../components/widgets/FilterField';

export default function AirCargoTrackingPage() {
  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      {/* Search card */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Air Cargo Tracking</h2>
        </div>

        <div className="p-5 flex items-center justify-center gap-4">
          <label className="flex items-center gap-3">
            <span className="text-sm text-gray-700">MAWB No.</span>
            <div className="w-52">
              <TextInput />
            </div>
          </label>
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
