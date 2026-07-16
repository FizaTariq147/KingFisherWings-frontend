import { isUuid } from '@/lib/isUuid';

/** Decode a JWT payload without verifying signature (client-side convenience only). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payloadPart] = token.split('.');
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const json = atob(padded);
    const payload = JSON.parse(json);
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Session id from JWT claims used by POST /auth/sessions/{sessionId}/revoke. */
export function sessionIdFromAccessToken(token?: string | null): string {
  if (!token) return '';
  const payload = decodeJwtPayload(token);
  if (!payload) return '';

  // Prefer explicit session claims. Avoid treating random `jti` as session id unless it looks like a UUID.
  for (const key of ['session_id', 'sessionId', 'sid'] as const) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  const nested = payload.session;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const record = nested as Record<string, unknown>;
    for (const key of ['id', 'session_id', 'sessionId'] as const) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  const jti = payload.jti;
  if (typeof jti === 'string' && isUuid(jti)) return jti.trim();

  return '';
}

/** Unix ms when the access token expires (`exp` claim). Null if missing/invalid. */
export function accessTokenExpiresAtMs(token?: string | null): number | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp === 'number' && Number.isFinite(exp)) return exp * 1000;
  if (typeof exp === 'string' && exp.trim()) {
    const n = Number(exp);
    if (Number.isFinite(n)) return n * 1000;
  }
  return null;
}

/** Workspace slug from JWT (tenant-login / staff tokens). */
export function tenantSlugFromAccessToken(token?: string | null): string {
  if (!token) return '';
  const payload = decodeJwtPayload(token);
  if (!payload) return '';
  for (const key of ['tenant_slug', 'slug', 'tenantSlug'] as const) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().toLowerCase();
    }
  }
  const nested = payload.tenant;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const record = nested as Record<string, unknown>;
    for (const key of ['slug', 'tenant_slug'] as const) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim().toLowerCase();
      }
    }
  }
  return '';
}

function pickUuid(value: unknown): string | undefined {
  if (typeof value === 'string' && isUuid(value)) return value;
  return undefined;
}

function pickUuidFromObject(value: unknown, keys: string[]): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const found = pickUuid(record[key]);
    if (found) return found;
  }
  return undefined;
}

function pickTenantCandidate(value: unknown): string | undefined {
  return pickUuid(value) || pickUuidFromObject(value, ['id', 'tenantId', 'tenant_id']);
}

function isTenantOwnerPrincipal(payload: Record<string, unknown>): boolean {
  const markers = [
    payload.type,
    payload.principal,
    payload.principal_type,
    payload.principalType,
    payload.subject_type,
    payload.subjectType,
    payload.role,
    typeof payload.role === 'object' && payload.role
      ? (payload.role as { slug?: string; name?: string }).slug ||
        (payload.role as { name?: string }).name
      : undefined,
  ]
    .filter((v) => typeof v === 'string')
    .map((v) => String(v).toLowerCase().replace(/-/g, '_'));

  return markers.some(
    (m) =>
      m === 'tenant' ||
      m === 'tenant_owner' ||
      m === 'tenant_admin' ||
      m === 'tenantadmin' ||
      m.includes('tenant_admin'),
  );
}

/** Resolve tenant UUID from JWT claims (camelCase, snake_case, or tenant-owner `sub`). */
export function tenantIdFromAccessToken(token: string | null | undefined): string {
  if (!token) return '';
  const payload = decodeJwtPayload(token);
  if (!payload) return '';

  const fromClaims =
    pickTenantCandidate(payload.tenantId) ||
    pickTenantCandidate(payload.tenant_id) ||
    pickTenantCandidate(payload.tid) ||
    pickTenantCandidate(payload.tenant) ||
    pickUuidFromObject(payload.user, ['tenantId', 'tenant_id']) ||
    '';

  if (fromClaims) return fromClaims;

  const sub = pickUuid(payload.sub);
  if (!sub) return '';

  // Tenant Admin login (`POST /auth/tenant-login`): principal is the tenant; `sub` is the tenant id.
  if (isTenantOwnerPrincipal(payload)) return sub;

  // Heuristic: tenant-login tokens often include slug but no separate tenant_id claim.
  if (
    (typeof payload.tenant_slug === 'string' ||
      typeof payload.slug === 'string' ||
      typeof payload.tenantSlug === 'string') &&
    sub
  ) {
    return sub;
  }

  // Role claim alone (string or nested) — common for tenant-owner JWTs.
  const roleSlug =
    typeof payload.role === 'string'
      ? payload.role
      : typeof payload.role === 'object' && payload.role
        ? String(
            (payload.role as { slug?: string; name?: string }).slug ||
              (payload.role as { name?: string }).name ||
              '',
          )
        : '';
  if (/tenant_admin|tenant_owner|^tenant$/i.test(roleSlug.replace(/-/g, '_'))) {
    return sub;
  }

  return '';
}

/** Normalize /auth/me (or login) payloads that may use snake_case or nested tenant. */
export function resolveTenantIdFromUserLike(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const record = raw as Record<string, unknown>;

  const fromClaims =
    pickTenantCandidate(record.tenantId) ||
    pickTenantCandidate(record.tenant_id) ||
    pickTenantCandidate(record.tenant) ||
    pickUuidFromObject(record.user, ['tenantId', 'tenant_id']) ||
    '';

  if (fromClaims) return fromClaims;

  // Tenant-owner principal: the record `id` is the tenant id.
  if (isTenantOwnerPrincipal(record)) {
    return pickUuid(record.id) || '';
  }

  // /auth/me for tenant-login often returns the tenant entity (slug + no email user fields).
  if (
    pickUuid(record.id) &&
    (typeof record.slug === 'string' || typeof record.tenant_slug === 'string') &&
    !record.email &&
    !record.first_name &&
    !record.firstName
  ) {
    return pickUuid(record.id) || '';
  }

  return '';
}

/**
 * Resolve tenant UUID from auth store user + access token.
 * Used by services that cannot read AuthContext.
 */
export function resolveSessionTenantIdFromAuth(input: {
  accessToken?: string | null;
  user?: { id?: string; role?: string; tenantId?: string } | null;
}): string {
  const fromToken = tenantIdFromAccessToken(input.accessToken);
  if (fromToken) return fromToken;

  const fromUser = input.user?.tenantId;
  if (typeof fromUser === 'string' && isUuid(fromUser)) return fromUser;

  const role = String(input.user?.role ?? '')
    .toLowerCase()
    .replace(/-/g, '_');
  const isTenantAdminRole =
    role.includes('tenant_admin') || role === 'tenant' || role.includes('tenant_owner');

  const userId = input.user?.id;
  if (typeof userId === 'string' && isUuid(userId) && isTenantAdminRole) {
    return userId;
  }

  // Tenant Admin (`tenant-login`): JWT `sub` is typically the tenant principal id.
  if (isTenantAdminRole && input.accessToken) {
    const payload = decodeJwtPayload(input.accessToken);
    const sub = pickUuid(payload?.sub);
    if (sub) return sub;
  }

  return '';
}

/** Resolve company UUID from JWT claims. */
export function companyIdFromAccessToken(token: string | null | undefined): string {
  if (!token) return '';
  const payload = decodeJwtPayload(token);
  if (!payload) return '';

  return (
    pickTenantCandidate(payload.companyId) ||
    pickTenantCandidate(payload.company_id) ||
    pickTenantCandidate(payload.company) ||
    ''
  );
}

/** Normalize permission keys from JWT /auth/me payloads (string or { key } objects). */
export function normalizePermissionKeys(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      out.push(item.trim());
      continue;
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const rec = item as Record<string, unknown>;
      for (const key of ['key', 'permission', 'code', 'name'] as const) {
        const value = rec[key];
        if (typeof value === 'string' && value.trim()) {
          out.push(value.trim());
          break;
        }
      }
    }
  }
  return [...new Set(out)];
}

/** Permission keys embedded in the access token. */
export function permissionsFromAccessToken(token?: string | null): string[] {
  if (!token) return [];
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  return normalizePermissionKeys(payload.permissions);
}

/** Normalize company id from /auth/me-like payloads. */
export function resolveCompanyIdFromUserLike(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const record = raw as Record<string, unknown>;

  return (
    pickTenantCandidate(record.companyId) ||
    pickTenantCandidate(record.company_id) ||
    pickTenantCandidate(record.company) ||
    ''
  );
}
