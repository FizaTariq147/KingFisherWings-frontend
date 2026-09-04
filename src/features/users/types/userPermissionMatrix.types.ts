/** Module → submodule → see / read / write (OpenAPI UpdatePermissionMatrixDto). */
export interface PermissionMatrixGrant {
  module: string;
  submodule: string;
  see: boolean;
  read: boolean;
  write: boolean;
}

export interface PermissionSubmoduleNode {
  submodule: string;
  label: string;
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
