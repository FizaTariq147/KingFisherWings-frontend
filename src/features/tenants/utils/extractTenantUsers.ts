import { isUuid } from '@/lib/isUuid';

export interface TenantCreatedUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  status?: string;
  phone?: string;
  last_login_at?: string | null;
  created_at?: string;
  must_change_password?: boolean;
}

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

function looksLikeUserRow(value: unknown): boolean {
  const row = asRecord(value);
  if (!row) return false;
  return Boolean(
    pickString(row.email) ||
      pickString(row.first_name, row.firstName) ||
      pickString(row.role, row.role_slug, row.roleSlug) ||
      (pickString(row.id) &&
        (row.tenant_id != null ||
          row.tenantId != null ||
          pickString(row.full_name, row.fullName))),
  );
}

export function normalizeTenantCreatedUser(raw: unknown): TenantCreatedUser | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id || !isUuid(id)) return null;
  if (r.deleted_at || r.deletedAt) return null;

  const first = pickString(r.first_name, r.firstName);
  const last = pickString(r.last_name, r.lastName);
  const full =
    pickString(r.full_name, r.fullName, r.name) ||
    [first, last].filter(Boolean).join(' ').trim();

  return {
    id,
    email: pickString(r.email) || undefined,
    first_name: first || undefined,
    last_name: last || undefined,
    full_name: full || undefined,
    role: pickString(r.role, r.role_slug, r.roleSlug) || undefined,
    status: pickString(r.status) || undefined,
    phone: pickString(r.phone) || undefined,
    last_login_at:
      pickString(r.last_login_at, r.lastLoginAt) ||
      (r.last_login_at === null || r.lastLoginAt === null ? null : undefined),
    created_at: pickString(r.created_at, r.createdAt) || undefined,
    must_change_password:
      r.must_change_password === true || r.mustChangePassword === true || undefined,
  };
}

/**
 * Pull a users[] relation (or similar) out of a GET /tenants/{id} (or list) payload.
 * Platform Super Admin must not call tenant ERP /users.
 */
export function extractUsersFromTenantPayload(raw: unknown): TenantCreatedUser[] {
  const root = asRecord(raw) ?? {};
  const nested =
    asRecord(root.data) ||
    asRecord(root.tenant) ||
    asRecord(root.result) ||
    root;

  const candidates: unknown[] = [
    nested.users,
    nested.Users,
    nested.tenant_users,
    nested.tenantUsers,
    nested.created_users,
    nested.createdUsers,
    nested.staff_users,
    nested.staffUsers,
    nested.owner,
    nested.admin_user,
    nested.adminUser,
    nested.tenant_admin,
    nested.tenantAdmin,
  ];

  const out: TenantCreatedUser[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const rows = Array.isArray(candidate)
      ? candidate
      : looksLikeUserRow(candidate)
        ? [candidate]
        : [];
    for (const row of rows) {
      if (!looksLikeUserRow(row)) continue;
      const user = normalizeTenantCreatedUser(row);
      if (!user || seen.has(user.id)) continue;
      seen.add(user.id);
      out.push(user);
    }
  }

  return out;
}
