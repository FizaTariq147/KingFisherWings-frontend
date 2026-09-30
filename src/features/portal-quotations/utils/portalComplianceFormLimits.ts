import { API_MAX_LENGTH } from '@/lib/api/apiSchema.generated';

const NVOCC = API_MAX_LENGTH.UpsertNvoccBookingFormDto;
const AIR = API_MAX_LENGTH.UpsertAirComplianceBookingFormDto;
const PARTY = API_MAX_LENGTH.NvoccBookingFormPartyDto;

/**
 * Field limits from OpenAPI UpsertNvoccBookingFormDto / NvoccBookingFormPartyDto /
 * UpsertAirComplianceBookingFormDto (portal bookings + portal shipments compliance-form).
 */
export const PORTAL_COMPLIANCE_FORM_LIMITS = {
  voyage_ref: NVOCC.voyage_ref,
  client_booking_no: NVOCC.client_booking_no,
  pol: NVOCC.pol,
  pod: NVOCC.pod,
  origin_airport_code: AIR.origin_airport_code,
  dest_airport_code: AIR.dest_airport_code,
  commodity: NVOCC.commodity,
  hs_code: NVOCC.hs_code,
  final_use: NVOCC.final_use,
  booking_agent_line: NVOCC.booking_agent_line,
  agent_requester_name: NVOCC.agent_requester_name,
  sq_bl_booking_reference: NVOCC.sq_bl_booking_reference,
  party_full_name: PARTY.full_name,
  party_city: PARTY.city,
  party_country: PARTY.country,
  pallet_type: API_MAX_LENGTH.AirPalletLineDto.pallet_type,
} as const;

export function clipComplianceField(
  value: string | undefined,
  max: number,
): string | undefined {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}
