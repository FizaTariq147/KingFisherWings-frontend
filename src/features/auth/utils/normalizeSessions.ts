import type { ActiveSession } from '@/types/session.types';

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

function pickBool(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === 1 || value === '1') return true;
    if (value === 'false' || value === 0 || value === '0') return false;
  }
  return false;
}

function normalizeDeviceType(value: unknown): ActiveSession['deviceType'] {
  const raw = pickString(value).toLowerCase();
  if (raw === 'desktop' || raw === 'mobile' || raw === 'tablet') return raw;
  return 'unknown';
}

/** Normalize one session row from GET /auth/sessions (camelCase or snake_case). */
export function normalizeActiveSession(raw: unknown): ActiveSession | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = pickString(
    record.id,
    record.session_id,
    record.sessionId,
    record.sid,
    asRecord(record.session)?.id,
  );
  if (!id) return null;

  return {
    id,
    deviceType: normalizeDeviceType(record.deviceType ?? record.device_type ?? record.device),
    browser: pickString(record.browser, record.browser_name, record.user_agent, record.userAgent) || 'Unknown browser',
    os: pickString(record.os, record.operating_system, record.platform) || 'Unknown OS',
    ipAddress: pickString(record.ipAddress, record.ip_address, record.ip) || '—',
    location: pickString(record.location, record.geo_location, record.geoLocation) || null,
    lastActiveAt:
      pickString(record.lastActiveAt, record.last_active_at, record.last_seen_at, record.updated_at) ||
      new Date().toISOString(),
    createdAt:
      pickString(record.createdAt, record.created_at, record.started_at) || new Date().toISOString(),
    isCurrent: pickBool(
      record.isCurrent,
      record.is_current,
      record.current,
      record.is_this_device,
      record.isThisDevice,
    ),
  };
}

/** Unwrap GET /auth/sessions envelopes into ActiveSession[]. */
export function normalizeActiveSessions(raw: unknown): ActiveSession[] {
  if (!raw) return [];

  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else {
    const record = asRecord(raw);
    if (!record) return [];
    if (Array.isArray(record.sessions)) list = record.sessions;
    else if (Array.isArray(record.data)) list = record.data;
    else {
      const nested = asRecord(record.data);
      if (nested && Array.isArray(nested.sessions)) list = nested.sessions;
      else if (nested && Array.isArray(nested.items)) list = nested.items;
    }
  }

  return list
    .map(normalizeActiveSession)
    .filter((session): session is ActiveSession => Boolean(session));
}

/** Prefer the API-marked current session id for revoke. */
export function pickCurrentSessionId(sessions: ActiveSession[]): string {
  const current = sessions.find((session) => session.isCurrent);
  if (current?.id) return current.id;
  if (sessions.length === 1 && sessions[0]?.id) return sessions[0].id;
  return '';
}
