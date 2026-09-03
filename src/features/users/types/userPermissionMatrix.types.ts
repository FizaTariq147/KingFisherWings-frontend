export type PermissionCrudAction = 'view' | 'create' | 'update';

export interface PermissionCatalogItem {
  id?: string;
  key: string;
  module: string;
  moduleLabel: string;
  action: string;
  label: string;
}

export interface PermissionModuleGroup {
  module: string;
  label: string;
  items: PermissionCatalogItem[];
}

export interface PermissionMatrix {
  available: boolean;
  modules: PermissionModuleGroup[];
}

export interface UserPermissionAssignment {
  available: boolean;
  permission_ids: string[];
  permission_keys: string[];
}

export interface UpdateUserPermissionsDto {
  permission_ids?: string[];
  permission_keys?: string[];
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
