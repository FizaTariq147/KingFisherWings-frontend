import type { PermissionKey } from '@/types/auth.types';
import { isTenantUserManagerRole, resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';

/** Backend Guard key for create/update/delete/seed Chart of Accounts. */
export const GL_MANAGE_COA_PERMISSION: PermissionKey = 'gl.manage_coa';

export const GL_MANAGE_COA_DENIED_MESSAGE =
  'Missing required permission: gl.manage_coa. Your login role cannot create or change Chart of Accounts. A Super Admin must sync tenant permissions after the API grants gl.manage_coa to your role; then sign out and sign back in.';

export const GL_MANAGE_COA_BACKEND_TENANT_ADMIN_MESSAGE =
  'Backend denied Chart of Accounts access (gl.manage_coa) even though you are signed in as Tenant Admin. Tenant Admin cannot grant or sync this permission — only Super Admin can run Sync permissions (POST /tenants/{id}/sync-permissions), and only after the API TENANT_ADMIN role seed includes gl.manage_coa. Then sign out and sign back in so the JWT picks it up.';

export function formatPermissionError(raw: string, opts?: { isTenantAdmin?: boolean }): string {
  if (/gl\.manage_coa/i.test(raw)) {
    return opts?.isTenantAdmin
      ? GL_MANAGE_COA_BACKEND_TENANT_ADMIN_MESSAGE
      : GL_MANAGE_COA_DENIED_MESSAGE;
  }
  if (/missing required permission/i.test(raw)) {
    return `${raw} Ask a Tenant Admin to update your role permissions, then sign out and sign back in.`;
  }
  return raw;
}

/** True when the session can attempt COA write APIs (UX gate; backend still enforces). */
export function canManageChartOfAccounts(opts: {
  permissions?: string[] | null;
  roleSlug?: string | null;
  role?: unknown;
}): boolean {
  const slug = opts.roleSlug || resolveAuthRoleSlug(opts.role);
  // Tenant Admin is workspace owner — allow COA write UI; backend remains source of truth.
  if (isTenantUserManagerRole(slug)) return true;
  const perms = opts.permissions ?? [];
  if (perms.length === 0) return true; // unknown permission set — allow UI; API enforces
  return perms.includes(GL_MANAGE_COA_PERMISSION);
}
