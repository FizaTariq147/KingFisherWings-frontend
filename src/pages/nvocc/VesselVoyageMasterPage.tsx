import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Heart, Plus } from 'lucide-react';
import { SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';
import { NVOCC_PAGE_SIZE, NVOCC_VOYAGE_STATUSES, nvoccLabel } from '@/features/nvocc/constants/nvocc.constants';
import type { NvoccVoyageStatus } from '@/features/nvocc/constants/nvocc.constants';
import { useNvoccVoyages } from '@/features/nvocc/hooks/useNvocc';
import { NvoccListState, NvoccStatusBadge, nvoccTdClass, nvoccThClass } from '@/features/nvocc/components/NvoccUi';
import { formatNvoccDate, nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import type { NvoccVoyageListParams } from '@/features/nvocc/types/nvocc.types';

export default function VesselVoyageMasterPage() {
  const [draft, setDraft] = useState<NvoccVoyageListParams>({ limit: NVOCC_PAGE_SIZE });
  const [applied, setApplied] = useState<NvoccVoyageListParams>({ limit: NVOCC_PAGE_SIZE });
  const query = useNvoccVoyages(applied);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/nvocc" label="Back to NVOCC" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Vessel Voyage Master List</h2>
          <Link
            to="/nvocc/voyages/new"
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            <Plus size={14} />
            Create
          </Link>
        </div>

        <div className="p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">From ETD</span>
            <div className="w-40">
              <DateInput
                value={draft.etd_from ?? ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, etd_from: e.target.value || undefined }))}
              />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">To ETD</span>
            <div className="w-40">
              <DateInput
                value={draft.etd_to ?? ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, etd_to: e.target.value || undefined }))}
              />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Status</span>
            <div className="w-44">
              <SelectInput
                options={['All', ...NVOCC_VOYAGE_STATUSES.map((s) => ({ value: s, label: nvoccLabel(s) }))]}
                value={draft.voyage_status ?? 'All'}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    voyage_status:
                      e.target.value === 'All' ? undefined : (e.target.value as NvoccVoyageStatus),
                  }))
                }
              />
            </div>
          </label>
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Search</span>
            <div className="w-52">
              <TextInput
                value={draft.search ?? ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, search: e.target.value || undefined }))}
              />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="text-sm text-gray-500">{query.data?.meta.total ?? 0} voyage(s)</div>
          <button
            type="button"
            onClick={() => setApplied({ ...draft, limit: NVOCC_PAGE_SIZE })}
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity"
          >
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        <NvoccListState
          loading={query.isLoading}
          error={query.isError ? query.error : undefined}
          empty={!query.isLoading && !query.isError && rows.length === 0}
        />
        {!query.isLoading && !query.isError && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className={nvoccThClass}>Voyage</th>
                  <th className={nvoccThClass}>Vessel</th>
                  <th className={nvoccThClass}>POL</th>
                  <th className={nvoccThClass}>POD</th>
                  <th className={nvoccThClass}>ETD</th>
                  <th className={nvoccThClass}>ETA</th>
                  <th className={nvoccThClass}>MBL</th>
                  <th className={nvoccThClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={nvoccTdClass}>
                      <Link className="font-medium text-blue-600 hover:underline" to={`/nvocc/voyages/${row.id}`}>
                        {nvoccDisplayNumber(row, 'Voyage')}
                      </Link>
                    </td>
                    <td className={nvoccTdClass}>{row.vessel_name ?? row.vessel_id ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.pol_name ?? row.pol_id ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.pod_name ?? row.pod_id ?? '—'}</td>
                    <td className={nvoccTdClass}>{formatNvoccDate(row.etd)}</td>
                    <td className={nvoccTdClass}>{formatNvoccDate(row.eta)}</td>
                    <td className={nvoccTdClass}>{row.mbl_number ?? '—'}</td>
                    <td className={nvoccTdClass}>
                      <NvoccStatusBadge status={row.voyage_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
