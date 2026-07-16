import { Input } from '@/components/ui/Input';
import {
  ACCOUNT_GROUPS,
  ACCOUNT_GROUP_LABELS,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  type AccountGroup,
  type AccountType,
} from '../../constants/chartOfAccount.constants';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface ChartOfAccountFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  accountGroup: AccountGroup | 'all';
  onAccountGroupChange: (v: AccountGroup | 'all') => void;
  accountType: AccountType | 'all';
  onAccountTypeChange: (v: AccountType | 'all') => void;
  postable: 'all' | 'yes' | 'no';
  onPostableChange: (v: 'all' | 'yes' | 'no') => void;
  status: 'all' | 'active' | 'inactive';
  onStatusChange: (v: 'all' | 'active' | 'inactive') => void;
}

export function ChartOfAccountFilters({
  search,
  onSearchChange,
  accountGroup,
  onAccountGroupChange,
  accountType,
  onAccountTypeChange,
  postable,
  onPostableChange,
  status,
  onStatusChange,
}: ChartOfAccountFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <Input
        label="Search"
        placeholder="Code or name…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Group</label>
        <select
          className={selectClass}
          value={accountGroup}
          onChange={(e) => onAccountGroupChange(e.target.value as AccountGroup | 'all')}
        >
          <option value="all">All groups</option>
          {ACCOUNT_GROUPS.map((g) => (
            <option key={g} value={g}>
              {ACCOUNT_GROUP_LABELS[g]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Type</label>
        <select
          className={selectClass}
          value={accountType}
          onChange={(e) => onAccountTypeChange(e.target.value as AccountType | 'all')}
        >
          <option value="all">All types</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {ACCOUNT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Postable</label>
        <select
          className={selectClass}
          value={postable}
          onChange={(e) => onPostableChange(e.target.value as 'all' | 'yes' | 'no')}
        >
          <option value="all">All</option>
          <option value="yes">Postable</option>
          <option value="no">Non-postable</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Status</label>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}
