import { asRecord, pickString } from '@/features/portal-shared/normalize';
import type { PermissionKey } from '@/types/auth.types';
import type {
  AppNotification,
  NotificationTargeting,
} from '../types/notifications.types';
import { normalizeStaffNotificationType } from './notificationLink';

export type { NotificationTargeting };

/**
 * Access needed to see a notification when BE does not send explicit targeting.
 * Data-driven (not per-role string branches scattered in UI).
 */
export type NotificationAccessRequirement = {
  /** Viewer needs any of these classic menu_* / visibility keys. */
  anyPermission?: readonly PermissionKey[];
  /** Viewer needs see/read/write on any of these matrix modules. */
  anyMatrixModule?: readonly string[];
  /** Gate by Super Admin Features enabled_modules. */
  enabledModule?: string;
  /** Only tenant user-managers (Tenant Admin / owner). */
  tenantManagersOnly?: boolean;
};

export type NotificationViewerContext = {
  userId?: string | null;
  roleSlug?: string | null;
  isTenantManager: boolean;
  permissions: readonly string[];
  hasPermission: (...keys: PermissionKey[]) => boolean;
  hasMatrixModule: (moduleKey: string) => boolean;
  hasEnabledModule: (moduleKey: string) => boolean;
};

function uniqStrings(values: unknown[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const t = v.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function asStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) return uniqStrings(raw);
  if (typeof raw === 'string' && raw.trim()) {
    return uniqStrings(raw.split(/[,|;]/));
  }
  return [];
}

/**
 * Read audience / recipient / role / permission / module targeting from a
 * notification payload without assuming a single BE field name.
 */
export function pickNotificationTargeting(
  raw: Record<string, unknown> | undefined,
): NotificationTargeting {
  if (!raw) return {};
  const nested =
    asRecord(raw.audience_meta) ??
    asRecord(raw.targeting) ??
    asRecord(raw.target) ??
    asRecord(raw.scope) ??
    asRecord(raw.meta) ??
    {};

  const audienceRaw = pickString(
    raw.audience,
    raw.target_audience,
    raw.targetAudience,
    raw.for_audience,
    nested.audience,
    nested.target_audience,
  );
  const audience = audienceRaw
    ? audienceRaw.trim().toLowerCase().replace(/[\s-]+/g, '_')
    : undefined;

  const recipientUserIds = asStringList([
    ...(Array.isArray(raw.recipient_user_ids) ? raw.recipient_user_ids : []),
    ...(Array.isArray(raw.recipientUserIds) ? raw.recipientUserIds : []),
    ...(Array.isArray(raw.user_ids) ? raw.user_ids : []),
    ...(Array.isArray(raw.userIds) ? raw.userIds : []),
    ...(Array.isArray(nested.recipient_user_ids) ? nested.recipient_user_ids : []),
    ...(Array.isArray(nested.user_ids) ? nested.user_ids : []),
    raw.user_id,
    raw.userId,
    raw.recipient_id,
    raw.recipientId,
    nested.user_id,
  ]);

  const roles = asStringList([
    ...(Array.isArray(raw.roles) ? raw.roles : []),
    ...(Array.isArray(raw.target_roles) ? raw.target_roles : []),
    ...(Array.isArray(raw.targetRoles) ? raw.targetRoles : []),
    ...(Array.isArray(nested.roles) ? nested.roles : []),
    raw.role,
    raw.role_slug,
    raw.roleSlug,
  ]);

  const permissions = asStringList([
    ...(Array.isArray(raw.permissions) ? raw.permissions : []),
    ...(Array.isArray(raw.required_permissions) ? raw.required_permissions : []),
    ...(Array.isArray(raw.permission_keys) ? raw.permission_keys : []),
    ...(Array.isArray(nested.permissions) ? nested.permissions : []),
  ]);

  const modules = asStringList([
    ...(Array.isArray(raw.modules) ? raw.modules : []),
    ...(Array.isArray(raw.required_modules) ? raw.required_modules : []),
    ...(Array.isArray(raw.matrix_modules) ? raw.matrix_modules : []),
    ...(Array.isArray(nested.modules) ? nested.modules : []),
    raw.module,
    raw.module_key,
    nested.module,
  ]);

  return {
    ...(audience ? { audience } : {}),
    ...(recipientUserIds.length ? { recipientUserIds } : {}),
    ...(roles.length ? { roles } : {}),
    ...(permissions.length ? { permissions } : {}),
    ...(modules.length ? { modules } : {}),
  };
}

function hasExplicitTargeting(t: NotificationTargeting): boolean {
  return Boolean(
    t.audience ||
      t.recipientUserIds?.length ||
      t.roles?.length ||
      t.permissions?.length ||
      t.modules?.length,
  );
}

function normalizeRoleToken(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

/**
 * Category → access map. Driven by notification type / entity, not hard-coded
 * per user role in the UI. Tenant managers pass unless tenantManagersOnly.
 */
const ACCESS_BY_CATEGORY: Record<string, NotificationAccessRequirement> = {
  JOB: {
    anyPermission: [
      'menu_jobs_air_export',
      'menu_jobs_sea_export',
      'menu_jobs_sea_import',
      'menu_documentation',
    ],
    anyMatrixModule: ['operations', 'nvocc', 'documentation'],
    enabledModule: 'operations',
  },
  SHIPMENT: {
    anyPermission: [
      'menu_jobs_air_export',
      'menu_jobs_sea_export',
      'menu_jobs_sea_import',
      'menu_documentation',
    ],
    anyMatrixModule: ['operations', 'documentation'],
    enabledModule: 'operations',
  },
  QUOTATION: {
    anyPermission: ['menu_quotations', 'menu_sales'],
    anyMatrixModule: ['quotations', 'sales'],
  },
  ENQUIRY: {
    anyPermission: ['menu_sales', 'menu_quotations'],
    anyMatrixModule: ['sales', 'crm', 'quotations'],
  },
  INVOICE: {
    anyPermission: ['menu_finance', 'menu_accounts', 'menu_customers'],
    anyMatrixModule: ['finance', 'accounts'],
    enabledModule: 'finance',
  },
  PURCHASE_INVOICE: {
    anyPermission: ['menu_finance', 'menu_accounts', 'menu_vendors'],
    anyMatrixModule: ['finance', 'accounts', 'vendor'],
  },
  PAYMENT_REQUEST: {
    anyPermission: ['menu_finance', 'menu_accounts', 'menu_vendors'],
    anyMatrixModule: ['finance', 'accounts', 'vendor'],
  },
  DISPUTE: {
    anyPermission: ['menu_vendors', 'menu_finance'],
    anyMatrixModule: ['vendor', 'finance'],
  },
  PARTY: {
    anyPermission: ['menu_customers', 'menu_sales', 'menu_finance'],
    anyMatrixModule: ['parties', 'sales', 'crm'],
  },
  HR: {
    anyPermission: ['menu_hr'],
    anyMatrixModule: ['hr'],
    enabledModule: 'hr',
  },
  TIMESHEET: {
    anyPermission: ['menu_hr'],
    anyMatrixModule: ['hr'],
    enabledModule: 'hr',
  },
  EMPLOYEE: {
    anyPermission: ['menu_hr'],
    anyMatrixModule: ['hr'],
    enabledModule: 'hr',
  },
  WMS: {
    anyPermission: ['menu_warehouse'],
    anyMatrixModule: ['wms'],
    enabledModule: 'wms',
  },
  LOW_STOCK: {
    anyPermission: ['menu_warehouse'],
    anyMatrixModule: ['wms'],
    enabledModule: 'wms',
  },
  REPORT: {
    anyPermission: ['menu_reports', 'menu_management'],
    anyMatrixModule: ['reports', 'management'],
    tenantManagersOnly: true,
  },
  SYSTEM: {
    tenantManagersOnly: true,
  },
};

function requirementForNotification(n: AppNotification): NotificationAccessRequirement | null {
  const category = normalizeStaffNotificationType(n.type || n.kind);
  if (ACCESS_BY_CATEGORY[category]) return ACCESS_BY_CATEGORY[category];

  const entity = String(n.entityType || '')
    .trim()
    .toUpperCase();
  if (entity.includes('JOB')) return ACCESS_BY_CATEGORY.JOB;
  if (entity.includes('SHIPMENT')) return ACCESS_BY_CATEGORY.SHIPMENT;
  if (entity.includes('QUOTATION')) return ACCESS_BY_CATEGORY.QUOTATION;
  if (entity.includes('ENQUIRY')) return ACCESS_BY_CATEGORY.ENQUIRY;
  if (entity.includes('INVOICE')) return ACCESS_BY_CATEGORY.INVOICE;
  if (entity.includes('HR') || entity.includes('LEAVE')) return ACCESS_BY_CATEGORY.HR;
  if (entity.includes('WMS') || entity.includes('WAREHOUSE')) return ACCESS_BY_CATEGORY.WMS;

  // Unknown type with no BE targeting — show to tenant managers only so staff
  // inboxes are not flooded with workspace-wide admin/system noise.
  return { tenantManagersOnly: true };
}

function passesRequirement(
  req: NotificationAccessRequirement,
  viewer: NotificationViewerContext,
): boolean {
  if (req.tenantManagersOnly) return viewer.isTenantManager;
  if (viewer.isTenantManager) return true;

  if (req.enabledModule && !viewer.hasEnabledModule(req.enabledModule)) {
    // If module gate fails, still allow via explicit permission/matrix below.
  }

  if (req.anyPermission?.length) {
    if (viewer.hasPermission(...req.anyPermission)) return true;
  }
  if (req.anyMatrixModule?.length) {
    if (req.anyMatrixModule.some((m) => viewer.hasMatrixModule(m))) return true;
  }

  // Staff with no matching grant — hide.
  if (req.anyPermission?.length || req.anyMatrixModule?.length) return false;

  if (req.enabledModule) return viewer.hasEnabledModule(req.enabledModule);
  return viewer.isTenantManager;
}

function passesExplicitTargeting(
  targeting: NotificationTargeting,
  viewer: NotificationViewerContext,
): boolean {
  if (targeting.recipientUserIds?.length) {
    const id = String(viewer.userId || '').trim();
    if (!id || !targeting.recipientUserIds.includes(id)) return false;
  }

  if (targeting.roles?.length) {
    const slug = normalizeRoleToken(viewer.roleSlug || '');
    const ok = targeting.roles.some((r) => {
      const token = normalizeRoleToken(r);
      if (!token) return false;
      if (token === 'tenant_manager' || token === 'tenant_admin' || token === 'admin') {
        return viewer.isTenantManager;
      }
      if (token === 'staff' || token === 'user') {
        return !viewer.isTenantManager;
      }
      return Boolean(slug) && (slug === token || slug.includes(token) || token.includes(slug));
    });
    if (!ok) return false;
  }

  if (targeting.audience) {
    const a = targeting.audience;
    if (a === 'all' || a === 'everyone' || a === 'tenant') {
      /* open */
    } else if (a === 'tenant_manager' || a === 'tenant_admin' || a === 'admin') {
      if (!viewer.isTenantManager) return false;
    } else if (a === 'staff' || a === 'users' || a === 'employee') {
      if (viewer.isTenantManager) return false;
    } else if (a === 'user') {
      // Must also match recipientUserIds when audience=user.
      if (!targeting.recipientUserIds?.length) return false;
    }
  }

  if (targeting.permissions?.length) {
    const keys = targeting.permissions as PermissionKey[];
    if (!viewer.hasPermission(...keys) && !viewer.isTenantManager) return false;
  }

  if (targeting.modules?.length) {
    const ok =
      viewer.isTenantManager ||
      targeting.modules.some((m) => viewer.hasMatrixModule(m) || viewer.hasEnabledModule(m));
    if (!ok) return false;
  }

  return true;
}

/** True when this viewer should see the notification. */
export function notificationVisibleToViewer(
  notification: AppNotification,
  viewer: NotificationViewerContext,
): boolean {
  const targeting =
    notification.targeting ?? pickNotificationTargeting(notification.raw);

  if (hasExplicitTargeting(targeting)) {
    return passesExplicitTargeting(targeting, viewer);
  }

  const req = requirementForNotification(notification);
  if (!req) return viewer.isTenantManager;
  return passesRequirement(req, viewer);
}

export function filterNotificationsForViewer(
  items: readonly AppNotification[],
  viewer: NotificationViewerContext,
): AppNotification[] {
  return items.filter((n) => notificationVisibleToViewer(n, viewer));
}
