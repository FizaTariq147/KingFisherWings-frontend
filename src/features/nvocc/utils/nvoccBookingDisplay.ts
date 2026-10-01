import type { NvoccBooking } from '../types/nvocc.types';

export function nvoccBookingRouteLabel(booking: NvoccBooking): string {
  if (booking.pol_name && booking.pod_name) {
    return `${booking.pol_name} → ${booking.pod_name}`;
  }
  return booking.voyage_label || '—';
}

export function nvoccBookingPartyLabel(
  booking: NvoccBooking,
  role: 'shipper' | 'consignee',
): string {
  if (role === 'shipper') {
    return booking.shipper_name?.trim() || booking.shipper_id?.slice(0, 8) || '—';
  }
  return booking.consignee_name?.trim() || booking.consignee_id?.slice(0, 8) || '—';
}

export function nvoccBookingWeightLabel(booking: NvoccBooking): string {
  const parts: string[] = [];
  if (booking.gross_weight != null) parts.push(`${booking.gross_weight} kg`);
  if (booking.pieces != null) parts.push(`${booking.pieces} pcs`);
  if (booking.container_count != null) parts.push(`${booking.container_count} ctr`);
  return parts.length ? parts.join(' · ') : '—';
}
