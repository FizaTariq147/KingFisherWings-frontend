import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useUsers } from '@/features/users/hooks/useUsers';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';

interface UserSearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (userId: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * User picker by name / email — stores user UUID, displays name.
 */
export function UserSearchSelect({
  name = 'user_id',
  label = 'User',
  value,
  onChange,
  required,
  error,
  placeholder = 'Search user by name…',
}: UserSearchSelectProps) {
  const [search, setSearch] = useState('');
  const accessToken = useAuthStore((s) => s.accessToken);
  const authUser = useAuthStore((s) => s.user);
  const tenantId =
    resolveSessionTenantIdFromAuth({ accessToken, user: authUser }) || 'session';
  const { data } = useUsers({
    tenantId,
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });

  const options = useMemo(() => {
    return (data?.users ?? [])
      .filter((u) => isUuid(u.id))
      .map((u) => {
        const nameText = String(u.full_name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()).trim();
        const email = String(u.email ?? '').trim();
        const labelText = [nameText || 'User', email].filter(Boolean).join(' · ');
        return { value: u.id, label: labelText };
      });
  }, [data?.users]);

  return (
    <SearchableSelect
      name={name}
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      onQueryChange={setSearch}
      required={required}
      error={error}
      placeholder={placeholder}
      emptyMessage="No users found"
      allowManualUuid={false}
    />
  );
}
