import type { Tenant } from '../types/tenant.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function coerceOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickNestedCompany(raw: Record<string, unknown>): Record<string, unknown> | null {
  return (
    asRecord(raw.company) ||
    asRecord(raw.Company) ||
    asRecord(raw.default_company) ||
    asRecord(raw.defaultCompany) ||
    null
  );
}

/**
 * Resolve company name/code from the tenant payload only.
 * Platform Super Admin tokens cannot call tenant ERP `/companies` or `/users`.
 */
function resolveOwnCompany(tenant: Tenant): { name?: string; code?: string } {
  const raw = tenant as unknown as Record<string, unknown>;
  const nested = pickNestedCompany(raw);

  const name = pickString(
    nested?.name,
    nested?.company_name,
    tenant.company_name,
    tenant.display_name,
    tenant.name,
  );
  const code = pickString(nested?.code, nested?.company_code, tenant.company_code, tenant.code);

  if (!name && !code) return {};
  return {
    name: name || undefined,
    code: code || undefined,
  };
}

function pickTenantUserCount(tenant: Tenant): number {
  const raw = tenant as unknown as Record<string, unknown>;
  const stats = asRecord(raw.stats) || asRecord(raw.statistics) || asRecord(raw._count);
  return (
    coerceOptionalNumber(
      tenant.total_users ??
        raw.total_users ??
        raw.users_count ??
        raw.user_count ??
        raw.totalUsers ??
        stats?.users ??
        stats?.user ??
        stats?.total_users,
    ) ?? 0
  );
}

/**
 * Fill each tenant row with company name + user count from `/tenants` payload only.
 * Do not call tenant ERP APIs with a platform Super Admin token.
 */
export async function enrichTenantListMetrics(tenants: Tenant[]): Promise<Tenant[]> {
  if (!tenants.length) return tenants;

  return tenants.map((tenant) => {
    const company = resolveOwnCompany(tenant);
    return {
      ...tenant,
      company_name: company.name || tenant.company_name || '',
      company_code: company.code || tenant.company_code || '',
      total_users: pickTenantUserCount(tenant),
    };
  });
}
