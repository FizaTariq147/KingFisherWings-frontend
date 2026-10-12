import type { PermissionKey } from '@/types/auth.types';

/** Backend Guards on /shipments (OpenAPI permission catalog). */
export const SHIPMENTS_VIEW_PERMISSION: PermissionKey = 'shipments.view';
export const SHIPMENTS_CREATE_PERMISSION: PermissionKey = 'shipments.create';
export const SHIPMENTS_UPDATE_PERMISSION: PermissionKey = 'shipments.update';
export const SHIPMENTS_GENERATE_PERMISSION: PermissionKey = 'shipments.generate';

/** Legacy alias some JWTs may still carry after older syncs. */
export const SHIPMENTS_MANAGE_PERMISSION: PermissionKey = 'shipments.manage';

export function hasShipmentsView(permissions: readonly string[]): boolean {
  return (
    permissions.includes(SHIPMENTS_VIEW_PERMISSION) ||
    permissions.includes(SHIPMENTS_MANAGE_PERMISSION)
  );
}

export function hasShipmentsCreate(permissions: readonly string[]): boolean {
  return (
    permissions.includes(SHIPMENTS_CREATE_PERMISSION) ||
    permissions.includes(SHIPMENTS_MANAGE_PERMISSION)
  );
}

export function hasShipmentsUpdate(permissions: readonly string[]): boolean {
  return (
    permissions.includes(SHIPMENTS_UPDATE_PERMISSION) ||
    permissions.includes(SHIPMENTS_MANAGE_PERMISSION)
  );
}

export function hasShipmentsGenerate(permissions: readonly string[]): boolean {
  return (
    permissions.includes(SHIPMENTS_GENERATE_PERMISSION) ||
    permissions.includes(SHIPMENTS_MANAGE_PERMISSION)
  );
}

/** Map Nest guard strings to short FE messaging (no Sync lecture banner). */
export function formatShipmentsPermissionError(message: string): string {
  const text = String(message ?? '').trim();
  if (!text) return text;
  if (/shipments\.view/i.test(text)) {
    return 'Missing permission: shipments.view';
  }
  if (/shipments\.create/i.test(text)) {
    return 'Missing permission: shipments.create';
  }
  if (/shipments\.update/i.test(text)) {
    return 'Missing permission: shipments.update';
  }
  if (/shipments\.generate/i.test(text)) {
    return 'Missing permission: shipments.generate';
  }
  return text;
}
