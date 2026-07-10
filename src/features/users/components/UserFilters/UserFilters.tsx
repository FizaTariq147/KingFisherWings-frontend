import { USER_ROLES, USER_STATUSES } from '../../constants/user.constants';
import type { UserRole, UserStatus } from '../../constants/user.constants';
import { formatUserRole } from '../../utils/formatUserRole';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: UserStatus | 'all';
  onStatusChange: (value: UserStatus | 'all') => void;
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
        {(['all', ...USER_STATUSES] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === value
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
            }`}
          >
            {value === 'all' ? 'All statuses' : formatUserRole(value)}
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
        {USER_ROLES.map((r) => (
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
