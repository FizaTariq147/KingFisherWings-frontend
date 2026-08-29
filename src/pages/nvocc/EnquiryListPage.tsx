import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Wand2, Heart } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';
import { NVOCC_ENQUIRY_STATUSES, nvoccLabel } from '@/features/nvocc/constants/nvocc.constants';
import type { NvoccEnquiryStatus } from '@/features/nvocc/constants/nvocc.constants';
import { useNvoccEnquiries } from '@/features/nvocc/hooks/useNvocc';
import { NvoccListState, NvoccStatusBadge, nvoccTdClass, nvoccThClass } from '@/features/nvocc/components/NvoccUi';
import { formatNvoccDate, nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import type { NvoccEnquiryListParams } from '@/features/nvocc/types/nvocc.types';

export default function EnquiryListPage() {
  const [draft, setDraft] = useState<NvoccEnquiryListParams>({});
  const [applied, setApplied] = useState<NvoccEnquiryListParams>({});
  const query = useNvoccEnquiries(applied);
  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <div className="space-y-3">
      <PageBackLink to="/nvocc" label="Back to NVOCC" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">All Enquiry List</h2>
          <Link
            to="/nvocc/enquiries/new"
            className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            <Wand2 size={14} />
            Create
          </Link>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="From Date">
            <DateInput
              value={draft.date_from ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, date_from: e.target.value || undefined }))}
            />
          </FilterField>
          <FilterField label="To Date">
            <DateInput
              value={draft.date_to ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, date_to: e.target.value || undefined }))}
            />
          </FilterField>
          <FilterField label="Enquiry Status">
            <SelectInput
              options={['All', ...NVOCC_ENQUIRY_STATUSES.map((s) => ({ value: s, label: nvoccLabel(s) }))]}
              value={draft.enquiry_status ?? 'All'}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  enquiry_status:
                    e.target.value === 'All' ? undefined : (e.target.value as NvoccEnquiryStatus),
                }))
              }
            />
          </FilterField>
          <FilterField label="Customer ID">
            <TextInput
              value={draft.customer_id ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, customer_id: e.target.value || undefined }))}
              placeholder="UUID"
            />
          </FilterField>
          <FilterField label="Voyage ID">
            <TextInput
              value={draft.voyage_id ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, voyage_id: e.target.value || undefined }))}
              placeholder="UUID"
            />
          </FilterField>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="text-sm text-gray-500">{query.data?.meta.total ?? 0} enquiry(ies)</div>
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
                  <th className={nvoccThClass}>Enquiry</th>
                  <th className={nvoccThClass}>Customer</th>
                  <th className={nvoccThClass}>Cargo</th>
                  <th className={nvoccThClass}>Rate</th>
                  <th className={nvoccThClass}>Follow up</th>
                  <th className={nvoccThClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={nvoccTdClass}>
                      <Link className="font-medium text-blue-600 hover:underline" to={`/nvocc/enquiries/${row.id}`}>
                        {nvoccDisplayNumber(row, 'Enquiry')}
                      </Link>
                    </td>
                    <td className={nvoccTdClass}>{row.customer_name ?? row.customer_id ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.cargo_type ?? '—'}</td>
                    <td className={nvoccTdClass}>{row.rate_quoted ?? '—'}</td>
                    <td className={nvoccTdClass}>{formatNvoccDate(row.follow_up_date)}</td>
                    <td className={nvoccTdClass}>
                      <NvoccStatusBadge status={row.enquiry_status} />
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
