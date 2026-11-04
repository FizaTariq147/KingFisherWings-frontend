import type { AuthUser } from '@/types/auth.types';
import {
  isOpsUnrestrictedRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';

/**
 * True when job lists / detail / dashboard must not apply ops matrix scope.
 * Matches BE: tenant admin + branch manager + unrestricted_ops claim.
 */
export function isOpsUnrestrictedUser(
  user?: Pick<AuthUser, 'role' | 'unrestrictedOps'> | null,
): boolean {
  if (!user) return false;
  if (user.unrestrictedOps) return true;
  return isOpsUnrestrictedRole(resolveAuthRoleSlug(user.role));
}
