import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { getCountry, parsePhone } from '@/lib/countries';

/** Validate phone with libphonenumber (E.164 storage). */
export function isValidLibPhone(
  value: string,
  preferredIso?: string | null,
): boolean {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return false;

  const preferred = preferredIso
    ? (String(preferredIso).trim().toUpperCase() as CountryCode)
    : undefined;

  const parsedPreferred = preferred
    ? parsePhoneNumberFromString(trimmed, preferred)
    : undefined;
  if (parsedPreferred?.isValid()) return true;

  const parsed = parsePhoneNumberFromString(trimmed);
  if (parsed?.isValid()) {
    if (!preferred) return true;
    return parsed.country === preferred;
  }

  // Fallback for incomplete catalog countries: national length from our dial table.
  const country = getCountry(preferredIso || parsePhone(trimmed, preferredIso || undefined).iso2);
  if (!country) return false;
  const national = parsePhone(trimmed, country.iso2).national;
  return national.length >= country.phoneMin && national.length <= country.phoneMax;
}

export function phoneValidationHint(preferredIso?: string | null): {
  countryName: string;
  dial: string;
  example?: string;
} | null {
  const country = getCountry(preferredIso);
  if (!country) return null;
  return {
    countryName: country.name,
    dial: country.dial,
    example: country.example,
  };
}
