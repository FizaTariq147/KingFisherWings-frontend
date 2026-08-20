import {
  getErpHomePath,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions'

/** Post-login / post-2FA destination for ERP sessions. */
export function erpPostAuthPath(user?: {
  role?: string | null
  mustChangePassword?: boolean
  twoFactorEnabled?: boolean
} | null): string {
  if (user?.mustChangePassword) return '/change-password'
  const roleSlug = resolveAuthRoleSlug(user?.role)
  if (isTenantUserManagerRole(roleSlug) && !user?.twoFactorEnabled) {
    return '/settings/two-factor'
  }
  return getErpHomePath(roleSlug)
}
