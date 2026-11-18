import type { AuthUser } from '@/types/auth.types';
import { parseOpsJobTypePermissions } from './resolveClientVisibleJobTypes';
import { isOpsUnrestrictedUser } from './isOpsUnrestrictedUser';

/** Classic + short codes for TRANSPORT_HANDOFF (jobs.transport.handoff). */
export const TRANSPORT_HANDOFF_PERMISSION_KEYS = [
  'jobs.transport.handoff',
  'transport.handoff',
] as const;

export function hasTransportHandoffPermission(
  permissions?: readonly string[] | null,
): boolean {
  if (!permissions?.length) return false;
  const want = new Set(
    TRANSPORT_HANDOFF_PERMISSION_KEYS.map((k) => k.toLowerCase()),
  );
  return permissions.some((raw) => {
    const key = String(raw ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '.');
    if (!key) return false;
    if (want.has(key)) return true;
    // Tolerate underscore classic form: jobs_transport_handoff
    const underscored = key.replace(/\./g, '_');
    return (
      underscored === 'jobs_transport_handoff' ||
      underscored === 'transport_handoff'
    );
  });
}

type HandoffActor = Pick<
  AuthUser,
  'role' | 'unrestrictedOps' | 'permissions' | 'visibleJobTypes' | 'writableJobTypes'
> | null | undefined;

/**
 * Transport-only handoff assignee queue (BE isTransportHandoffOnly):
 * - has jobs.transport.handoff
 * - not Tenant Admin / Branch Manager / unrestricted (sees-all)
 * - no operations_*.see|read|write job-type grants (those flood the list)
 *
 * List/counts = Job.ops_user_id = me only; detail = handoff_limited.
 */
export function isTransportHandoffOnly(user?: HandoffActor): boolean {
  if (!user) return false;
  if (isOpsUnrestrictedUser(user)) return false;

  const perms = user.permissions ?? [];
  if (!hasTransportHandoffPermission(perms)) return false;

  const { directTypes } = parseOpsJobTypePermissions(perms);
  if (directTypes.length > 0) return false;

  // /me visible∪writable tokens that look like ops job-type grants also disqualify.
  const tokens = [
    ...(Array.isArray(user.visibleJobTypes) ? user.visibleJobTypes : []),
    ...(Array.isArray(user.writableJobTypes) ? user.writableJobTypes : []),
  ];
  for (const raw of tokens) {
    const n = String(raw ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
    if (n.startsWith('operations_')) return false;
  }

  return true;
}
