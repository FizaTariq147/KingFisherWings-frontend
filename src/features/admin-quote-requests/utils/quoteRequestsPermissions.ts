import type { PermissionKey } from '@/types/auth.types';
import {
  isTenantUserManagerRole,
  TENANT_USER_MANAGER_ROLE_SLUGS,
} from '@/features/users/constants/userPermissions';

export const QUOTE_REQUESTS_VIEW_PERMISSION: PermissionKey =
  'integrations.quote_requests.view';
export const QUOTE_REQUESTS_MANAGE_CONNECTION_PERMISSION: PermissionKey =
  'integrations.quote_requests.manage_connection';
export const QUOTE_REQUESTS_SYNC_PERMISSION: PermissionKey =
  'integrations.quote_requests.sync';
export const QUOTE_REQUESTS_UPDATE_STATUS_PERMISSION: PermissionKey =
  'integrations.quote_requests.update_status';

export const QUOTE_REQUESTS_PERMISSIONS = [
  QUOTE_REQUESTS_VIEW_PERMISSION,
  QUOTE_REQUESTS_MANAGE_CONNECTION_PERMISSION,
  QUOTE_REQUESTS_SYNC_PERMISSION,
  QUOTE_REQUESTS_UPDATE_STATUS_PERMISSION,
] as const;

type AuthLike = {
  hasPermission: (...keys: PermissionKey[]) => boolean;
  hasAnyPermission: (...keys: PermissionKey[]) => boolean;
  hasRole: (...roles: string[]) => boolean;
};

function isTenantAdmin(auth: AuthLike, roleSlug?: string | null): boolean {
  if (isTenantUserManagerRole(roleSlug)) return true;
  return TENANT_USER_MANAGER_ROLE_SLUGS.some((slug) => auth.hasRole(slug));
}

/** List/detail/sync-history — Tenant Admin or view permission. */
export function canViewQuoteRequests(auth: AuthLike, roleSlug?: string | null): boolean {
  if (isTenantAdmin(auth, roleSlug)) return true;
  return auth.hasPermission(QUOTE_REQUESTS_VIEW_PERMISSION);
}

export function canManageQuoteRequestConnection(
  auth: AuthLike,
  roleSlug?: string | null,
): boolean {
  if (isTenantAdmin(auth, roleSlug)) return true;
  return auth.hasPermission(QUOTE_REQUESTS_MANAGE_CONNECTION_PERMISSION);
}

export function canSyncQuoteRequests(auth: AuthLike, roleSlug?: string | null): boolean {
  if (isTenantAdmin(auth, roleSlug)) return true;
  return auth.hasPermission(QUOTE_REQUESTS_SYNC_PERMISSION);
}

export function canUpdateQuoteRequestStatus(
  auth: AuthLike,
  roleSlug?: string | null,
): boolean {
  if (isTenantAdmin(auth, roleSlug)) return true;
  return auth.hasPermission(QUOTE_REQUESTS_UPDATE_STATUS_PERMISSION);
}

/** Link CRM / convert — Tenant Admin, view, or sync. */
export function canLinkQuoteRequestCrm(auth: AuthLike, roleSlug?: string | null): boolean {
  if (isTenantAdmin(auth, roleSlug)) return true;
  return auth.hasAnyPermission(
    QUOTE_REQUESTS_VIEW_PERMISSION,
    QUOTE_REQUESTS_SYNC_PERMISSION,
  );
}
