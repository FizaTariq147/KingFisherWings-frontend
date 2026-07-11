import { USER_ROLES } from '../../constants/user.constants';
import type { UserRole } from '../../constants/user.constants';
import { formatUserRole } from '../../utils/formatUserRole';

/** Lifecycle chips — same pattern as Tenant list (All / Active / Inactive / Deleted). */
export type UserLifecycleFilter = 'all' | 'active' | 'inactive' | 'deleted';

const LIFECYCLE_OPTIONS: { value: UserLifecycleFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
];

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: UserLifecycleFilter;
  onStatusChange: (value: UserLifecycleFilter) => void;
  role: UserRole | 'all';
  onRoleChange: (value: UserRole | 'all') => void;
}

export function UserFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  role,
  onRoleChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <div className="flex flex-wrap gap-1">
        {LIFECYCLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === option.value
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value as UserRole | 'all')}
        aria-label="Filter by role"
        className="h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]"
      >
        <option value="all">All roles</option>
        {USER_ROLES.filter((r) => r !== 'SUPER_ADMIN' && r !== 'TENANT_ADMIN').map((r) => (
          <option key={r} value={r}>
            {formatUserRole(r)}
          </option>
        ))}
      </select>

      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search name, email, or phone…"
        aria-label="Search users"
        className="h-9 w-full lg:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:border-[var(--color-primary-500)]"
      />
    </div>
  );
}
