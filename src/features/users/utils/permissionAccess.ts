import type {
  PermissionAccessLevel,
  PermissionAccessGrant,
  PermissionMatrixGrant,
  PermissionModuleNode,
  PermissionSubmoduleNode,
} from '../types/userPermissionMatrix.types';

/** Expand product access into see/read/write cascade (write ⇒ all three). */
export function flagsFromAccess(access: PermissionAccessLevel): {
  see: boolean;
  read: boolean;
  write: boolean;
} {
  if (access === 'write') return { see: true, read: true, write: true };
  if (access === 'read') return { see: true, read: true, write: false };
  return { see: false, read: false, write: false };
}

/**
 * Collapse boolean flags to access.
 * Pure write-without-read is not supported — write wins; see-only maps to read.
 */
export function accessFromFlags(
  see: boolean,
  read: boolean,
  write: boolean,
): PermissionAccessLevel {
  if (write) return 'write';
  if (read || see) return 'read';
  return 'none';
}

export function parseAccessLevel(raw: unknown): PermissionAccessLevel | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase();
  if (v === 'none' || v === 'read' || v === 'write') return v;
  if (v === 'read_write' || v === 'read-write' || v === 'read&write' || v === 'full') {
    return 'write';
  }
  if (v === 'view' || v === 'readonly' || v === 'read_only') return 'read';
  return null;
}

/** Ensure grant has both `access` and cascade booleans. */
export function normalizeGrantFlags(
  partial: Partial<PermissionMatrixGrant> & {
    module: string;
    submodule: string;
  },
): PermissionMatrixGrant {
  const fromAccess = parseAccessLevel(partial.access);
  if (fromAccess) {
    const flags = flagsFromAccess(fromAccess);
    return {
      module: partial.module,
      submodule: partial.submodule,
      access: fromAccess,
      ...flags,
    };
  }
  const see = Boolean(partial.see);
  const read = Boolean(partial.read);
  const write = Boolean(partial.write);
  const access = accessFromFlags(see, read, write);
  const flags = flagsFromAccess(access);
  return {
    module: partial.module,
    submodule: partial.submodule,
    access,
    ...flags,
  };
}

export function toAccessGrants(grants: PermissionMatrixGrant[]): PermissionAccessGrant[] {
  return grants.map((g) => {
    const normalized = normalizeGrantFlags(g);
    return {
      module: normalized.module,
      submodule: normalized.submodule,
      access: normalized.access ?? accessFromFlags(normalized.see, normalized.read, normalized.write),
    };
  });
}

/** Payload for PUT /users/:id/permission-matrix — prefer `access`, keep booleans for older APIs. */
export function toMatrixUpdateGrants(grants: PermissionMatrixGrant[]): PermissionMatrixGrant[] {
  return grants.map((g) => normalizeGrantFlags(g));
}

export function accessLabel(access: PermissionAccessLevel): string {
  if (access === 'write') return 'Read & Write';
  if (access === 'read') return 'Read';
  return 'None';
}

export function submoduleAccess(sub: PermissionSubmoduleNode): PermissionAccessLevel {
  return (
    sub.access ??
    accessFromFlags(sub.see, sub.read, sub.write)
  );
}

export function setSubmoduleAccess(
  modules: PermissionModuleNode[],
  moduleKey: string,
  submoduleKey: string,
  access: PermissionAccessLevel,
): PermissionModuleNode[] {
  const flags = flagsFromAccess(access);
  return modules.map((mod) => {
    if (mod.module !== moduleKey) return mod;
    return {
      ...mod,
      submodules: mod.submodules.map((sub) =>
        sub.submodule === submoduleKey
          ? { ...sub, access, see: flags.see, read: flags.read, write: flags.write }
          : sub,
      ),
    };
  });
}
