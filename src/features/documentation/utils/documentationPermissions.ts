import type { PermissionKey } from '@/types/auth.types';
import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';

export const DOCUMENTATION_READ_PERMISSION: PermissionKey = 'documentation.read';
export const DOCUMENTATION_MANAGE_PERMISSION: PermissionKey = 'documentation.manage';
export const DOCUMENTATION_EDI_READ_PERMISSION: PermissionKey = 'documentation.edi.read';
export const DOCUMENTATION_EDI_SUBMIT_PERMISSION: PermissionKey = 'documentation.edi.submit';
export const DOCUMENTATION_UPLOAD_PERMISSION: PermissionKey = 'documentation.upload';
export const DOCUMENTATION_MPCI_PERMISSION: PermissionKey = 'documentation.mpci';

export const DOCUMENTATION_READ_DENIED_MESSAGE =
  'Missing required permission: documentation.read. You can open Documentation menus, but list and report APIs need this key in your login token. Ask a Super Admin to run Sync permissions for your tenant (Super Admin → Tenants → Sync permissions), then sign out and sign back in.';

export const DOCUMENTATION_READ_TENANT_ADMIN_MESSAGE =
  'Missing required permission: documentation.read. Tenant Admin menu access (menu_documentation) does not automatically include API keys — a Super Admin must sync tenant permissions after the backend TENANT_ADMIN role seed includes documentation.read, then you must sign out and sign back in.';

export const DOCUMENTATION_MANAGE_DENIED_MESSAGE =
  'Missing required permission: documentation.manage. Read-only screens may work, but create/update APIs (BOE, bulk cost, templates, DO updates) need documentation.manage in your JWT. Sync permissions and re-login.';

export const DOCUMENTATION_EDI_READ_DENIED_MESSAGE =
  'Missing required permission: documentation.edi.read. Bayan/CCN/IAL/eQO EDI lists need this key — documentation.read alone is not enough. Ask a Super Admin to sync tenant permissions, then sign out and sign back in.';

export const DOCUMENTATION_EDI_READ_TENANT_ADMIN_MESSAGE =
  'Missing required permission: documentation.edi.read. Sync permissions must include documentation.edi.read (and documentation.edi.submit for Generate/Submit actions), then re-login.';

export const DOCUMENTATION_SERVER_ERROR_HINT =
  'This is a backend server error — your backend team should check API logs for the failing Documentation endpoint. After they fix it, refresh the page.';

export function formatDocumentationPermissionError(
  raw: string,
  opts?: { isTenantAdmin?: boolean },
): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  // Avoid appending the server-error hint twice (service layer may already have formatted).
  if (trimmed.includes('backend issue') || trimmed.includes(DOCUMENTATION_SERVER_ERROR_HINT.slice(0, 40))) {
    return trimmed;
  }

  if (/internal server error|status code 500|http 500/i.test(trimmed)) {
    return `Documentation API error (HTTP 500). ${DOCUMENTATION_SERVER_ERROR_HINT}`;
  }
  if (/documentation\.edi\.read/i.test(raw)) {
    return opts?.isTenantAdmin ? DOCUMENTATION_EDI_READ_TENANT_ADMIN_MESSAGE : DOCUMENTATION_EDI_READ_DENIED_MESSAGE;
  }
  if (/documentation\.read/i.test(raw) && !/documentation\.edi/i.test(raw)) {
    return opts?.isTenantAdmin ? DOCUMENTATION_READ_TENANT_ADMIN_MESSAGE : DOCUMENTATION_READ_DENIED_MESSAGE;
  }
  if (/documentation\.manage/i.test(raw)) {
    return opts?.isTenantAdmin
      ? `${DOCUMENTATION_MANAGE_DENIED_MESSAGE} (Tenant Admin: Super Admin must sync permissions first.)`
      : DOCUMENTATION_MANAGE_DENIED_MESSAGE;
  }
  if (/documentation\.(edi|upload|mpci)/i.test(raw)) {
    return `${raw} Ask a Super Admin to sync tenant permissions for Documentation EDI/upload/MPCI keys, then sign out and sign back in.`;
  }
  if (/missing required permission/i.test(raw) && /documentation/i.test(raw)) {
    return `${raw} If Documentation APIs were recently added, a Super Admin must sync permissions for your tenant and you must re-login.`;
  }
  return raw;
}

export function hasDocumentationEdiRead(opts: {
  permissions?: string[] | null;
}): boolean {
  const perms = opts.permissions ?? [];
  return perms.includes(DOCUMENTATION_EDI_READ_PERMISSION);
}

export function hasDocumentationRead(opts: {
  permissions?: string[] | null;
}): boolean {
  const perms = opts.permissions ?? [];
  return perms.includes(DOCUMENTATION_READ_PERMISSION);
}

export function hasDocumentationManage(opts: {
  permissions?: string[] | null;
  roleSlug?: string | null;
  role?: unknown;
}): boolean {
  const perms = opts.permissions ?? [];
  if (perms.includes(DOCUMENTATION_MANAGE_PERMISSION)) return true;
  const slug = opts.roleSlug || resolveAuthRoleSlug(opts.role);
  if (isTenantUserManagerRole(slug) && perms.length === 0) return false;
  return false;
}
