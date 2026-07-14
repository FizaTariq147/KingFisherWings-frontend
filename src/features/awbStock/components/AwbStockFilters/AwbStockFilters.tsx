const selectClass =
  'h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface FilterOption {
  value: string;
  label: string;
}

interface AwbStockFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  airlineId: string;
  onAirlineIdChange: (v: string) => void;
  airlineOptions: FilterOption[];
  branchId: string;
  onBranchIdChange: (v: string) => void;
  branchOptions: FilterOption[];
  lowStockOnly: boolean;
  onLowStockOnlyChange: (v: boolean) => void;
  order: 'asc' | 'desc';
  onOrderChange: (v: 'asc' | 'desc') => void;
}

export function AwbStockFilters({
  search,
  onSearchChange,
  airlineId,
  onAirlineIdChange,
  airlineOptions,
  branchId,
  onBranchIdChange,
  branchOptions,
  lowStockOnly,
  onLowStockOnlyChange,
  order,
  onOrderChange,
}: AwbStockFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search prefix, airline, range…"
        aria-label="Search AWB stock"
        className="h-9 w-full lg:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
      />
      <select
        value={airlineId}
        onChange={(e) => onAirlineIdChange(e.target.value)}
        className={`${selectClass} w-full lg:w-52`}
        aria-label="Filter by airline"
      >
        {airlineOptions.map((o) => (
          <option key={o.value || 'all-airlines'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={branchId}
        onChange={(e) => onBranchIdChange(e.target.value)}
        className={`${selectClass} w-full lg:w-52`}
        aria-label="Filter by branch"
      >
        {branchOptions.map((o) => (
          <option key={o.value || 'all-branches'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)] h-9 px-1">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => onLowStockOnlyChange(e.target.checked)}
        />
        Low stock only
      </label>
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        className={selectClass}
        aria-label="Sort order"
      >
        <option value="desc">Higher range first</option>
        <option value="asc">Lower range first</option>
      </select>
    </div>
  );
}
