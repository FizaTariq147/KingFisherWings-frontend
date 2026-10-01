import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import type { NvoccBooking } from '../types/nvocc.types';
import { formatNvoccDate, nvoccDisplayNumber } from '../utils/normalizeNvocc';

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  let display = '—';
  if (typeof value === 'boolean') display = value ? 'Yes' : 'No';
  else if (value != null && value !== '') display = String(value);
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-gray-100 last:border-0">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="text-gray-900 text-right font-medium break-all">{display}</span>
    </div>
  );
}

export function NvoccBookingOverviewPanel({ booking }: { booking: NvoccBooking }) {
  const voyageLabel =
    booking.voyage_label ||
    [booking.voyage_number, booking.pol_name && booking.pod_name ? `${booking.pol_name} → ${booking.pod_name}` : '']
      .filter(Boolean)
      .join(' · ') ||
    undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking overview</CardTitle>
      </CardHeader>
      <div className="grid gap-6 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Row label="Booking no." value={nvoccDisplayNumber(booking, 'Booking')} />
          <Row label="Commercial gate" value={booking.booking_status} />
          <Row label="Lifecycle" value={booking.lifecycle_status} />
          <Row label="Job" value={booking.job_number || booking.job_id} />
          <Row label="HBL" value={booking.hbl_number} />
          <Row label="Created" value={formatNvoccDate(booking.created_at)} />
          <Row label="Updated" value={formatNvoccDate(booking.updated_at)} />
        </div>
        <div>
          <Row label="Voyage" value={voyageLabel} />
          <Row label="Cargo type" value={booking.cargo_type} />
          <Row label="Container type" value={booking.container_type_name || booking.container_type_id} />
          <Row label="Containers" value={booking.container_count} />
          <Row label="CBM allocated" value={booking.cbm_allocated} />
          <Row label="Job type" value={booking.job_type} />
        </div>
        <div>
          <Row label="Shipper" value={booking.shipper_name || booking.shipper_id} />
          <Row label="Consignee" value={booking.consignee_name || booking.consignee_id} />
          <Row label="Notify" value={booking.notify_name || booking.notify_id} />
          <Row label="Commodity" value={booking.commodity} />
          <Row label="HS code" value={booking.hs_code} />
          <Row label="Gross weight (kg)" value={booking.gross_weight} />
          <Row label="Pieces" value={booking.pieces} />
          <Row label="DG" value={booking.is_dg} />
          <Row label="Incoterms" value={booking.incoterms} />
          <Row label="Freight terms" value={booking.freight_terms} />
          <Row label="Shipper ref" value={booking.shipper_ref} />
        </div>
      </div>
    </Card>
  );
}
