import type { Tenant } from '../types/tenant.types';

const STORAGE_KEY = 'kf-deleted-tenants-v1';
const SHARED_KEY = 'platform';

type DeletedTenantsStore = Record<string, Tenant[]>;

function readStore(): DeletedTenantsStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as DeletedTenantsStore;
  } catch {
    return {};
  }
}

function writeStore(store: DeletedTenantsStore) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/** True when the tenant record is soft-deleted (any common API shape). */
export function isDeletedTenant(tenant: {
  deleted_at?: string | null;
  deletedAt?: unknown;
  is_deleted?: unknown;
  isDeleted?: unknown;
}): boolean {
  if (tenant.deleted_at) return true;
  if (typeof tenant.deletedAt === 'string' && tenant.deletedAt) return true;
  if (tenant.is_deleted === true || tenant.isDeleted === true) return true;
  return false;
}

function toDeletedSnapshot(tenant: Tenant): Tenant {
  return {
    ...tenant,
    deleted_at: tenant.deleted_at || new Date().toISOString(),
    is_active: false,
  };
}

/** Remember a soft-deleted tenant so the Deleted filter can list them (API omits them from GET /tenants). */
export function rememberDeletedTenant(tenant: Tenant): void {
  const store = readStore();
  const snapshot = toDeletedSnapshot(tenant);
  const existing = store[SHARED_KEY] ?? [];
  store[SHARED_KEY] = [snapshot, ...existing.filter((item) => item.id !== tenant.id)];
  writeStore(store);
}

export function forgetDeletedTenant(tenantId: string): void {
  const store = readStore();
  for (const key of Object.keys(store)) {
    store[key] = (store[key] ?? []).filter((item) => item.id !== tenantId);
  }
  writeStore(store);
}

export function listRememberedDeletedTenants(): Tenant[] {
  const store = readStore();
  const byId = new Map<string, Tenant>();

  for (const tenants of Object.values(store)) {
    for (const tenant of tenants ?? []) {
      byId.set(tenant.id, toDeletedSnapshot(tenant));
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.deleted_at ? Date.parse(a.deleted_at) : 0;
    const bTime = b.deleted_at ? Date.parse(b.deleted_at) : 0;
    return bTime - aTime;
  });
}

export function isRememberedDeletedTenant(tenantId: string): boolean {
  return listRememberedDeletedTenants().some((tenant) => tenant.id === tenantId);
}
