/** ISO country metadata for flag pickers + country-aware phone validation. */

export interface CountryMeta {
  iso2: string;
  name: string;
  dial: string;
  /** National significant number length (min). */
  phoneMin: number;
  /** National significant number length (max). */
  phoneMax: number;
  /** Example national digits (without dial). */
  example?: string;
}

/** Flag emoji from ISO-3166 alpha-2. */
export function countryFlag(iso2: string): string {
  const code = String(iso2 ?? '')
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '🏳️';
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (code.charCodeAt(0) - 65), A + (code.charCodeAt(1) - 65));
}

/**
 * Broad country set with ITU dial codes and typical national lengths.
 * Stored phone is expected as +{dial}{nationalDigits}.
 */
export const COUNTRIES: CountryMeta[] = [
  { iso2: 'AE', name: 'United Arab Emirates', dial: '971', phoneMin: 9, phoneMax: 9, example: '501234567' },
  { iso2: 'SA', name: 'Saudi Arabia', dial: '966', phoneMin: 9, phoneMax: 9, example: '512345678' },
  { iso2: 'OM', name: 'Oman', dial: '968', phoneMin: 8, phoneMax: 8, example: '91234567' },
  { iso2: 'BH', name: 'Bahrain', dial: '973', phoneMin: 8, phoneMax: 8, example: '36123456' },
  { iso2: 'QA', name: 'Qatar', dial: '974', phoneMin: 8, phoneMax: 8, example: '33123456' },
  { iso2: 'KW', name: 'Kuwait', dial: '965', phoneMin: 8, phoneMax: 8, example: '50123456' },
  { iso2: 'IQ', name: 'Iraq', dial: '964', phoneMin: 10, phoneMax: 10, example: '7901234567' },
  { iso2: 'JO', name: 'Jordan', dial: '962', phoneMin: 9, phoneMax: 9, example: '790123456' },
  { iso2: 'LB', name: 'Lebanon', dial: '961', phoneMin: 7, phoneMax: 8, example: '71123456' },
  { iso2: 'EG', name: 'Egypt', dial: '20', phoneMin: 10, phoneMax: 10, example: '1001234567' },
  { iso2: 'PK', name: 'Pakistan', dial: '92', phoneMin: 10, phoneMax: 10, example: '3012345678' },
  { iso2: 'IN', name: 'India', dial: '91', phoneMin: 10, phoneMax: 10, example: '9876543210' },
  { iso2: 'BD', name: 'Bangladesh', dial: '880', phoneMin: 10, phoneMax: 10, example: '1812345678' },
  { iso2: 'LK', name: 'Sri Lanka', dial: '94', phoneMin: 9, phoneMax: 9, example: '712345678' },
  { iso2: 'NP', name: 'Nepal', dial: '977', phoneMin: 10, phoneMax: 10, example: '9841234567' },
  { iso2: 'CN', name: 'China', dial: '86', phoneMin: 11, phoneMax: 11, example: '13123456789' },
  { iso2: 'HK', name: 'Hong Kong', dial: '852', phoneMin: 8, phoneMax: 8, example: '51234567' },
  { iso2: 'TW', name: 'Taiwan', dial: '886', phoneMin: 9, phoneMax: 9, example: '912345678' },
  { iso2: 'JP', name: 'Japan', dial: '81', phoneMin: 10, phoneMax: 10, example: '9012345678' },
  { iso2: 'KR', name: 'South Korea', dial: '82', phoneMin: 9, phoneMax: 11, example: '1023456789' },
  { iso2: 'SG', name: 'Singapore', dial: '65', phoneMin: 8, phoneMax: 8, example: '81234567' },
  { iso2: 'MY', name: 'Malaysia', dial: '60', phoneMin: 9, phoneMax: 10, example: '123456789' },
  { iso2: 'ID', name: 'Indonesia', dial: '62', phoneMin: 9, phoneMax: 12, example: '812345678' },
  { iso2: 'TH', name: 'Thailand', dial: '66', phoneMin: 9, phoneMax: 9, example: '812345678' },
  { iso2: 'VN', name: 'Vietnam', dial: '84', phoneMin: 9, phoneMax: 10, example: '912345678' },
  { iso2: 'PH', name: 'Philippines', dial: '63', phoneMin: 10, phoneMax: 10, example: '9171234567' },
  { iso2: 'AU', name: 'Australia', dial: '61', phoneMin: 9, phoneMax: 9, example: '412345678' },
  { iso2: 'NZ', name: 'New Zealand', dial: '64', phoneMin: 8, phoneMax: 10, example: '211234567' },
  { iso2: 'US', name: 'United States', dial: '1', phoneMin: 10, phoneMax: 10, example: '2015550123' },
  { iso2: 'CA', name: 'Canada', dial: '1', phoneMin: 10, phoneMax: 10, example: '4165550123' },
  { iso2: 'MX', name: 'Mexico', dial: '52', phoneMin: 10, phoneMax: 10, example: '5512345678' },
  { iso2: 'BR', name: 'Brazil', dial: '55', phoneMin: 10, phoneMax: 11, example: '11912345678' },
  { iso2: 'AR', name: 'Argentina', dial: '54', phoneMin: 10, phoneMax: 11, example: '91123456789' },
  { iso2: 'CL', name: 'Chile', dial: '56', phoneMin: 9, phoneMax: 9, example: '912345678' },
  { iso2: 'CO', name: 'Colombia', dial: '57', phoneMin: 10, phoneMax: 10, example: '3001234567' },
  { iso2: 'GB', name: 'United Kingdom', dial: '44', phoneMin: 10, phoneMax: 10, example: '7400123456' },
  { iso2: 'IE', name: 'Ireland', dial: '353', phoneMin: 9, phoneMax: 9, example: '851234567' },
  { iso2: 'DE', name: 'Germany', dial: '49', phoneMin: 10, phoneMax: 12, example: '15123456789' },
  { iso2: 'FR', name: 'France', dial: '33', phoneMin: 9, phoneMax: 9, example: '612345678' },
  { iso2: 'ES', name: 'Spain', dial: '34', phoneMin: 9, phoneMax: 9, example: '612345678' },
  { iso2: 'IT', name: 'Italy', dial: '39', phoneMin: 9, phoneMax: 10, example: '3123456789' },
  { iso2: 'PT', name: 'Portugal', dial: '351', phoneMin: 9, phoneMax: 9, example: '912345678' },
  { iso2: 'NL', name: 'Netherlands', dial: '31', phoneMin: 9, phoneMax: 9, example: '612345678' },
  { iso2: 'BE', name: 'Belgium', dial: '32', phoneMin: 9, phoneMax: 9, example: '470123456' },
  { iso2: 'LU', name: 'Luxembourg', dial: '352', phoneMin: 9, phoneMax: 9, example: '621123456' },
  { iso2: 'CH', name: 'Switzerland', dial: '41', phoneMin: 9, phoneMax: 9, example: '781234567' },
  { iso2: 'AT', name: 'Austria', dial: '43', phoneMin: 10, phoneMax: 13, example: '6641234567' },
  { iso2: 'SE', name: 'Sweden', dial: '46', phoneMin: 9, phoneMax: 10, example: '701234567' },
  { iso2: 'NO', name: 'Norway', dial: '47', phoneMin: 8, phoneMax: 8, example: '40612345' },
  { iso2: 'DK', name: 'Denmark', dial: '45', phoneMin: 8, phoneMax: 8, example: '20123456' },
  { iso2: 'FI', name: 'Finland', dial: '358', phoneMin: 9, phoneMax: 10, example: '401234567' },
  { iso2: 'PL', name: 'Poland', dial: '48', phoneMin: 9, phoneMax: 9, example: '512345678' },
  { iso2: 'CZ', name: 'Czechia', dial: '420', phoneMin: 9, phoneMax: 9, example: '601123456' },
  { iso2: 'HU', name: 'Hungary', dial: '36', phoneMin: 9, phoneMax: 9, example: '201234567' },
  { iso2: 'RO', name: 'Romania', dial: '40', phoneMin: 9, phoneMax: 9, example: '712345678' },
  { iso2: 'GR', name: 'Greece', dial: '30', phoneMin: 10, phoneMax: 10, example: '6912345678' },
  { iso2: 'TR', name: 'Turkey', dial: '90', phoneMin: 10, phoneMax: 10, example: '5012345678' },
  { iso2: 'RU', name: 'Russia', dial: '7', phoneMin: 10, phoneMax: 10, example: '9123456789' },
  { iso2: 'UA', name: 'Ukraine', dial: '380', phoneMin: 9, phoneMax: 9, example: '501234567' },
  { iso2: 'ZA', name: 'South Africa', dial: '27', phoneMin: 9, phoneMax: 9, example: '711234567' },
  { iso2: 'NG', name: 'Nigeria', dial: '234', phoneMin: 10, phoneMax: 10, example: '8021234567' },
  { iso2: 'KE', name: 'Kenya', dial: '254', phoneMin: 9, phoneMax: 9, example: '712345678' },
  { iso2: 'GH', name: 'Ghana', dial: '233', phoneMin: 9, phoneMax: 9, example: '241234567' },
  { iso2: 'MA', name: 'Morocco', dial: '212', phoneMin: 9, phoneMax: 9, example: '612345678' },
  { iso2: 'TN', name: 'Tunisia', dial: '216', phoneMin: 8, phoneMax: 8, example: '20123456' },
  { iso2: 'DZ', name: 'Algeria', dial: '213', phoneMin: 9, phoneMax: 9, example: '551234567' },
  { iso2: 'IL', name: 'Israel', dial: '972', phoneMin: 9, phoneMax: 9, example: '501234567' },
];

const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso2, c]));

export function getCountry(iso2?: string | null): CountryMeta | undefined {
  if (!iso2) return undefined;
  return BY_ISO.get(String(iso2).trim().toUpperCase());
}

export function getCountryOptions(): Array<CountryMeta & { flag: string; label: string }> {
  return [...COUNTRIES]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      ...c,
      flag: countryFlag(c.iso2),
      label: `${countryFlag(c.iso2)} ${c.name} (${c.iso2})`,
    }));
}

/** Unique E.164 dial codes for master dropdowns (e.g. Create Country). */
export function getDialCodeOptions(): Array<{ value: string; label: string }> {
  const byDial = new Map<string, string[]>();
  for (const c of COUNTRIES) {
    const dial = `+${c.dial}`;
    const names = byDial.get(dial) ?? [];
    names.push(c.name);
    byDial.set(dial, names);
  }
  return [...byDial.entries()]
    .sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
    .map(([dial, names]) => {
      const preview =
        names.length === 1
          ? names[0]
          : `${names.slice(0, 2).join(', ')}${names.length > 2 ? ` +${names.length - 2}` : ''}`;
      return { value: dial, label: `${dial} — ${preview}` };
    });
}

export function digitsOnly(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}

/** Parse stored phone into country + national digits (best effort). */
export function parsePhone(value: string, preferredIso?: string): {
  iso2: string;
  national: string;
  dial: string;
} {
  const digits = digitsOnly(value);
  const preferred = getCountry(preferredIso);

  if (preferred && digits.startsWith(preferred.dial)) {
    return {
      iso2: preferred.iso2,
      dial: preferred.dial,
      national: digits.slice(preferred.dial.length),
    };
  }

  // Longest dial-code match first (avoid "1" stealing "971").
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (digits.startsWith(c.dial)) {
      const national = digits.slice(c.dial.length);
      if (national.length >= c.phoneMin - 1) {
        return { iso2: c.iso2, dial: c.dial, national };
      }
    }
  }

  const fallback = preferred ?? getCountry('AE')!;
  return {
    iso2: fallback.iso2,
    dial: fallback.dial,
    national: digits.startsWith(fallback.dial) ? digits.slice(fallback.dial.length) : digits,
  };
}

/** Build E.164-ish value: +{dial}{national}. */
export function formatInternationalPhone(iso2: string, nationalInput: string): string {
  const country = getCountry(iso2) ?? getCountry('AE')!;
  let national = digitsOnly(nationalInput);
  // Drop a single leading 0 (trunk prefix) common in many countries.
  if (national.startsWith('0')) national = national.slice(1);
  if (!national) return '';
  return `+${country.dial}${national}`;
}

export function isValidNationalPhone(iso2: string, nationalOrFull: string): boolean {
  const country = getCountry(iso2);
  if (!country) {
    const digits = digitsOnly(nationalOrFull);
    return digits.length >= 7 && digits.length <= 15;
  }
  const parsed = parsePhone(nationalOrFull, iso2);
  const national =
    parsed.iso2 === country.iso2 ? parsed.national : digitsOnly(nationalOrFull).replace(/^0/, '');
  const len = national.length;
  return len >= country.phoneMin && len <= country.phoneMax;
}
