import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Search, ChevronDown, Heart, X, AlignJustify } from 'lucide-react';
import { SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';

interface MasterItem {
  id: string;
  label: string;
  checked: boolean;
}

const initialItems: MasterItem[] = [{ id: 'pod', label: 'POD', checked: true }];

export default function VesselVoyageMasterPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState('10');
  const [items, setItems] = useState<MasterItem[]>(initialItems);
  const [expanded, setExpanded] = useState(true);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Vessel Voyage Master List</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

        {/* Filter row + Submit pinned top-right */}
        <div className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
            <div className="flex items-start gap-3">
              <label className="text-sm text-gray-700 pt-2">From ETD Date</label>
              <div className="w-40">
                <DateInput value="30-MAR-26" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label className="text-sm text-gray-700 pt-2">To ETD Date</label>
              <div className="w-40">
                <DateInput value="16-OCT-26" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label className="w-14 shrink-0 text-sm text-gray-700 pt-2 text-right">Vessel</label>
              <div className="w-52">
                <TextInput />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label className="w-10 shrink-0 text-sm text-gray-700 pt-2 text-right">POL</label>
              <div className="w-52">
                <SelectInput options={['-Select-']} />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label className="w-10 shrink-0 text-sm text-gray-700 pt-2 text-right">POD</label>
              <div className="w-52">
                <SelectInput options={['-Select-']} />
              </div>
            </div>
          </div>
        </div>

        {/* Search toolbar with inline Submit */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
              Search
            </button>
            <span className="text-sm text-gray-500 ml-2">Rows</span>
            <select
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
            >
              <option>5</option>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
              Options
              <ChevronDown size={12} />
            </button>
          </div>

          <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        {/* Collapsible checkbox-item panel */}
        <div className="bg-[#F5F7FA]">
          <div className="flex items-start px-3 py-2 gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-gray-500 hover:text-gray-700"
            >
              <ChevronDown size={14} className={`transition-transform ${expanded ? '' : '-rotate-90'}`} />
            </button>

            {expanded && (
              <div className="flex-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0A2942] focus:ring-[#FF751F]"
                    />
                    <div className="flex items-center gap-2 border border-gray-300 rounded bg-white px-2 py-1.5 flex-1 max-w-xs">
                      <span className="w-6 h-6 rounded bg-[#0A2942] flex items-center justify-center text-white shrink-0">
                        <AlignJustify size={13} />
                      </span>
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        {item.label}
                      </a>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results area — empty state */}
        <div className="flex items-center justify-center h-56 border-t border-gray-200">
          <Search size={40} className="text-gray-300" />
        </div>
      </div>

      {/* Floating Favorites button */}
      <div className="mt-4">
        <button className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}