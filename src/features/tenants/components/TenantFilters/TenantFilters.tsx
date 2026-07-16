import type { TenantStatusFilter } from '../../utils/filterTenants';

const STATUS_OPTIONS: { value: TenantStatusFilter | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
] as const;

interface TenantFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: TenantStatusFilter | 'all';
  onStatusChange: (v: TenantStatusFilter | 'all') => void;
}

export function TenantFilters({ search, onSearchChange, status, onStatusChange }: TenantFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onStatusChange(s.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === s.value
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by company name or code…"
        aria-label="Search tenants"
        className="h-9 w-full sm:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:border-[var(--color-primary-500)]"
      />
    </div>
  );
}
