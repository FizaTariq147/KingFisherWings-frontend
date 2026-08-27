import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { masterService } from '@/features/masters/services/master.service';
import { loadPartyCurrencyOptions, type CurrencyOption } from '@/features/parties/utils/partyCurrencyOptions';

/** Currencies from masters merged with common codes (same source as quotations/invoices). */
export async function loadWmsCurrencyOptions(): Promise<CurrencyOption[]> {
  const byCode = new Map<string, CurrencyOption>();
  for (const opt of await loadPartyCurrencyOptions()) {
    byCode.set(opt.value, opt);
  }
  try {
    const res = await masterService.list(MASTER_PATHS.currencies, {
      page: 1,
      limit: 500,
      is_active: true,
    });
    for (const item of res.items) {
      const code = String(item.code ?? '')
        .trim()
        .toUpperCase();
      const name = String(item.name ?? '').trim();
      if (code.length === 3) {
        byCode.set(code, { value: code, label: name ? `${code} (${name})` : code });
      }
    }
  } catch {
    // keep commons
  }
  return [...byCode.values()].sort((a, b) => a.value.localeCompare(b.value));
}
