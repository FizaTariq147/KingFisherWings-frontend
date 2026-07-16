import type { User } from '../types/user.types';

const STORAGE_KEY = 'kf-deleted-users-v1';
/** Shared bucket so Deleted list works even when tenant UUID is missing from JWT. */
const SHARED_KEY = 'erp';

type DeletedUsersStore = Record<string, User[]>;

function readStore(): DeletedUsersStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as DeletedUsersStore;
  } catch {
    return {};
  }
}

function writeStore(store: DeletedUsersStore) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function resolveDeletedUsersTenantKey(tenantId?: string | null): string {
  if (tenantId && tenantId !== 'session') return tenantId;
  return SHARED_KEY;
}

function storageKeysFor(tenantKey: string, user?: Pick<User, 'tenant_id'>): string[] {
  const keys = new Set<string>([SHARED_KEY, 'session']);
  const resolved = resolveDeletedUsersTenantKey(tenantKey);
  keys.add(resolved);
  if (user?.tenant_id) keys.add(user.tenant_id);
  return Array.from(keys);
}

/** True when the user record is soft-deleted (any common API shape). */
export function isDeletedUser(user: {
  deleted_at?: string | null;
  deletedAt?: unknown;
  is_deleted?: unknown;
  isDeleted?: unknown;
}): boolean {
  if (user.deleted_at) return true;
  if (typeof user.deletedAt === 'string' && user.deletedAt) return true;
  if (user.is_deleted === true || user.isDeleted === true) return true;
  return false;
}

function toDeletedSnapshot(user: User): User {
  return {
    ...user,
    deleted_at: user.deleted_at || new Date().toISOString(),
  };
}

/** Remember a soft-deleted user so the Deleted filter can list them (API omits them from GET /users). */
export function rememberDeletedUser(tenantKey: string, user: User): void {
  const store = readStore();
  const snapshot = toDeletedSnapshot(user);

  for (const key of storageKeysFor(tenantKey, user)) {
    const existing = store[key] ?? [];
    store[key] = [snapshot, ...existing.filter((item) => item.id !== user.id)];
  }

  writeStore(store);
}

export function forgetDeletedUser(tenantKey: string, userId: string): void {
  const store = readStore();
  const keys = new Set([...Object.keys(store), ...storageKeysFor(tenantKey)]);

  for (const key of keys) {
    store[key] = (store[key] ?? []).filter((item) => item.id !== userId);
  }

  writeStore(store);
}

export function listRememberedDeletedUsers(tenantKey: string): User[] {
  const store = readStore();
  const byId = new Map<string, User>();

  for (const key of storageKeysFor(tenantKey)) {
    for (const user of store[key] ?? []) {
      byId.set(user.id, user);
    }
  }

  // Also sweep any other buckets (covers older key mismatches).
  for (const users of Object.values(store)) {
    for (const user of users ?? []) {
      byId.set(user.id, user);
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.deleted_at ? Date.parse(a.deleted_at) : 0;
    const bTime = b.deleted_at ? Date.parse(b.deleted_at) : 0;
    return bTime - aTime;
  });
}

export function mergeDeletedUsers(apiUsers: User[], remembered: User[]): User[] {
  const byId = new Map<string, User>();
  for (const user of remembered) byId.set(user.id, toDeletedSnapshot(user));
  for (const user of apiUsers) {
    if (isDeletedUser(user)) byId.set(user.id, toDeletedSnapshot(user));
  }
  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.deleted_at ? Date.parse(a.deleted_at) : 0;
    const bTime = b.deleted_at ? Date.parse(b.deleted_at) : 0;
    return bTime - aTime;
  });
}
