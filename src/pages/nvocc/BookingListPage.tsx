import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Heart } from 'lucide-react';
import { FilterField, SelectInput, TextInput } from '../../components/widgets/FilterField';
import { NVOCC_CARGO_TYPES, NVOCC_PAGE_SIZE } from '@/features/nvocc/constants/nvocc.constants';
import { useNvoccBookings } from '@/features/nvocc/hooks/useNvocc';
import { NvoccListState, NvoccStatusBadge, nvoccTdClass, nvoccThClass } from '@/features/nvocc/components/NvoccUi';
import { nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import type { NvoccBookingListParams } from '@/features/nvocc/types/nvocc.types';
import type { NvoccCargoType } from '@/features/nvocc/constants/nvocc.constants';

export default function BookingListPage() {
  const [draft, setDraft] = useState<NvoccBookingListParams>({ limit: NVOCC_PAGE_SIZE });
  const [applied, setApplied] = useState<NvoccBookingListParams>({ limit: NVOCC_PAGE_SIZE });
  const query = useNvoccBookings(applied);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/nvocc" label="Back to NVOCC" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">All Booking Status List</h2>
          <Link
            to="/nvocc/bookings/new"
            className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            Create booking
          </Link>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="Voyage ID">
            <TextInput
              value={draft.voyage_id ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, voyage_id: e.target.value || undefined }))}
              placeholder="UUID"
            />
          </FilterField>
          <FilterField label="Shipper ID">
            <TextInput
              value={draft.shipper_id ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, shipper_id: e.target.value || undefined }))}
              placeholder="UUID"
            />
          </FilterField>
          <FilterField label="Type">
            <SelectInput
              options={['All', ...NVOCC_CARGO_TYPES.map((s) => ({ value: s, label: s }))]}
              value={draft.cargo_type ?? 'All'}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  cargo_type: e.target.value === 'All' ? undefined : (e.target.value as NvoccCargoType),
                }))
              }
            />
          </FilterField>
          <FilterField label="Status">
            <TextInput
              value={draft.booking_status ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, booking_status: e.target.value || undefined }))}
              placeholder="e.g. CONFIRMED"
            />
          </FilterField>
          <FilterField label="Search">
            <TextInput
              value={draft.search ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, search: e.target.value || undefined }))}
              placeholder="Booking / HBL / job no."
            />
          </FilterField>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="text-sm text-gray-500">{query.data?.meta.total ?? 0} booking(s)</div>
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
                  <th className={nvoccThClass}>Booking</th>
                  <th className={nvoccThClass}>Cargo</th>
                  <th className={nvoccThClass}>HBL</th>
                  <th className={nvoccThClass}>Job</th>
                  <th className={nvoccThClass}>Commodity</th>
                  <th className={nvoccThClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={nvoccTdClass}>
                      <Link className="font-medium text-blue-600 hover:underline" to={`/nvocc/bookings/${row.id}`}>
                        {nvoccDisplayNumber(row, 'Booking')}
                      </Link>
                    </td>
                    <td className={nvoccTdClass}>{row.cargo_type ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.hbl_number ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.job_number ?? row.job_id ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.commodity ?? '—'}</td>
                    <td className={nvoccTdClass}>
                      <NvoccStatusBadge status={row.booking_status} />
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
