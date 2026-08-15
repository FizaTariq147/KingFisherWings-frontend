export const MANAGEMENT_SELECT_CLASS =
  'w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white';

export const DATE_RANGE_PRESETS = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'YTD' },
  { value: 'custom', label: 'Custom' },
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]['value'];

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function resolveDateRangePreset(preset: DateRangePreset): { from_date: string; to_date: string } | null {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (preset === 'this_month') {
    return {
      from_date: isoDate(new Date(year, month, 1)),
      to_date: isoDate(new Date(year, month + 1, 0)),
    };
  }
  if (preset === 'last_month') {
    return {
      from_date: isoDate(new Date(year, month - 1, 1)),
      to_date: isoDate(new Date(year, month, 0)),
    };
  }
  if (preset === 'this_quarter') {
    const quarterStart = Math.floor(month / 3) * 3;
    return {
      from_date: isoDate(new Date(year, quarterStart, 1)),
      to_date: isoDate(new Date(year, quarterStart + 3, 0)),
    };
  }
  if (preset === 'ytd') {
    return { from_date: `${year}-01-01`, to_date: isoDate(now) };
  }
  return null;
}

export function filterRowsBySearch<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
): T[] {
  const term = query.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) =>
    Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term)),
  );
}

export function isWithinDateRange(
  value: string | undefined,
  fromDate?: string,
  toDate?: string,
): boolean {
  if (!fromDate && !toDate) return true;
  if (!value) return !fromDate && !toDate;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return true;
  if (fromDate && time < Date.parse(fromDate)) return false;
  if (toDate && time > Date.parse(`${toDate}T23:59:59`)) return false;
  return true;
}
