import { isUuid } from '@/lib/isUuid';
import { useTenantsList } from '@/features/tenants/hooks/useTenants';
import { useUserTenantScope } from '../../hooks/useUserTenantScope';

export function UserTenantSelector() {
  const { tenantId, setTenantId } = useUserTenantScope();
  const { data, isLoading } = useTenantsList({ limit: 200 });

  const tenants = data?.tenants ?? [];

  const tenantOptions = [];
  for (const t of tenants) {
    if (!isUuid(t.id)) continue;
    tenantOptions.push(
      <option key={t.id} value={t.id}>
        {t.display_name} ({t.code})
      </option>,
    );
  }

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor="user-tenant-select" className="text-xs font-medium text-[var(--color-neutral-600)] shrink-0">
        Tenant workspace
      </label>
      <select
        id="user-tenant-select"
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
        disabled={isLoading}
        className="h-9 w-full sm:max-w-md rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]"
      >
        <option value="">{isLoading ? 'Loading tenants…' : 'Select a tenant…'}</option>
        {tenantOptions}
      </select>
    </div>
  );
}
