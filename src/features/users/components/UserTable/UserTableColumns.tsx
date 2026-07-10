import type { UserSortField } from '../../constants/user.constants';

export interface UserTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

export const USER_TABLE_COLUMNS: UserTableColumn[] = [
  { key: 'first_name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'last_login_at', label: 'Last login', sortable: true, className: 'hidden md:table-cell' },
  { key: 'actions', label: 'Actions', className: 'text-right' },
];

const SORTABLE_KEYS = new Set<UserSortField>([
  'first_name',
  'last_name',
  'email',
  'role',
  'status',
  'last_login_at',
  'created_at',
]);

export function isSortableUserColumn(key: string): key is UserSortField {
  return SORTABLE_KEYS.has(key as UserSortField);
}
