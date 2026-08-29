import type { PermissionKey } from '@/types/auth.types';
import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';

/** Backend Guard key for NVOCC create/update/delete (tariffs, voyages, enquiries, bookings). */
export const NVOCC_MANAGE_PERMISSION: PermissionKey = 'nvocc.manage';

/** Backend Guard key for NVOCC read-only list/detail APIs (when enforced separately). */
export const NVOCC_READ_PERMISSION: PermissionKey = 'nvocc.read';

export const NVOCC_MANAGE_DENIED_MESSAGE =
  'Missing required permission: nvocc.manage. You can open NVOCC menus, but create/update/delete APIs need this key in your login token. Ask a Super Admin to run Sync permissions for your tenant (Super Admin → Tenants → Sync permissions), then sign out and sign back in.';

export const NVOCC_MANAGE_TENANT_ADMIN_MESSAGE =
  'Missing required permission: nvocc.manage. Tenant Admin menu access does not automatically include this API key — a Super Admin must sync tenant permissions after the backend role seed includes nvocc.manage, then you must sign out and sign back in so your JWT is refreshed.';

export function formatNvoccPermissionError(
  raw: string,
  opts?: { isTenantAdmin?: boolean },
): string {
  if (/nvocc\.manage/i.test(raw)) {
    return opts?.isTenantAdmin ? NVOCC_MANAGE_TENANT_ADMIN_MESSAGE : NVOCC_MANAGE_DENIED_MESSAGE;
  }
  if (/nvocc\.read/i.test(raw)) {
    return `${raw} Ask a Super Admin to sync tenant permissions, then sign out and sign back in.`;
  }
  if (/missing required permission/i.test(raw)) {
    return `${raw} If you recently added NVOCC APIs, a Super Admin must sync permissions for your tenant and you must re-login.`;
  }
  return raw;
}

/** True when JWT/session includes nvocc.manage (UX hint only — backend still enforces). */
export function canManageNvocc(opts: {
  permissions?: string[] | null;
  roleSlug?: string | null;
  role?: unknown;
}): boolean {
  const slug = opts.roleSlug || resolveAuthRoleSlug(opts.role);
  if (isTenantUserManagerRole(slug)) {
    // Tenant Admin often lacks API keys until Super Admin sync — do not assume manage.
    const perms = opts.permissions ?? [];
    if (perms.includes(NVOCC_MANAGE_PERMISSION)) return true;
    return false;
  }
  const perms = opts.permissions ?? [];
  if (perms.length === 0) return false;
  return perms.includes(NVOCC_MANAGE_PERMISSION);
}
