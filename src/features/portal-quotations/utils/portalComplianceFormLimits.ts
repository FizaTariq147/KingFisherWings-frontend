/**
 * Field limits from OpenAPI UpsertNvoccBookingFormDto / NvoccBookingFormPartyDto /
 * SubmitNvoccComplianceFormDto (portal bookings + portal shipments compliance-form).
 */
export const PORTAL_COMPLIANCE_FORM_LIMITS = {
  voyage_ref: 50,
  client_booking_no: 50,
  pol: 100,
  pod: 100,
  origin_airport_code: 10,
  dest_airport_code: 10,
  commodity: 500,
  hs_code: 20,
  final_use: 200,
  booking_agent_line: 100,
  agent_requester_name: 200,
  sq_bl_booking_reference: 200,
  party_full_name: 300,
  party_city: 100,
  party_country: 100,
  pallet_type: 30,
} as const;

export function clipComplianceField(
  value: string | undefined,
  max: number,
): string | undefined {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}
