import {
  isReportSearchActive,
  reportCatalogRowMatchesSearch,
  sortReportSearchResults,
  type ReportSearchableRow,
} from './reportCatalogSearch';

type StripRow = { code: string; name: string };

/**
 * Apply Family/Context code allow-list + live search to a format browse strip.
 */
export function filterCatalogStripRows<T extends StripRow>(
  rows: readonly T[],
  options: {
    searchQuery?: string;
    allowedCodes?: ReadonlySet<string> | null;
    selectedCode?: string;
    toSearchable?: (row: T) => ReportSearchableRow;
  } = {},
): { items: T[]; scopedTotal: number; filterActive: boolean } {
  const searchQuery = options.searchQuery ?? '';
  const selected = (options.selectedCode ?? '').trim().toUpperCase();
  const allowed = options.allowedCodes;

  const scoped = !allowed
    ? [...rows]
    : rows.filter((row) => {
        const code = row.code.toUpperCase();
        return allowed.has(code) || (selected !== '' && code === selected);
      });

  const qActive = isReportSearchActive(searchQuery);
  const toSearchable =
    options.toSearchable ??
    ((row: T): ReportSearchableRow => ({ name: row.name, code: row.code }));

  const items = qActive
    ? sortReportSearchResults(
        scoped.filter((row) => reportCatalogRowMatchesSearch(toSearchable(row), searchQuery)),
        searchQuery,
      )
    : scoped;

  return {
    items,
    scopedTotal: scoped.length,
    filterActive: qActive || Boolean(allowed),
  };
}

/** True when a strip should render for the current Family/Context allow-list. */
export function catalogStripVisibleForAllowList(
  codes: readonly string[],
  allowedCodes: ReadonlySet<string> | null | undefined,
  selectedOrForced = false,
): boolean {
  if (selectedOrForced) return true;
  if (!allowedCodes) return true;
  return codes.some((code) => allowedCodes.has(code.toUpperCase()));
}
