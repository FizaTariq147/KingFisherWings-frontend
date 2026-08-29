import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Heart } from 'lucide-react';
import { SelectInput } from '../../components/widgets/FilterField';
import { useNvoccLoadList, useNvoccVoyages } from '@/features/nvocc/hooks/useNvocc';
import { NvoccListState, NvoccStatusBadge, nvoccTdClass, nvoccThClass } from '@/features/nvocc/components/NvoccUi';
import { nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';

const tabs = ['NVOCC Load List', 'Export Vessel Load List', 'Import Vessel DSO'];

export default function LoadListPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [voyageId, setVoyageId] = useState('');
  const [appliedVoyageId, setAppliedVoyageId] = useState('');

  const voyagesQuery = useNvoccVoyages({ limit: 100 });
  const loadListQuery = useNvoccLoadList(appliedVoyageId, { enabled: Boolean(appliedVoyageId) });

  const voyageOptions = useMemo(() => {
    const items = voyagesQuery.data?.items ?? [];
    return [
      { value: '', label: '-Select voyage-' },
      ...items.map((v) => ({
        value: v.id,
        label: `${nvoccDisplayNumber(v, 'Voyage')} — ${v.pol_name ?? v.pol_id ?? '?'} → ${v.pod_name ?? v.pod_id ?? '?'}`,
      })),
    ];
  }, [voyagesQuery.data?.items]);

  const rows = useMemo(() => loadListQuery.data ?? [], [loadListQuery.data]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/nvocc" label="Back to NVOCC" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800 uppercase">Vessel Load List / DSO</h2>
        </div>

        <div className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">
              <span className="text-red-500">*</span> Voyage
            </span>
            <div className="w-80">
              <SelectInput
                options={voyageOptions}
                value={voyageId}
                onChange={(e) => setVoyageId(e.target.value)}
              />
            </div>
          </label>
          <button
            type="button"
            disabled={!voyageId}
            onClick={() => setAppliedVoyageId(voyageId)}
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 disabled:opacity-50 text-white text-sm px-5 py-1.5 rounded transition-opacity shrink-0"
          >
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        <div className="flex bg-[#0A2942]">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-[#1E4E76] text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {!appliedVoyageId ? (
          <div className="flex h-56 items-center justify-center text-sm text-gray-500">
            Select a voyage and click Submit to load the list.
          </div>
        ) : (
          <>
            <div className="px-5 py-2 text-sm text-gray-600 border-b border-gray-200">
              Voyage:{' '}
              <Link className="text-blue-600 hover:underline" to={`/nvocc/voyages/${appliedVoyageId}`}>
                {appliedVoyageId.slice(0, 8)}…
              </Link>
              {' · '}
              {rows.length} item(s)
            </div>
            <NvoccListState
              loading={loadListQuery.isLoading}
              error={loadListQuery.isError ? loadListQuery.error : undefined}
              empty={!loadListQuery.isLoading && !loadListQuery.isError && rows.length === 0}
              emptyMessage="No load list items for this voyage."
            />
            {!loadListQuery.isLoading && !loadListQuery.isError && rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className={nvoccThClass}>Booking</th>
                      <th className={nvoccThClass}>Container</th>
                      <th className={nvoccThClass}>Seal</th>
                      <th className={nvoccThClass}>Pieces</th>
                      <th className={nvoccThClass}>Weight (kg)</th>
                      <th className={nvoccThClass}>CBM</th>
                      <th className={nvoccThClass}>Commodity</th>
                      <th className={nvoccThClass}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className={nvoccTdClass}>{row.booking_number ?? row.booking_id ?? '—'}</td>
                        <td className={nvoccTdClass}>{row.container_number ?? '—'}</td>
                        <td className={nvoccTdClass}>{row.seal_number ?? '—'}</td>
                        <td className={nvoccTdClass}>{row.pieces ?? '—'}</td>
                        <td className={nvoccTdClass}>{row.gross_weight_kg ?? '—'}</td>
                        <td className={nvoccTdClass}>{row.cbm ?? '—'}</td>
                        <td className={nvoccTdClass}>{row.commodity ?? '—'}</td>
                        <td className={nvoccTdClass}>
                          <NvoccStatusBadge status={row.cargo_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="px-5 py-2.5 border-t border-gray-200">
          <p className="text-xs text-red-600 italic font-medium">
            * Once download completed, Please remove the header from the downloaded excel file
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button type="button" className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}
