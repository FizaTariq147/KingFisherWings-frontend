interface TariffFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: 'all' | 'active' | 'inactive';
  onStatusChange: (v: 'all' | 'active' | 'inactive') => void;
  order: 'asc' | 'desc';
  onOrderChange: (v: 'asc' | 'desc') => void;
}

const selectClass =
  'h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

export function TariffFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  order,
  onOrderChange,
}: TariffFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search tariffs…"
        aria-label="Search tariffs"
        className="h-9 w-full lg:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        className={selectClass}
        aria-label="Sort order"
      >
        <option value="asc">Oldest first</option>
        <option value="desc">Newest first</option>
      </select>
    </div>
  );
}
