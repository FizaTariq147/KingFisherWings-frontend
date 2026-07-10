import type { CompanyStatusFilter } from '../../utils/filterCompanies';

const STATUS_OPTIONS: { value: CompanyStatusFilter | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
];

interface CompanyFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: CompanyStatusFilter | 'all';
  onStatusChange: (v: CompanyStatusFilter | 'all') => void;
}

export function CompanyFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: CompanyFiltersProps) {
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
        placeholder="Search by name or code…"
        aria-label="Search companies"
        className="h-9 w-full sm:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:border-[var(--color-primary-500)]"
      />
    </div>
  );
}
