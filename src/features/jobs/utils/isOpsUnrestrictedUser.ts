import type { AuthUser } from '@/types/auth.types';
import {
  isOpsUnrestrictedRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';

const ADMIN_WRITE_PERMS = ['admin_users.write', 'admin_roles.write'] as const;

/**
 * True when job list / detail / job_count must not be cut by job-type grants.
 * Matches BE: TENANT_ADMIN, BRANCH_MANAGER, SUPER_ADMIN, unrestricted_ops,
 * or token with admin_users.write / admin_roles.write.
 */
export function isOpsUnrestrictedUser(
  user?: Pick<AuthUser, 'role' | 'unrestrictedOps' | 'permissions'> | null,
): boolean {
  if (!user) return false;
  if (user.unrestrictedOps) return true;
  if (isOpsUnrestrictedRole(resolveAuthRoleSlug(user.role))) return true;
  const perms = user.permissions ?? [];
  return ADMIN_WRITE_PERMS.some((key) => perms.includes(key));
}
