import { useAuthStore } from '@/store/authStore';
import {
  isOpsUnrestrictedRole,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '../constants/userPermissions';

const ADMIN_WRITE_PERMS = ['admin_users.write', 'admin_roles.write'] as const;

/**
 * True when the session may call GET /users (tenant user directory).
 * OPERATIONS_MANAGER and most ops staff get 403 — do not call the API at all
 * (catching still spams the browser console and previously emptied job lists).
 */
export function canListTenantUsers(): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  if (user.unrestrictedOps) return true;

  const roleSlug = resolveAuthRoleSlug(user.role);
  if (isOpsUnrestrictedRole(roleSlug)) return true;
  if (isTenantUserManagerRole(roleSlug)) return true;
  if (
    TENANT_USER_MANAGER_ROLE_SLUGS.some(
      (s) => s.toLowerCase() === String(roleSlug ?? '').toLowerCase(),
    )
  ) {
    return true;
  }

  const perms = (user.permissions ?? []).map((p) =>
    String(p)
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_'),
  );

  if (ADMIN_WRITE_PERMS.some((key) => perms.includes(key))) return true;

  return perms.some(
    (p) =>
      p === 'users.see' ||
      p === 'users.read' ||
      p === 'users.view' ||
      p === 'users.list' ||
      p === 'users.manage' ||
      (p.startsWith('users.') &&
        (p.endsWith('.see') || p.endsWith('.read') || p.endsWith('.write'))),
  );
}
