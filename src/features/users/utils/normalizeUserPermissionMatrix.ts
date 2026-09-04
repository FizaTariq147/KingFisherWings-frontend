import { asRecord, pickBoolean, pickString, unwrapData } from '@/features/portal-shared/normalize';
import type {
  PermissionMatrix,
  PermissionMatrixGrant,
  PermissionModuleNode,
  PermissionSubmoduleNode,
  RoleListResult,
  RoleSummary,
  UserPermissionAssignment,
} from '../types/userPermissionMatrix.types';

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function boolish(value: unknown, fallback = false): boolean {
  return pickBoolean(value) ?? fallback;
}

function normalizeSubmodule(
  raw: unknown,
  moduleKey: string,
): PermissionSubmoduleNode | null {
  const record = asRecord(raw);
  if (!record) return null;
  const submodule =
    pickString(record.submodule, record.key, record.slug, record.code, record.id, record.name) ||
    '';
  if (!submodule) return null;
  return {
    submodule,
    label:
      pickString(record.label, record.name, record.title, record.display_name) ||
      titleCase(submodule),
    see: boolish(record.see ?? record.can_see ?? record.view),
    read: boolish(record.read ?? record.can_read),
    write: boolish(record.write ?? record.can_write ?? record.edit),
  };
}

function normalizeModule(raw: unknown): PermissionModuleNode | null {
  const record = asRecord(raw);
  if (!record) return null;
  const module =
    pickString(record.module, record.key, record.slug, record.code, record.name) || '';
  if (!module) return null;
  const label =
    pickString(record.label, record.name, record.title, record.module_label) || titleCase(module);

  const nested =
    (Array.isArray(record.submodules) && record.submodules) ||
    (Array.isArray(record.children) && record.children) ||
    (Array.isArray(record.items) && record.items) ||
    (Array.isArray(record.permissions) && record.permissions) ||
    [];

  const submodules = nested
    .map((row) => normalizeSubmodule(row, module))
    .filter((row): row is PermissionSubmoduleNode => Boolean(row));

  // Flat grant row shaped as { module, submodule, see, read, write }
  if (!submodules.length) {
    const submodule = pickString(record.submodule);
    if (submodule) {
      submodules.push({
        submodule,
        label: titleCase(submodule),
        see: boolish(record.see ?? record.can_see),
        read: boolish(record.read ?? record.can_read),
        write: boolish(record.write ?? record.can_write),
      });
    }
  }

  return { module, label, submodules };
}

export function normalizePermissionMatrix(raw: unknown, available = true): PermissionMatrix {
  const data = unwrapData(raw);
  const record = asRecord(data) ?? asRecord(raw);
  const list =
    (Array.isArray(data) && data) ||
    (Array.isArray(record?.modules) && record!.modules) ||
    (Array.isArray(record?.tree) && record!.tree) ||
    (Array.isArray(record?.items) && record!.items) ||
    (Array.isArray(record?.grants) && record!.grants) ||
    [];

  const byModule = new Map<string, PermissionModuleNode>();
  for (const row of list) {
    const mod = normalizeModule(row);
    if (!mod) continue;
    const existing = byModule.get(mod.module);
    if (!existing) {
      byModule.set(mod.module, mod);
      continue;
    }
    for (const sub of mod.submodules) {
      if (!existing.submodules.some((s) => s.submodule === sub.submodule)) {
        existing.submodules.push(sub);
      }
    }
  }

  const modules = [...byModule.values()]
    .map((m) => ({
      ...m,
      submodules: [...m.submodules].sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { available, modules };
}

export function normalizeUserPermissionAssignment(
  raw: unknown,
  available = true,
): UserPermissionAssignment {
  const data = unwrapData(raw);
  const record = asRecord(data) ?? asRecord(raw);
  const list =
    (Array.isArray(data) && data) ||
    (Array.isArray(record?.grants) && record!.grants) ||
    (Array.isArray(record?.permissions) && record!.permissions) ||
    (Array.isArray(record?.items) && record!.items) ||
    [];

  const grants: PermissionMatrixGrant[] = [];
  for (const row of list) {
    const r = asRecord(row);
    if (!r) continue;
    const module = pickString(r.module, r.module_key);
    const submodule = pickString(r.submodule, r.submodule_key, r.key);
    if (!module || !submodule) continue;
    grants.push({
      module,
      submodule,
      see: boolish(r.see ?? r.can_see, false),
      read: boolish(r.read ?? r.can_read, false),
      write: boolish(r.write ?? r.can_write, false),
    });
  }

  return { available, grants };
}

export function grantsFromMatrixSelection(
  modules: PermissionModuleNode[],
): PermissionMatrixGrant[] {
  const grants: PermissionMatrixGrant[] = [];
  for (const mod of modules) {
    for (const sub of mod.submodules) {
      grants.push({
        module: mod.module,
        submodule: sub.submodule,
        see: sub.see,
        read: sub.read,
        write: sub.write,
      });
    }
  }
  return grants;
}

export function applyGrantsToMatrix(
  modules: PermissionModuleNode[],
  grants: PermissionMatrixGrant[],
): PermissionModuleNode[] {
  const map = new Map(grants.map((g) => [`${g.module}::${g.submodule}`, g]));
  return modules.map((mod) => ({
    ...mod,
    submodules: mod.submodules.map((sub) => {
      const grant = map.get(`${mod.module}::${sub.submodule}`);
      if (!grant) {
        return { ...sub, see: false, read: false, write: false };
      }
      return {
        ...sub,
        see: grant.see,
        read: grant.read,
        write: grant.write,
      };
    }),
  }));
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
