import {
  getErpHomePath,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions'
import { hasMustChangePasswordCleared } from '@/features/auth/utils/mustChangePasswordGate'

/** Post-login destination for ERP sessions. */
export function erpPostAuthPath(user?: {
  id?: string | null
  tenantId?: string | null
  role?: string | null
  mustChangePassword?: boolean
} | null): string {
  const cleared = hasMustChangePasswordCleared(user?.id, user?.tenantId)
  if (user?.mustChangePassword && !cleared) return '/change-password'
  const roleSlug = resolveAuthRoleSlug(user?.role)
  return getErpHomePath(roleSlug)
}
