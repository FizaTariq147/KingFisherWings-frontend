import { API_MAX_LENGTH } from '@/lib/api/apiSchema.generated';

const FORM = API_MAX_LENGTH.UpsertAirBookingFormDto;
const PARTY = API_MAX_LENGTH.AirBookingFormPartyDto;

/**
 * Field limits from OpenAPI UpsertAirBookingFormDto / AirBookingFormPartyDto.
 * Keep UI + submit payload aligned with backend validation.
 */
export const AIR_BOOKING_FORM_LIMITS = {
  commodity: FORM.commodity,
  flight_number: FORM.flight_number,
  origin_airport_code: FORM.origin_airport_code,
  dest_airport_code: FORM.dest_airport_code,
  arrival_flight_number: FORM.arrival_flight_number,
  mawb_from_origin: FORM.mawb_from_origin,
  agent_at_origin: FORM.agent_at_origin,
  party_full_name: PARTY.full_name,
  party_city: PARTY.city,
  party_country: PARTY.country,
  pallet_type: API_MAX_LENGTH.AirPalletLineDto.pallet_type,
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
