import type { PermissionKey } from '@/types/auth.types';
import { isTenantUserManagerRole, resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';

/** Backend Guard key for create/update/post/cancel GL payments. */
export const GL_MANAGE_PAYMENTS_PERMISSION: PermissionKey = 'gl.manage_payments';

export const GL_MANAGE_PAYMENTS_DENIED_MESSAGE =
  'Missing required permission: gl.manage_payments. Your login role cannot create or change GL payments. A Super Admin must sync tenant permissions after the API grants gl.manage_payments to your role; then sign out and sign back in.';

export const GL_MANAGE_PAYMENTS_BACKEND_TENANT_ADMIN_MESSAGE =
  'Backend denied GL payments access (gl.manage_payments) even though you are signed in as Tenant Admin. Tenant Admin cannot grant or sync this permission — only Super Admin can run Sync permissions, and only after the API TENANT_ADMIN role seed includes gl.manage_payments. Then sign out and sign back in so the JWT picks it up.';

export function formatGlPaymentPermissionError(
  raw: string,
  opts?: { isTenantAdmin?: boolean },
): string {
  if (/gl\.manage_payments/i.test(raw)) {
    return opts?.isTenantAdmin
      ? GL_MANAGE_PAYMENTS_BACKEND_TENANT_ADMIN_MESSAGE
      : GL_MANAGE_PAYMENTS_DENIED_MESSAGE;
  }
  if (/missing required permission/i.test(raw)) {
    return `${raw} Ask a Tenant Admin to update your role permissions, then sign out and sign back in.`;
  }
  return raw;
}

export function canManageGlPayments(opts: {
  permissions?: string[] | null;
  role?: unknown;
  roleSlug?: string | null;
}): boolean {
  const slug = opts.roleSlug || resolveAuthRoleSlug(opts.role);
  if (isTenantUserManagerRole(slug)) return true;
  const perms = opts.permissions ?? [];
  if (perms.length === 0) return true;
  return perms.includes(GL_MANAGE_PAYMENTS_PERMISSION);
}
