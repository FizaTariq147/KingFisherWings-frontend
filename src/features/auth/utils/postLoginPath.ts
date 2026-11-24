import {
  getErpHomePath,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions'
import {
  hasMustChangePasswordCleared,
  shouldSkipMustChangePasswordRedirect,
} from '@/features/auth/utils/mustChangePasswordGate'

/** Post-login destination for ERP sessions. */
export function erpPostAuthPath(user?: {
  id?: string | null
  tenantId?: string | null
  role?: string | null
  mustChangePassword?: boolean
} | null): string {
  if (shouldSkipMustChangePasswordRedirect()) {
    return getErpHomePath(resolveAuthRoleSlug(user?.role))
  }
  const cleared = hasMustChangePasswordCleared(user?.id, user?.tenantId)
  if (user?.mustChangePassword && !cleared) return '/change-password'
  const roleSlug = resolveAuthRoleSlug(user?.role)
  return getErpHomePath(roleSlug)
}
