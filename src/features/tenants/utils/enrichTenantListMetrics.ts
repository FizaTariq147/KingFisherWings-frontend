import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { COMPANY_API } from '@/features/companies/api/company.api';
import { USER_API } from '@/features/users/api/user.api';
import type { Tenant } from '../types/tenant.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.results)) return record.results;
  if (Array.isArray(record.users)) return record.users;
  if (Array.isArray(record.companies)) return record.companies;
  return [];
}

function pickMetaTotal(payload: unknown): number | undefined {
  const record = asRecord(payload);
  if (!record) return undefined;

  const meta =
    asRecord(record.meta) ||
    asRecord(asRecord(record.data)?.meta) ||
    null;

  const total = meta?.total ?? meta?.totalCount ?? meta?.count ?? record.total;
  if (typeof total === 'number' && Number.isFinite(total)) return total;
  if (typeof total === 'string' && total.trim()) {
    const n = Number(total);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function companyBelongsToTenant(
  company: Record<string, unknown>,
  tenantId: string,
): boolean {
  const linked = pickString(
    company.tenant_id,
    company.tenantId,
    asRecord(company.tenant)?.id,
  );
  return Boolean(linked) && linked === tenantId;
}

/**
 * How well a company profile matches this tenant.
 * Used when GET /companies ignores X-Tenant-Id and returns a global list.
 */
function companyOwnershipScore(
  tenant: Tenant,
  company: Record<string, unknown>,
): number {
  if (companyBelongsToTenant(company, tenant.id)) return 100;

  const companyName = pickString(company.name, company.company_name).toLowerCase();
  const companyCode = pickString(company.code, company.company_code).toLowerCase();
  const tenantName = pickString(tenant.display_name, tenant.name).toLowerCase();
  const tenantCode = pickString(tenant.code).toLowerCase();
  const tenantCompanyName = pickString(tenant.company_name).toLowerCase();
  const tenantCompanyCode = pickString(tenant.company_code).toLowerCase();

  if (tenantCompanyName && companyName && tenantCompanyName === companyName) return 90;
  if (tenantCompanyCode && companyCode && tenantCompanyCode === companyCode) return 85;
  if (tenantName && companyName && tenantName === companyName) return 80;

  const codePrefix = companyCode.split('-')[0] ?? '';
  if (codePrefix && tenantCode && tenantCode.startsWith(codePrefix)) return 70;
  if (codePrefix && tenantCode && tenantCode.includes(codePrefix)) return 60;

  const companyFirst = companyName.split(/\s+/)[0] ?? '';
  const tenantFirst = tenantName.split(/\s+/)[0] ?? '';
  if (companyFirst.length > 2 && tenantName.includes(companyFirst)) return 40;
  if (tenantFirst.length > 2 && companyName.includes(tenantFirst)) return 40;

  return 0;
}

/**
 * Resolve only this tenant's company — never borrow another tenant's profile.
 * GET /companies may return the same global list for every X-Tenant-Id.
 */
async function resolveOwnCompany(
  tenant: Tenant,
): Promise<{ name?: string; code?: string }> {
  // Prefer denormalized fields stored on the tenant row at create/update.
  const storedName = pickString(tenant.company_name);
  const storedCode = pickString(tenant.company_code);

  try {
    const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(COMPANY_API.list, {
      headers: { 'X-Tenant-Id': tenant.id },
      params: { limit: 100 },
    });

    const companies = unwrapList(res.data?.data ?? res.data)
      .map((item) => asRecord(item))
      .filter(Boolean) as Record<string, unknown>[];

    if (companies.length) {
      const owned = companies.filter((c) => companyBelongsToTenant(c, tenant.id));
      const pool = owned.length > 0 ? owned : companies;

      const ranked = pool
        .map((company) => ({
          company,
          score: companyOwnershipScore(tenant, company),
        }))
        .filter((row) => (owned.length > 0 ? row.score >= 0 : row.score >= 40))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const aDefault = a.company.is_default === true ? 1 : 0;
          const bDefault = b.company.is_default === true ? 1 : 0;
          return bDefault - aDefault;
        });

      const best = ranked[0]?.company;
      if (best) {
        return {
          name: pickString(best.name, best.company_name, storedName) || undefined,
          code: pickString(best.code, best.company_code, storedCode) || undefined,
        };
      }
    }
  } catch {
    // Fall through to stored tenant fields.
  }

  // Only this tenant's own stored company fields — never another tenant's company.
  if (storedName) {
    return { name: storedName, code: storedCode || undefined };
  }

  return {};
}

/**
 * Roles provisioned with the tenant (not created via Tenant Admin → Add user).
 */
function isProvisionedOwnerRole(role: unknown): boolean {
  const raw =
    typeof role === 'string'
      ? role
      : role && typeof role === 'object'
        ? String(
            (role as { slug?: unknown; name?: unknown; code?: unknown }).slug ??
              (role as { name?: unknown }).name ??
              (role as { code?: unknown }).code ??
              '',
          )
        : '';
  const normalized = raw.toLowerCase().replace(/-/g, '_');
  return (
    normalized === 'tenant_admin' ||
    normalized === 'tenantadmin' ||
    normalized === 'super_admin' ||
    normalized === 'superadmin' ||
    normalized.includes('tenant_admin') ||
    normalized.includes('super_admin')
  );
}

function pickUserRole(record: Record<string, unknown>): unknown {
  if (record.role != null) return record.role;
  if (record.user_role != null) return record.user_role;
  if (record.role_slug != null) return record.role_slug;
  if (record.roleSlug != null) return record.roleSlug;
  if (Array.isArray(record.roles) && record.roles[0] != null) return record.roles[0];
  return undefined;
}

/** Exact: staff/customer users created by Tenant Admin for this tenant. */
function isCreatedByTenantAdmin(
  user: Record<string, unknown>,
  tenantId: string,
): boolean {
  const userTenantId = pickString(user.tenant_id, user.tenantId, asRecord(user.tenant)?.id);
  if (userTenantId && userTenantId !== tenantId) return false;

  // Soft-deleted users are not counted.
  if (user.deleted_at || user.deletedAt) return false;

  // Workspace owner / platform roles are provisioned at tenant create — not Add user.
  if (isProvisionedOwnerRole(pickUserRole(user))) return false;

  // If API records the creator, exclude Super Admin–created accounts.
  if (pickString(user.created_by_super_admin_id, user.createdBySuperAdminId)) {
    return false;
  }

  return true;
}

function pickTotalPages(payload: unknown, pageSize: number, pageLength: number): number {
  const record = asRecord(payload);
  const meta =
    asRecord(record?.meta) ||
    asRecord(asRecord(record?.data)?.meta) ||
    null;

  const totalPages = coerceOptionalNumber(meta?.totalPages ?? meta?.total_pages);
  if (totalPages != null && totalPages >= 1) return totalPages;

  const total = pickMetaTotal(payload);
  if (total != null && total >= 0) return Math.max(1, Math.ceil(total / pageSize));

  // No meta — stop after a short page.
  return pageLength < pageSize ? 1 : Number.POSITIVE_INFINITY;
}

function coerceOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * Exact count of users created by Tenant Admin (paginated, no estimates).
 * Excludes TENANT_ADMIN owner, Super Admin, soft-deleted, and other-tenant rows.
 */
async function fetchCreatedUserCount(tenantId: string): Promise<number> {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  let count = 0;
  const seenIds = new Set<string>();

  while (page <= totalPages && page <= 50) {
    const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(USER_API.list, {
      headers: { 'X-Tenant-Id': tenantId },
      params: { page, limit: pageSize },
    });

    const list = unwrapList(res.data?.data ?? res.data)
      .map((item) => asRecord(item))
      .filter(Boolean) as Record<string, unknown>[];

    for (const user of list) {
      const id = pickString(user.id);
      if (id) {
        if (seenIds.has(id)) continue;
        seenIds.add(id);
      }
      if (isCreatedByTenantAdmin(user, tenantId)) count += 1;
    }

    totalPages = pickTotalPages(res.data ?? res, pageSize, list.length);
    if (list.length === 0) break;
    page += 1;
  }

  return count;
}

/**
 * Fill each tenant row with its own company name + exact created-user count.
 */
export async function enrichTenantListMetrics(tenants: Tenant[]): Promise<Tenant[]> {
  if (!tenants.length) return tenants;

  return Promise.all(
    tenants.map(async (tenant) => {
      let company_name = pickString(tenant.company_name);
      let company_code = pickString(tenant.company_code);
      // Always replace API totals — they include the provisioned TENANT_ADMIN.
      let total_users = 0;

      await Promise.all([
        resolveOwnCompany(tenant)
          .then((company) => {
            if (company.name) company_name = company.name;
            if (company.code) company_code = company.code;
          })
          .catch(() => undefined),
        fetchCreatedUserCount(tenant.id)
          .then((count) => {
            total_users = count;
          })
          .catch(() => {
            total_users = 0;
          }),
      ]);

      return {
        ...tenant,
        company_name: company_name || '',
        company_code: company_code || '',
        total_users,
      };
    }),
  );
}
