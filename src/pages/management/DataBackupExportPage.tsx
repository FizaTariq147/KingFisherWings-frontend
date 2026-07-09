import { useState } from 'react';
import { Search, ChevronDown, Maximize2, FileArchive, Heart, CheckCircle2 } from 'lucide-react';

const backupItems = [
  'Master - COA',
  'Master - Employee',
  'Master - Organization',
  'Master - Organization Address',
  'Master - Organization Contacts',
  'Master - Payroll',
  'Report - Balance Sheet Summary',
  'Report - Customer Aging Summary',
  'Report - Invoice & Credit Note',
  'Report - Job List',
  'Report - Profit and Loss Summary',
  'Report - Purchase Invoice & Credit Note',
  'Report - Quotation List',
  'Report - Shipment List',
  'Report - Supplier Aging Summary',
  'Report - Trial Balance List',
  'Transactions - AP Outstanding',
  'Transactions - AR Outstanding',
  'Transactions - GL Journal',
  'Transactions - VAT IN',
  'Transactions - VAT OUT',
];

export default function DataBackupExportPage() {
  const [rows, setRows] = useState('5');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  const toggleItem = (item: string) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const toggleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    const newChecked: Record<string, boolean> = {};
    backupItems.forEach((item) => {
      newChecked[item] = next;
    });
    setChecked(newChecked);
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Data Backup Export</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
          {/* Left column — checkbox list */}
          <div>
            <button
              onClick={toggleSelectAll}
              className="bg-green-600 hover:opacity-90 text-white text-xs font-medium px-4 py-1.5 rounded transition-opacity mb-3"
            >
              Select All
            </button>

            <p className="text-sm text-gray-700 mb-2">
              <span className="text-red-500">*</span> List
            </p>

            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-2">
              {backupItems.map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!checked[item]}
                    onChange={() => toggleItem(item)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0A2942] focus:ring-[#FF751F]"
                  />
                  <span className="text-sm text-blue-600 hover:underline">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right column — action + history + instructions */}
          <div className="space-y-4">
            <button className="flex items-center gap-1.5 bg-yellow-500 hover:opacity-90 text-white text-sm font-medium px-4 py-1.5 rounded transition-opacity">
              <FileArchive size={14} />
              Request Backup
            </button>

            <div className="border border-gray-200 rounded-md">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
                <h2 className="text-[15px] font-medium text-gray-800">Data Backup Export History</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <Maximize2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200">
                <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
                  <Search size={13} />
                  <ChevronDown size={12} />
                </button>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
                />
                <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
                  Search
                </button>
                <span className="text-sm text-gray-500 ml-1">Rows</span>
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

              <div className="flex items-center justify-center h-40">
                <Search size={32} className="text-gray-300" />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Data Backup Request Instructions:</p>
              <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1 mb-3">
                <li>Select the data backup you wish to download from the list.</li>
                <li>Click the "Request Backup" button to submit your request.</li>
              </ol>

              <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1">
                📌 Important Notes:
              </p>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mb-3">
                <li>Backup files will be generated and available by 5:00 AM the next day.</li>
                <li>The backup download link will be valid for 24 hours only. After that, the file will be automatically deleted from the server.</li>
                <li>Only one backup request is allowed per day. Multiple requests on the same day are not permitted.</li>
              </ul>

              <p className="flex items-start gap-1.5 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                Please ensure you download your backup within the 24-hour window.
              </p>
            </div>
          </div>
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