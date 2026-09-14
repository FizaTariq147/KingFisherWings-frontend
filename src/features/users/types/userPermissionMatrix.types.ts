/** Module → submodule access for create-user + permission matrix APIs. */
export type PermissionAccessLevel = 'none' | 'read' | 'write';

/**
 * Matrix grant. Prefer `access`; `see`/`read`/`write` kept for backward compatibility
 * and are expanded from `access` when present (write ⇒ all three true).
 */
export interface PermissionMatrixGrant {
  module: string;
  submodule: string;
  access?: PermissionAccessLevel;
  see: boolean;
  read: boolean;
  write: boolean;
}

/** Create/UpdateUserDto.permission_grants item. */
export interface PermissionAccessGrant {
  module: string;
  submodule: string;
  access: PermissionAccessLevel;
}

export interface PermissionSubmoduleNode {
  submodule: string;
  label: string;
  access?: PermissionAccessLevel;
  see: boolean;
  read: boolean;
  write: boolean;
}

export interface PermissionModuleNode {
  module: string;
  label: string;
  submodules: PermissionSubmoduleNode[];
}

export interface PermissionMatrix {
  available: boolean;
  modules: PermissionModuleNode[];
}

export interface UserPermissionAssignment {
  available: boolean;
  grants: PermissionMatrixGrant[];
}

export interface UpdatePermissionMatrixDto {
  grants: PermissionMatrixGrant[];
}

/** @deprecated Legacy flat permission ids/keys — kept for optional role PUT. */
export interface UpdateUserPermissionsDto {
  permission_ids?: string[];
  permission_keys?: string[];
  grants?: PermissionMatrixGrant[];
}

export interface RoleSummary {
  id: string;
  name: string;
  slug?: string;
}

export interface RoleListResult {
  available: boolean;
  roles: RoleSummary[];
}

/** GET /users/role-presets — Step 1 role → default Step 3 grants. */
export interface RoleMatrixPreset {
  code: string;
  name: string;
  default_grants: PermissionAccessGrant[];
}

export interface RolePresetsResult {
  available: boolean;
  presets: RoleMatrixPreset[];
}
