/**
 * Field limits from OpenAPI UpsertAirBookingFormDto / AirBookingFormPartyDto.
 * Keep UI + submit payload aligned with backend validation.
 */
export const AIR_BOOKING_FORM_LIMITS = {
  commodity: 500,
  flight_number: 20,
  origin_airport_code: 10,
  dest_airport_code: 10,
  arrival_flight_number: 20,
  mawb_from_origin: 50,
  agent_at_origin: 200,
  party_full_name: 300,
  party_city: 100,
  party_country: 100,
} as const;

/** Prefer IATA-style codes (≤10). Reject long port/city names from compliance POL/POD. */
export function normalizeAirportCode(raw?: string | null): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  // "DXB - Dubai" / "DXB/Dubai" → DXB
  const token = value.split(/[\s,/\-|–—]+/)[0]?.trim() ?? '';
  const candidate = (token || value).toUpperCase();
  if (candidate.length > AIR_BOOKING_FORM_LIMITS.origin_airport_code) return '';
  // Allow IATA/ICAO-ish codes
  if (!/^[A-Z0-9]{2,10}$/.test(candidate)) return '';
  return candidate;
}

export function clipAirField(
  value: string | undefined,
  max: number,
): string | undefined {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}
