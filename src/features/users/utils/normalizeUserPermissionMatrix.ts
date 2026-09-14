import { asRecord, pickBoolean, pickString, unwrapData } from '@/features/portal-shared/normalize';
import type {
  PermissionAccessGrant,
  PermissionMatrix,
  PermissionMatrixGrant,
  PermissionModuleNode,
  PermissionSubmoduleNode,
  RoleListResult,
  RoleMatrixPreset,
  RolePresetsResult,
  RoleSummary,
  UserPermissionAssignment,
} from '../types/userPermissionMatrix.types';
import {
  flagsFromAccess,
  normalizeGrantFlags,
  parseAccessLevel,
  toAccessGrants,
} from './permissionAccess';

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

function flagsFromRaw(record: Record<string, unknown>): {
  access: ReturnType<typeof parseAccessLevel>;
  see: boolean;
  read: boolean;
  write: boolean;
} {
  const access = parseAccessLevel(record.access ?? record.access_level ?? record.level);
  if (access) {
    return { access, ...flagsFromAccess(access) };
  }
  const see = boolish(record.see ?? record.can_see ?? record.view);
  const read = boolish(record.read ?? record.can_read);
  const write = boolish(record.write ?? record.can_write ?? record.edit);
  const grant = normalizeGrantFlags({
    module: '_',
    submodule: '_',
    see,
    read,
    write,
  });
  return {
    access: grant.access ?? null,
    see: grant.see,
    read: grant.read,
    write: grant.write,
  };
}

function normalizeSubmodule(raw: unknown): PermissionSubmoduleNode | null {
  const record = asRecord(raw);
  if (!record) return null;
  const submodule =
    pickString(record.submodule, record.key, record.slug, record.code, record.id, record.name) ||
    '';
  if (!submodule) return null;
  const flags = flagsFromRaw(record);
  return {
    submodule,
    label:
      pickString(record.label, record.name, record.title, record.display_name) ||
      titleCase(submodule),
    ...(flags.access ? { access: flags.access } : {}),
    see: flags.see,
    read: flags.read,
    write: flags.write,
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
    .map((row) => normalizeSubmodule(row))
    .filter((row): row is PermissionSubmoduleNode => Boolean(row));

  // Flat grant row shaped as { module, submodule, access | see/read/write }
  if (!submodules.length) {
    const submodule = pickString(record.submodule);
    if (submodule) {
      const flags = flagsFromRaw(record);
      submodules.push({
        submodule,
        label: titleCase(submodule),
        ...(flags.access ? { access: flags.access } : {}),
        see: flags.see,
        read: flags.read,
        write: flags.write,
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

  // Live API: GET /users/:id/permission-matrix → { user_id, tree: [{ key, submodules: [{ key, access|see/read/write }] }] }
  const treeList =
    (Array.isArray(record?.tree) && record!.tree) ||
    (Array.isArray(record?.modules) && record!.modules) ||
    [];

  if (treeList.length) {
    const grants: PermissionMatrixGrant[] = [];
    for (const modRow of treeList) {
      const mod = normalizeModule(modRow);
      if (!mod) continue;
      for (const sub of mod.submodules) {
        grants.push(
          normalizeGrantFlags({
            module: mod.module,
            submodule: sub.submodule,
            access: sub.access,
            see: sub.see,
            read: sub.read,
            write: sub.write,
          }),
        );
      }
    }
    return { available, grants };
  }

  const list =
    (Array.isArray(data) && data) ||
    (Array.isArray(record?.grants) && record!.grants) ||
    (Array.isArray(record?.permission_grants) && record!.permission_grants) ||
    (Array.isArray(record?.permissions) && record!.permissions) ||
    (Array.isArray(record?.items) && record!.items) ||
    [];

  const grants: PermissionMatrixGrant[] = [];
  for (const row of list) {
    const r = asRecord(row);
    if (!r) continue;
    const module = pickString(r.module, r.module_key, r.key);
    const submodule = pickString(r.submodule, r.submodule_key);
    if (!module || !submodule) continue;
    const flags = flagsFromRaw(r);
    grants.push(
      normalizeGrantFlags({
        module,
        submodule,
        access: flags.access ?? undefined,
        see: flags.see,
        read: flags.read,
        write: flags.write,
      }),
    );
  }

  return { available, grants };
}

export function grantsFromMatrixSelection(
  modules: PermissionModuleNode[],
): PermissionMatrixGrant[] {
  const grants: PermissionMatrixGrant[] = [];
  for (const mod of modules) {
    for (const sub of mod.submodules) {
      grants.push(
        normalizeGrantFlags({
          module: mod.module,
          submodule: sub.submodule,
          access: sub.access,
          see: sub.see,
          read: sub.read,
          write: sub.write,
        }),
      );
    }
  }
  return grants;
}

export function applyGrantsToMatrix(
  modules: PermissionModuleNode[],
  grants: PermissionMatrixGrant[],
): PermissionModuleNode[] {
  const map = new Map(
    grants.map((g) => {
      const n = normalizeGrantFlags(g);
      return [`${n.module}::${n.submodule}`, n] as const;
    }),
  );
  return modules.map((mod) => ({
    ...mod,
    submodules: mod.submodules.map((sub) => {
      const grant = map.get(`${mod.module}::${sub.submodule}`);
      if (!grant) {
        return { ...sub, access: 'none' as const, see: false, read: false, write: false };
      }
      return {
        ...sub,
        access: grant.access,
        see: grant.see,
        read: grant.read,
        write: grant.write,
      };
    }),
  }));
}

export function accessGrantsFromMatrixSelection(
  modules: PermissionModuleNode[],
): PermissionAccessGrant[] {
  return toAccessGrants(grantsFromMatrixSelection(modules));
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

function normalizeAccessGrantRow(raw: unknown): PermissionAccessGrant | null {
  const r = asRecord(raw);
  if (!r) return null;
  const module = pickString(r.module, r.module_key);
  const submodule = pickString(r.submodule, r.submodule_key);
  if (!module || !submodule) return null;
  const flags = flagsFromRaw(r);
  const access = flags.access ?? normalizeGrantFlags({
    module,
    submodule,
    see: flags.see,
    read: flags.read,
    write: flags.write,
  }).access;
  if (!access) return null;
  return { module, submodule, access };
}

export function normalizeRolePresets(raw: unknown, available = true): RolePresetsResult {
  const data = unwrapData(raw);
  const record = asRecord(data) ?? asRecord(raw);
  const list =
    (Array.isArray(data) && data) ||
    (Array.isArray(record?.presets) && record!.presets) ||
    (Array.isArray(record?.roles) && record!.roles) ||
    (Array.isArray(record?.items) && record!.items) ||
    [];

  const presets: RoleMatrixPreset[] = [];
  for (const item of list) {
    const row = asRecord(item);
    if (!row) continue;
    const code = (
      pickString(row.code, row.role, row.role_code, row.slug, row.key) || ''
    ).toUpperCase();
    if (!code) continue;
    const name = pickString(row.name, row.label, row.title) || titleCase(code);
    const grantsRaw =
      (Array.isArray(row.default_grants) && row.default_grants) ||
      (Array.isArray(row.grants) && row.grants) ||
      (Array.isArray(row.permission_grants) && row.permission_grants) ||
      [];
    const default_grants = grantsRaw
      .map((g) => normalizeAccessGrantRow(g))
      .filter((g): g is PermissionAccessGrant => Boolean(g));
    presets.push({ code, name, default_grants });
  }

  return { available, presets };
}

/** Convert role-preset access grants into matrix grants for the editor. */
export function matrixGrantsFromAccessGrants(
  grants: PermissionAccessGrant[],
): PermissionMatrixGrant[] {
  return grants.map((g) =>
    normalizeGrantFlags({
      module: g.module,
      submodule: g.submodule,
      access: g.access,
    }),
  );
}
