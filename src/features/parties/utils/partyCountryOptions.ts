import { masterService } from '@/features/masters/services/master.service';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { pickCountryIsoCode } from '@/features/masters/utils/normalizeMasterRecord';

export type CountryOption = { value: string; label: string };

/**
 * Common ISO-3166-1 alpha-2 codes for party forms.
 * Masters may only have AE seeded — merge these so foreign parties (e.g. DK) are selectable.
 */
export const COMMON_COUNTRY_OPTIONS: CountryOption[] = [
  { value: 'AE', label: 'United Arab Emirates (AE)' },
  { value: 'SA', label: 'Saudi Arabia (SA)' },
  { value: 'OM', label: 'Oman (OM)' },
  { value: 'BH', label: 'Bahrain (BH)' },
  { value: 'QA', label: 'Qatar (QA)' },
  { value: 'KW', label: 'Kuwait (KW)' },
  { value: 'IN', label: 'India (IN)' },
  { value: 'PK', label: 'Pakistan (PK)' },
  { value: 'BD', label: 'Bangladesh (BD)' },
  { value: 'CN', label: 'China (CN)' },
  { value: 'HK', label: 'Hong Kong (HK)' },
  { value: 'SG', label: 'Singapore (SG)' },
  { value: 'MY', label: 'Malaysia (MY)' },
  { value: 'ID', label: 'Indonesia (ID)' },
  { value: 'TH', label: 'Thailand (TH)' },
  { value: 'VN', label: 'Vietnam (VN)' },
  { value: 'JP', label: 'Japan (JP)' },
  { value: 'KR', label: 'South Korea (KR)' },
  { value: 'US', label: 'United States (US)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'NL', label: 'Netherlands (NL)' },
  { value: 'BE', label: 'Belgium (BE)' },
  { value: 'FR', label: 'France (FR)' },
  { value: 'IT', label: 'Italy (IT)' },
  { value: 'ES', label: 'Spain (ES)' },
  { value: 'DK', label: 'Denmark (DK)' },
  { value: 'NO', label: 'Norway (NO)' },
  { value: 'SE', label: 'Sweden (SE)' },
  { value: 'CH', label: 'Switzerland (CH)' },
  { value: 'TR', label: 'Turkey (TR)' },
  { value: 'EG', label: 'Egypt (EG)' },
  { value: 'ZA', label: 'South Africa (ZA)' },
  { value: 'AU', label: 'Australia (AU)' },
  { value: 'NZ', label: 'New Zealand (NZ)' },
  { value: 'BR', label: 'Brazil (BR)' },
  { value: 'CA', label: 'Canada (CA)' },
];

function mergeCountryOptions(fromApi: CountryOption[]): CountryOption[] {
  const byCode = new Map<string, CountryOption>();
  for (const opt of COMMON_COUNTRY_OPTIONS) {
    byCode.set(opt.value, opt);
  }
  // Masters labels win when present
  for (const opt of fromApi) {
    byCode.set(opt.value, opt);
  }
  return [...byCode.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Load Masters countries and merge with common ISO codes. */
export async function loadPartyCountryOptions(): Promise<CountryOption[]> {
  try {
    const active = await masterService.list(MASTER_PATHS.countries, {
      page: 1,
      limit: 200,
      is_active: true,
    });
    let items = active.items;
    if (items.length === 0) {
      const all = await masterService.list(MASTER_PATHS.countries, { page: 1, limit: 200 });
      items = all.items;
    }
    const fromApi = items
      .map((item) => {
        const iso = pickCountryIsoCode(item);
        if (!iso) return null;
        const name = String(item.name ?? iso);
        return { value: iso, label: `${name} (${iso})` };
      })
      .filter((o): o is CountryOption => Boolean(o));
    return mergeCountryOptions(fromApi);
  } catch {
    return [...COMMON_COUNTRY_OPTIONS].sort((a, b) => a.label.localeCompare(b.label));
  }
}
