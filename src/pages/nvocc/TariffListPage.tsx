import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Heart, Plus } from 'lucide-react';
import { SelectInput, TextInput } from '../../components/widgets/FilterField';
import { NVOCC_TARIFF_STATUSES, nvoccLabel } from '@/features/nvocc/constants/nvocc.constants';
import type { NvoccTariffStatus } from '@/features/nvocc/constants/nvocc.constants';
import { useNvoccTariffs } from '@/features/nvocc/hooks/useNvocc';
import { NvoccListState, NvoccStatusBadge, nvoccTdClass, nvoccThClass } from '@/features/nvocc/components/NvoccUi';
import { formatNvoccDate, nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import type { NvoccTariffListParams } from '@/features/nvocc/types/nvocc.types';

export default function TariffListPage() {
  const [draft, setDraft] = useState<NvoccTariffListParams>({});
  const [applied, setApplied] = useState<NvoccTariffListParams>({});
  const query = useNvoccTariffs(applied);

  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/nvocc" label="Back to NVOCC" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">NVOCC Tariffs</h2>
          <Link
            to="/nvocc/tariffs/new"
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            <Plus size={14} />
            Create
          </Link>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Status
            <SelectInput
              options={['All', ...NVOCC_TARIFF_STATUSES.map((s) => ({ value: s, label: nvoccLabel(s) }))]}
              value={draft.status ?? 'All'}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value === 'All' ? undefined : (e.target.value as NvoccTariffStatus),
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
            Search
            <TextInput
              value={draft.search ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, search: e.target.value || undefined }))}
              placeholder="Trade lane, region…"
            />
          </label>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="text-sm text-gray-500">
            {query.data?.meta.total ?? 0} tariff(s)
          </div>
          <button
            type="button"
            onClick={() => setApplied({ ...draft })}
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
                  <th className={nvoccThClass}>Trade lane</th>
                  <th className={nvoccThClass}>Valid from</th>
                  <th className={nvoccThClass}>Valid to</th>
                  <th className={nvoccThClass}>Currency</th>
                  <th className={nvoccThClass}>FCL rate</th>
                  <th className={nvoccThClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={nvoccTdClass}>
                      <Link className="font-medium text-blue-600 hover:underline" to={`/nvocc/tariffs/${row.id}`}>
                        {row.trade_lane || nvoccDisplayNumber(row as never, 'Tariff')}
                      </Link>
                    </td>
                    <td className={nvoccTdClass}>{formatNvoccDate(row.rate_valid_from)}</td>
                    <td className={nvoccTdClass}>{formatNvoccDate(row.rate_valid_to)}</td>
                    <td className={nvoccTdClass}>{row.currency_code ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.fcl_rate ?? '—'}</td>
                    <td className={nvoccTdClass}>
                      <NvoccStatusBadge status={row.status} />
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
