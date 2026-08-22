import {
  resolveTenantIdFromUserLike,
  sessionIdFromAccessToken,
  tenantIdFromAccessToken,
} from '@/lib/tenantFromAuth';
import type {
  AuthLoginResult,
  AuthLoginUser,
  AuthTokenPair,
} from '../types/auth.api.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function looksLikeJwt(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 20) return false;
  const parts = value.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

const ACCESS_TOKEN_KEYS = [
  'accessToken',
  'access_token',
  'access',
  'token',
  'jwt',
  'idToken',
  'id_token',
] as const;

const REFRESH_TOKEN_KEYS = [
  'refreshToken',
  'refresh_token',
  'refresh',
] as const;

/** Walk common Nest envelopes: `{ data }`, `{ result }`, `{ payload }`, nested twice. */
export function unwrapEnvelope(raw: unknown): Record<string, unknown> {
  let current = asRecord(raw) ?? {};
  for (let depth = 0; depth < 4; depth += 1) {
    const nested =
      asRecord(current.data) ||
      asRecord(current.result) ||
      asRecord(current.payload) ||
      asRecord(current.session) ||
      asRecord(current.auth);
    if (!nested) break;
    // Prefer nested object when it carries tokens, user, or identity fields.
    const hasUsefulKeys =
      ACCESS_TOKEN_KEYS.some((k) => typeof nested[k] === 'string') ||
      REFRESH_TOKEN_KEYS.some((k) => typeof nested[k] === 'string') ||
      asRecord(nested.tokens) ||
      asRecord(nested.token) ||
      nested.user != null ||
      nested.tenant != null ||
      typeof nested.id === 'string' ||
      typeof nested.email === 'string' ||
      typeof nested.slug === 'string';
    if (!hasUsefulKeys) break;
    current = nested;
  }
  return current;
}

function pickTokenFromRecord(
  record: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = record[key];
    if (looksLikeJwt(value)) return value;
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function findJwtDeep(value: unknown, depth = 0): string {
  if (depth > 5) return '';
  if (looksLikeJwt(value)) return value;
  const record = asRecord(value);
  if (!record) return '';
  // Prefer known access keys before arbitrary JWT strings (refresh is also a JWT).
  const preferred = pickTokenFromRecord(record, ACCESS_TOKEN_KEYS);
  if (preferred) return preferred;
  for (const [key, child] of Object.entries(record)) {
    if ((REFRESH_TOKEN_KEYS as readonly string[]).includes(key)) continue;
    const found = findJwtDeep(child, depth + 1);
    if (found) return found;
  }
  return '';
}

function findRefreshJwtDeep(value: unknown, depth = 0): string {
  if (depth > 5) return '';
  const record = asRecord(value);
  if (!record) return '';
  const preferred = pickTokenFromRecord(record, REFRESH_TOKEN_KEYS);
  if (preferred) return preferred;
  for (const child of Object.values(record)) {
    const nested = asRecord(child);
    if (!nested) continue;
    const found = findRefreshJwtDeep(nested, depth + 1);
    if (found) return found;
  }
  return '';
}

/** Find access/refresh tokens across flat, nested `tokens`, and envelope shapes. */
export function pickAccessToken(record: Record<string, unknown>): string {
  const direct = pickTokenFromRecord(record, ACCESS_TOKEN_KEYS);
  if (direct) return direct;

  const tokens = asRecord(record.tokens) || asRecord(record.token);
  if (tokens) {
    const nested = pickTokenFromRecord(tokens, ACCESS_TOKEN_KEYS);
    if (nested) return nested;
    if (looksLikeJwt(tokens.access)) return tokens.access;
  }

  return findJwtDeep(record);
}

export function pickRefreshToken(record: Record<string, unknown>): string {
  const direct = pickTokenFromRecord(record, REFRESH_TOKEN_KEYS);
  if (direct) return direct;

  const tokens = asRecord(record.tokens) || asRecord(record.token);
  if (tokens) {
    const nested = pickTokenFromRecord(tokens, REFRESH_TOKEN_KEYS);
    if (nested) return nested;
    if (looksLikeJwt(tokens.refresh)) return tokens.refresh;
  }

  return findRefreshJwtDeep(record);
}

function pickRoleSlug(role: unknown): string {
  if (typeof role === 'string' && role) return role;
  const record = asRecord(role);
  if (!record) return '';
  if (typeof record.slug === 'string' && record.slug) return record.slug;
  if (typeof record.name === 'string' && record.name) return record.name;
  return '';
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export interface AuthTenantBranding {
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
}

/** Title-case tenant slug when API omits a display name (portal + vendor chrome). */
export function formatTenantSlugLabel(slug?: string): string | undefined {
  if (!slug) return undefined;
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/** Resolve tenant branding from login /me payloads (nested tenant + organization). */
export function resolveAuthTenantBranding(
  source: Record<string, unknown>,
  envelope?: Record<string, unknown>,
): AuthTenantBranding {
  const tenant = asRecord(source.tenant) || asRecord(envelope?.tenant);
  const organization =
    asRecord(source.organization) ||
    asRecord(envelope?.organization) ||
    asRecord(tenant?.organization);

  const tenantSlug =
    pickString(source.tenant_slug, source.tenantSlug, tenant?.slug, envelope?.tenant_slug) ||
    undefined;

  const tenantName =
    pickString(
      tenant?.display_name,
      tenant?.displayName,
      tenant?.name,
      tenant?.company_name,
      tenant?.companyName,
      organization?.name,
      organization?.display_name,
      organization?.displayName,
      source.tenant_name,
      source.tenantName,
      envelope?.tenant_name,
    ) || formatTenantSlugLabel(tenantSlug);

  const tenantId =
    pickString(source.tenant_id, source.tenantId, tenant?.id, envelope?.tenant_id) || undefined;

  return { tenantId, tenantSlug, tenantName };
}

function pickUserSource(record: Record<string, unknown>): Record<string, unknown> {
  return (
    asRecord(record.user) ||
    asRecord(record.tenant) ||
    asRecord(record.admin) ||
    asRecord(record.profile) ||
    record
  );
}

export function normalizeLoginUser(
  raw: unknown,
  fallbackRole = '',
  accessToken?: string | null,
): AuthLoginUser {
  const record = asRecord(raw) ?? {};
  const email = pickString(record.email);
  const first = pickString(record.first_name, record.firstName);
  const last = pickString(record.last_name, record.lastName);
  const name =
    pickString(record.name, record.display_name, record.displayName) ||
    [first, last].filter(Boolean).join(' ') ||
    pickString(record.slug) ||
    email ||
    'User';

  const role = pickRoleSlug(record.role) || fallbackRole;
  const id = pickString(record.id) || email || pickString(record.slug) || 'user';

  const tenantId =
    resolveTenantIdFromUserLike({ ...record, role: record.role ?? role }) ||
    tenantIdFromAccessToken(accessToken) ||
    (fallbackRole.toUpperCase().includes('TENANT') && /^[0-9a-f-]{36}$/i.test(id)
      ? id
      : '') ||
    undefined;

  return {
    id,
    name,
    email,
    role,
    tenantId: tenantId || undefined,
    companyId: pickString(record.companyId, record.company_id) || undefined,
    mustChangePassword: pickMustChangePassword(record),
  };
}

export function hasMustChangePasswordFlag(record: Record<string, unknown>): boolean {
  return (
    'must_change_password' in record ||
    'mustChangePassword' in record ||
    'require_password_change' in record ||
    'requirePasswordChange' in record ||
    'password_change_required' in record ||
    'passwordChangeRequired' in record
  )
}

export function pickMustChangePassword(record: Record<string, unknown>): boolean {
  const value =
    record.must_change_password ??
    record.mustChangePassword ??
    record.require_password_change ??
    record.requirePasswordChange ??
    record.password_change_required ??
    record.passwordChangeRequired;
  return value === true || value === 'true' || value === 1;
}

/** Summarize response keys for debugging incomplete login payloads. */
export function summarizeAuthPayloadKeys(raw: unknown): string {
  if (raw === null) return 'null';
  if (raw === undefined) return 'undefined';
  if (typeof raw === 'string') return `string(len=${raw.length})`;
  if (Array.isArray(raw)) return `array(len=${raw.length})`;
  const record = asRecord(raw);
  if (!record) return typeof raw;
  const top = Object.keys(record).slice(0, 12).join(', ') || '(empty object)';
  const nested = asRecord(record.data) || asRecord(record.result);
  if (!nested) return top;
  return `${top} → data:[${Object.keys(nested).slice(0, 12).join(', ')}]`;
}

function pickSessionId(
  record: Record<string, unknown>,
  accessToken?: string | null,
): string {
  const direct = pickString(
    record.session_id,
    record.sessionId,
    record.sid,
    asRecord(record.session)?.id,
    asRecord(record.session)?.session_id,
  );
  if (direct) return direct;
  return sessionIdFromAccessToken(accessToken) || '';
}

/** Normalize login / refresh responses into a stable token + user shape. */
export function normalizeAuthLoginResponse(
  raw: unknown,
  fallbackRole = '',
): AuthLoginResult | null {
  const record = unwrapEnvelope(raw);
  const accessToken = pickAccessToken(record) || pickAccessToken(asRecord(raw) ?? {});
  if (!accessToken) return null;

  const refreshToken =
    pickRefreshToken(record) || pickRefreshToken(asRecord(raw) ?? {});
  const userSource = pickUserSource(record);
  const user = normalizeLoginUser(userSource, fallbackRole, accessToken);
  // Flag may sit on the envelope root or on the nested user.
  const mustChangePassword =
    user.mustChangePassword || pickMustChangePassword(record);
  const sessionId = pickSessionId(record, accessToken) || pickSessionId(asRecord(raw) ?? {}, accessToken);

  return {
    accessToken,
    refreshToken,
    sessionId: sessionId || undefined,
    user: { ...user, mustChangePassword },
  };
}

export function normalizeTokenPair(raw: unknown): AuthTokenPair | null {
  const record = unwrapEnvelope(raw);
  const accessToken = pickAccessToken(record) || pickAccessToken(asRecord(raw) ?? {});
  if (!accessToken) return null;
  const sessionId = pickSessionId(record, accessToken) || pickSessionId(asRecord(raw) ?? {}, accessToken);
  return {
    accessToken,
    refreshToken: pickRefreshToken(record) || pickRefreshToken(asRecord(raw) ?? {}),
    sessionId: sessionId || undefined,
  };
}
