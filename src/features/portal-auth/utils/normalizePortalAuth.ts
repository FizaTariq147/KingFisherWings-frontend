import {
  hasMustChangePasswordFlag,
  normalizeAuthLoginResponse,
  normalizeTokenPair,
  pickMustChangePassword,
  resolveAuthTenantBranding,
  unwrapEnvelope,
} from '@/features/auth/utils/normalizeAuthResponse';
import type { PortalPartySummary, PortalUser } from '../types/portalAuth.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function normalizeParty(raw: unknown): PortalPartySummary | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id);
  const name = pickString(record.name, record.display_name, record.displayName, record.code);
  if (!id && !name) return null;
  return {
    ...record,
    id: id || name,
    name: name || id,
    code: pickString(record.code) || undefined,
  };
}

function resolveMustChangePassword(
  ...sources: Array<Record<string, unknown> | null | undefined>
): boolean | undefined {
  for (const source of sources) {
    if (!source) continue;
    if (hasMustChangePasswordFlag(source)) {
      return pickMustChangePassword(source);
    }
  }
  return undefined;
}

/** Map login /me payloads into a stable portal user. */
export function normalizePortalUser(raw: unknown, _accessToken?: string | null): PortalUser {
  const envelope = unwrapEnvelope(raw);
  const source =
    asRecord(envelope.user) ||
    asRecord(envelope.portal_user) ||
    asRecord(envelope.profile) ||
    envelope;

  const party =
    normalizeParty(source.party) ||
    normalizeParty(envelope.party) ||
    normalizeParty(asRecord(source.customer));

  const first = pickString(source.first_name, source.firstName);
  const last = pickString(source.last_name, source.lastName);
  const fullName =
    pickString(source.full_name, source.fullName, source.name, source.display_name) ||
    [first, last].filter(Boolean).join(' ') ||
    pickString(source.email) ||
    'Portal user';

  const email = pickString(source.email);
  const id = pickString(source.id) || email || 'portal-user';

  const { tenantName, tenantId: resolvedTenantId, tenantSlug } = resolveAuthTenantBranding(
    source,
    envelope,
  );

  const mustChangePassword = resolveMustChangePassword(source, envelope, asRecord(raw));

  return {
    id,
    email,
    fullName,
    phone: pickString(source.phone, source.mobile) || undefined,
    status: pickString(source.status) || undefined,
    party,
    tenantSlug,
    tenantId: resolvedTenantId,
    tenantName,
    ...(mustChangePassword === undefined ? {} : { mustChangePassword }),
  };
}

export function normalizePortalLoginResponse(raw: unknown) {
  const normalized = normalizeAuthLoginResponse(raw, 'PORTAL_USER');
  if (!normalized) return null;

  const userFromPayload = normalizePortalUser(raw, normalized.accessToken);
  const fallbackName = normalized.user.name;
  const mustChangePassword =
    userFromPayload.mustChangePassword === true ||
    normalized.user.mustChangePassword === true;

  const user: PortalUser = {
    ...userFromPayload,
    id: userFromPayload.id || normalized.user.id,
    email: userFromPayload.email || normalized.user.email,
    fullName:
      userFromPayload.fullName !== 'Portal user'
        ? userFromPayload.fullName
        : fallbackName || userFromPayload.fullName,
    mustChangePassword,
  };

  return {
    user,
    accessToken: normalized.accessToken,
    refreshToken: normalized.refreshToken,
  };
}

export function normalizePortalTokenPair(raw: unknown) {
  return normalizeTokenPair(raw);
}

/** Merge /me into the session user without dropping a login-time must-change flag. */
export function mergePortalUserProfile(prior: PortalUser | null, next: PortalUser): PortalUser {
  const priorMustChange = Boolean(prior?.mustChangePassword);
  return {
    ...prior,
    ...next,
    mustChangePassword:
      next.mustChangePassword === undefined
        ? priorMustChange
        : Boolean(next.mustChangePassword),
  };
}
