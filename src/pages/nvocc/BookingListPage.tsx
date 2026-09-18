import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Heart } from 'lucide-react';
import { FilterField, SelectInput, TextInput } from '../../components/widgets/FilterField';
import { NVOCC_CARGO_TYPES } from '@/features/nvocc/constants/nvocc.constants';
import { useNvoccBookings } from '@/features/nvocc/hooks/useNvocc';
import { NvoccListState, NvoccStatusBadge, nvoccTdClass, nvoccThClass } from '@/features/nvocc/components/NvoccUi';
import { nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import type { NvoccBooking, NvoccBookingListParams } from '@/features/nvocc/types/nvocc.types';
import type { NvoccCargoType } from '@/features/nvocc/constants/nvocc.constants';
import { useQuotations } from '@/features/quotations/hooks/useQuotations';
import type { Quotation } from '@/features/quotations/types/quotation.types';
import { quotationDisplayNumber } from '@/features/quotations/utils/normalizeQuotation';
import {
  quotationCustomerLabel,
  quotationRouteLabel,
  quotationTotalAmount,
} from '@/features/quotations/utils/quotationDisplay';
import { coerceQuotationStatus } from '@/features/quotations/utils/quotationStatus';
import { STATUS_LABELS } from '@/features/quotations/constants/quotation.constants';
import type { QuotationStatus } from '@/features/quotations/constants/quotation.constants';

/** Sent / open NVOCC quotes that should appear alongside bookings. */
const NVOCC_QUOTE_IN_BOOKINGS: ReadonlySet<QuotationStatus> = new Set([
  'SENT',
  'CUSTOMER_REVIEW',
  'NEGOTIATING',
  'APPROVED',
  'INTERNALLY_APPROVED',
]);

type UnifiedRow =
  | { kind: 'booking'; id: string; booking: NvoccBooking; sortKey: string }
  | { kind: 'quotation'; id: string; quotation: Quotation; sortKey: string };

function formatMoney(amount: number | undefined, currency?: string): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'AED',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency ?? ''} ${amount.toFixed(2)}`.trim();
  }
}

export default function BookingListPage() {
  const [draft, setDraft] = useState<NvoccBookingListParams>({});
  const [applied, setApplied] = useState<NvoccBookingListParams>({});
  const bookingsQuery = useNvoccBookings(applied);
  const exportQuotesQuery = useQuotations({ job_type: 'NVOCC_EXPORT', limit: 100 });
  const importQuotesQuery = useQuotations({ job_type: 'NVOCC_IMPORT', limit: 100 });

  const rows = useMemo(() => {
    const bookingRows: UnifiedRow[] = (bookingsQuery.data?.items ?? []).map((booking) => ({
      kind: 'booking' as const,
      id: `booking-${booking.id}`,
      booking,
      sortKey: booking.updated_at || booking.created_at || booking.id,
    }));

    const search = (applied.search ?? '').trim().toLowerCase();
    const quoteRows: UnifiedRow[] = [
      ...(exportQuotesQuery.data?.quotations ?? []),
      ...(importQuotesQuery.data?.quotations ?? []),
    ]
      .filter((q) => NVOCC_QUOTE_IN_BOOKINGS.has(coerceQuotationStatus(q.status)))
      // Already converted with a job usually lands as a real booking/job — keep APPROVED without job.
      .filter((q) => !(q.job_id && coerceQuotationStatus(q.status) === 'CONVERTED'))
      .filter((q) => {
        if (!search) return true;
        const hay = [
          quotationDisplayNumber(q),
          q.customer_name,
          q.commodity,
          q.origin_port_code,
          q.dest_port_code,
          q.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(search);
      })
      .map((quotation) => ({
        kind: 'quotation' as const,
        id: `quote-${quotation.id}`,
        quotation,
        sortKey: quotation.updated_at || quotation.quotation_date || quotation.created_at || quotation.id,
      }));

    return [...bookingRows, ...quoteRows].sort((a, b) =>
      String(b.sortKey).localeCompare(String(a.sortKey)),
    );
  }, [
    applied.search,
    bookingsQuery.data?.items,
    exportQuotesQuery.data?.quotations,
    importQuotesQuery.data?.quotations,
  ]);

  const loading =
    bookingsQuery.isLoading || exportQuotesQuery.isLoading || importQuotesQuery.isLoading;
  const error = bookingsQuery.isError
    ? bookingsQuery.error
    : exportQuotesQuery.isError
      ? exportQuotesQuery.error
      : importQuotesQuery.isError
        ? importQuotesQuery.error
        : undefined;
  const quoteCount = rows.filter((r) => r.kind === 'quotation').length;
  const bookingCount = rows.filter((r) => r.kind === 'booking').length;

  return (
    <div className="space-y-3">
      <PageBackLink to="/nvocc" label="Back to NVOCC" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-[17px] font-medium text-gray-800">All Booking Status List</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Includes NVOCC Export/Import quotations that are Sent (and other open statuses).
            </p>
          </div>
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
              placeholder="Booking / quote / HBL / customer"
            />
          </FilterField>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="text-sm text-gray-500">
            {bookingCount} booking(s) · {quoteCount} NVOCC quotation(s)
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
          loading={loading}
          error={error}
          empty={!loading && !error && rows.length === 0}
        />
        {!loading && !error && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className={nvoccThClass}>Ref</th>
                  <th className={nvoccThClass}>Source</th>
                  <th className={nvoccThClass}>Customer / cargo</th>
                  <th className={nvoccThClass}>Route / HBL</th>
                  <th className={nvoccThClass}>Amount / job</th>
                  <th className={nvoccThClass}>Commodity</th>
                  <th className={nvoccThClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) =>
                  row.kind === 'booking' ? (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className={nvoccTdClass}>
                        <Link
                          className="font-medium text-blue-600 hover:underline"
                          to={`/nvocc/bookings/${row.booking.id}`}
                        >
                          {nvoccDisplayNumber(row.booking, 'Booking')}
                        </Link>
                      </td>
                      <td className={nvoccTdClass}>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                          Booking
                        </span>
                      </td>
                      <td className={nvoccTdClass}>{row.booking.cargo_type ?? '—'}</td>
                      <td className={nvoccTdClass}>{row.booking.hbl_number ?? '—'}</td>
                      <td className={nvoccTdClass}>
                        {row.booking.job_number ?? row.booking.job_id ?? '—'}
                      </td>
                      <td className={nvoccTdClass}>{row.booking.commodity ?? '—'}</td>
                      <td className={nvoccTdClass}>
                        <NvoccStatusBadge status={row.booking.booking_status} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className={nvoccTdClass}>
                        <Link
                          className="font-medium text-blue-600 hover:underline"
                          to={`/quotations/${row.quotation.id}`}
                        >
                          {quotationDisplayNumber(row.quotation)}
                        </Link>
                      </td>
                      <td className={nvoccTdClass}>
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-800">
                          Quotation
                        </span>
                      </td>
                      <td className={nvoccTdClass}>
                        <div>{quotationCustomerLabel(row.quotation)}</div>
                        <div className="text-xs text-gray-500">{row.quotation.job_type}</div>
                      </td>
                      <td className={nvoccTdClass}>{quotationRouteLabel(row.quotation)}</td>
                      <td className={nvoccTdClass}>
                        {formatMoney(
                          quotationTotalAmount(row.quotation),
                          row.quotation.currency_code,
                        )}
                      </td>
                      <td className={nvoccTdClass}>{row.quotation.commodity ?? '—'}</td>
                      <td className={nvoccTdClass}>
                        <NvoccStatusBadge
                          status={
                            STATUS_LABELS[coerceQuotationStatus(row.quotation.status)] ??
                            row.quotation.status
                          }
                        />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity"
        >
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}
