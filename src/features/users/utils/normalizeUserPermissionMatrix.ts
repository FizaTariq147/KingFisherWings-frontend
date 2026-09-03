import { asRecord, pickString, unwrapData } from '@/features/portal-shared/normalize';
import type {
  PermissionCatalogItem,
  PermissionMatrix,
  PermissionModuleGroup,
  RoleListResult,
  RoleSummary,
  UserPermissionAssignment,
} from '../types/userPermissionMatrix.types';

const CRUD_ACTIONS = new Set(['view', 'create', 'update']);

function titleCase(value: string): string {
  return value
    .replace(/^menu_/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferAction(key: string, rawAction?: string): string {
  const explicit = (rawAction ?? '').trim().toLowerCase();
  if (explicit) {
    if (explicit === 'read' || explicit === 'list' || explicit === 'get') return 'view';
    if (explicit === 'write' || explicit === 'edit' || explicit === 'patch' || explicit === 'put') {
      return 'update';
    }
    if (explicit === 'post' || explicit === 'add') return 'create';
    return explicit;
  }

  const token = key.split(/[.:/]/).pop()?.toLowerCase() ?? '';
  if (token === 'read' || token === 'list' || token === 'get') return 'view';
  if (token === 'write' || token === 'edit' || token === 'patch') return 'update';
  if (CRUD_ACTIONS.has(token)) return token;
  if (key.startsWith('menu_')) return 'view';
  return token || 'view';
}

function inferModule(key: string, rawModule?: string): string {
  const explicit = (rawModule ?? '').trim();
  if (explicit) return explicit;
  if (key.startsWith('menu_')) return key.slice('menu_'.length) || 'general';
  const parts = key.split(/[.:/]/).filter(Boolean);
  if (parts.length >= 2) return parts.slice(0, -1).join('.');
  return parts[0] || 'general';
}

function collectItems(raw: unknown): unknown[] {
  const data = unwrapData(raw);
  if (Array.isArray(data)) return data;

  const record = asRecord(data) ?? asRecord(raw);
  if (!record) return [];

  for (const key of ['permissions', 'items', 'catalog', 'entries', 'matrix']) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  const modules = record.modules ?? record.groups;
  if (Array.isArray(modules)) {
    const nested: unknown[] = [];
    for (const moduleRaw of modules) {
      const moduleRecord = asRecord(moduleRaw);
      if (!moduleRecord) continue;
      const moduleKey = pickString(
        moduleRecord.module,
        moduleRecord.key,
        moduleRecord.slug,
        moduleRecord.name,
        moduleRecord.code,
      );
      const moduleLabel = pickString(moduleRecord.label, moduleRecord.name, moduleRecord.title) || moduleKey;
      const perms =
        (Array.isArray(moduleRecord.permissions) && moduleRecord.permissions) ||
        (Array.isArray(moduleRecord.items) && moduleRecord.items) ||
        (Array.isArray(moduleRecord.actions) && moduleRecord.actions) ||
        [];
      const crudFlags = ['view', 'create', 'update'] as const;
      const hasCrudFlags = crudFlags.some(
        (action) => moduleRecord[action] != null || moduleRecord[`can_${action}`] != null,
      );
      if (perms.length === 0 && hasCrudFlags) {
        for (const action of crudFlags) {
          const value = moduleRecord[action] ?? moduleRecord[`can_${action}`];
          const valueRecord = asRecord(value);
          nested.push({
            key: valueRecord
              ? pickString(valueRecord.key, valueRecord.permission_key) || `${moduleKey}.${action}`
              : `${moduleKey}.${action}`,
            id: valueRecord ? pickString(valueRecord.id) : undefined,
            action,
            module: moduleKey,
            module_label: moduleLabel,
          });
        }
        continue;
      }
      if (perms.length === 0) {
        nested.push({ ...moduleRecord, module: moduleKey, module_label: moduleLabel });
        continue;
      }
      for (const perm of perms) {
        const permRecord = asRecord(perm);
        nested.push({
          ...(permRecord ?? { key: String(perm) }),
          module: moduleKey,
          module_label: moduleLabel,
        });
      }
    }
    return nested;
  }

  return [];
}

function normalizeCatalogItem(raw: unknown): PermissionCatalogItem | null {
  if (typeof raw === 'string' && raw.trim()) {
    const key = raw.trim();
    const module = inferModule(key);
    const action = inferAction(key);
    return {
      key,
      module,
      moduleLabel: titleCase(module),
      action,
      label: titleCase(action),
    };
  }

  const record = asRecord(raw);
  if (!record) return null;

  const key = pickString(record.key, record.permission_key, record.permissionKey, record.code, record.slug);
  const id = pickString(record.id, record.permission_id, record.permissionId);
  if (!key && !id) return null;

  const resolvedKey = key || id;
  const module = inferModule(
    resolvedKey,
    pickString(record.module, record.module_key, record.group, record.resource, record.category),
  );
  const action = inferAction(
    resolvedKey,
    pickString(record.action, record.operation, record.verb, record.capability),
  );

  return {
    id: id || undefined,
    key: resolvedKey,
    module,
    moduleLabel:
      pickString(record.module_label, record.moduleLabel, record.module_name, record.group_label) ||
      titleCase(module),
    action,
    label: pickString(record.label, record.name, record.title) || titleCase(action),
  };
}

function groupModules(items: PermissionCatalogItem[]): PermissionModuleGroup[] {
  const byModule = new Map<string, PermissionModuleGroup>();
  for (const item of items) {
    const existing = byModule.get(item.module);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    byModule.set(item.module, {
      module: item.module,
      label: item.moduleLabel || titleCase(item.module),
      items: [item],
    });
  }
  return [...byModule.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function normalizePermissionMatrix(raw: unknown, available = true): PermissionMatrix {
  const items = collectItems(raw)
    .map(normalizeCatalogItem)
    .filter((item): item is PermissionCatalogItem => Boolean(item));

  return {
    available,
    modules: groupModules(items),
  };
}

function collectStringList(raw: unknown, keys: string[]): string[] {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  const values = new Set<string>();

  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) values.add(value.trim());
    else if (typeof value === 'number') values.add(String(value));
  };

  if (Array.isArray(raw)) {
    raw.forEach(push);
  }

  if (record) {
    for (const key of keys) {
      const list = record[key];
      if (Array.isArray(list)) list.forEach(push);
    }
    const nested = record.permissions;
    if (Array.isArray(nested)) {
      for (const item of nested) {
        if (typeof item === 'string') push(item);
        const itemRecord = asRecord(item);
        if (itemRecord) {
          push(itemRecord.id);
          push(itemRecord.permission_id);
          push(itemRecord.key);
          push(itemRecord.permission_key);
        }
      }
    }
  }

  return [...values];
}

export function normalizeUserPermissionAssignment(
  raw: unknown,
  available = true,
): UserPermissionAssignment {
  const ids = collectStringList(raw, [
    'permission_ids',
    'permissionIds',
    'assigned_ids',
    'ids',
  ]);
  const keys = collectStringList(raw, [
    'permission_keys',
    'permissionKeys',
    'keys',
    'assigned_keys',
  ]);

  return {
    available,
    permission_ids: ids,
    permission_keys: keys,
  };
}

export function normalizeRoleList(raw: unknown, available = true): RoleListResult {
  const data = unwrapData(raw);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.roles)
      ? (asRecord(data)!.roles as unknown[])
      : Array.isArray(asRecord(data)?.items)
        ? (asRecord(data)!.items as unknown[])
        : [];

  const roles: RoleSummary[] = [];
  for (const item of list) {
    const record = asRecord(item);
    if (!record) continue;
    const id = pickString(record.id);
    const name = pickString(record.name, record.label, record.slug, record.title);
    if (!id || !name) continue;
    roles.push({
      id,
      name,
      slug: pickString(record.slug) || undefined,
    });
  }

  return { available, roles };
}
