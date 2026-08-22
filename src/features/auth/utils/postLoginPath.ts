import {
  getErpHomePath,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions'

/** Post-login destination for ERP sessions. */
export function erpPostAuthPath(user?: {
  role?: string | null
  mustChangePassword?: boolean
} | null): string {
  if (user?.mustChangePassword) return '/change-password'
  const roleSlug = resolveAuthRoleSlug(user?.role)
  return getErpHomePath(roleSlug)
}
