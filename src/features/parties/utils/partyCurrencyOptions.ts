import { masterService } from '@/features/masters/services/master.service';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';

export type CurrencyOption = { value: string; label: string };

const COMMON_CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'AED', label: 'AED' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'SAR', label: 'SAR' },
  { value: 'INR', label: 'INR' },
  { value: 'CNY', label: 'CNY' },
  { value: 'HKD', label: 'HKD' },
  { value: 'SGD', label: 'SGD' },
  { value: 'JPY', label: 'JPY' },
  { value: 'DKK', label: 'DKK' },
];

/** Masters currencies merged with common codes (masters may only have AED). */
export async function loadPartyCurrencyOptions(): Promise<CurrencyOption[]> {
  const byCode = new Map<string, CurrencyOption>();
  for (const opt of COMMON_CURRENCY_OPTIONS) byCode.set(opt.value, opt);
  try {
    const res = await masterService.list(MASTER_PATHS.currencies, {
      page: 1,
      limit: 200,
      is_active: true,
    });
    for (const item of res.items) {
      const code = String(item.code ?? '')
        .trim()
        .toUpperCase();
      if (code.length === 3) byCode.set(code, { value: code, label: code });
    }
  } catch {
    // keep commons
  }
  return [...byCode.values()].sort((a, b) => a.value.localeCompare(b.value));
}
