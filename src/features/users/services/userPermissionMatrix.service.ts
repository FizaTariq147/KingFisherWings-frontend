import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { ROLE_API, USER_API } from '../api/user.api';
import type {
  PermissionMatrix,
  RoleListResult,
  UpdatePermissionMatrixDto,
  UpdateUserPermissionsDto,
  UserPermissionAssignment,
} from '../types/userPermissionMatrix.types';
import { isApiUnavailable } from '../utils/isApiUnavailable';
import {
  normalizePermissionMatrix,
  normalizeRoleList,
  normalizeUserPermissionAssignment,
} from '../utils/normalizeUserPermissionMatrix';

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[] }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  const status = axiosErr.response?.status;
  if (status === 404 || status === 501) {
    return new Error('This permission API is not available yet.');
  }
  return new Error(axiosErr.message || 'Request failed');
}

function assertUserId(id?: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid user id.');
}

export const userPermissionMatrixService = {
  async getPermissionMatrix(): Promise<PermissionMatrix> {
    try {
      const res = await axiosInstance.get(USER_API.permissionMatrix);
      return normalizePermissionMatrix(res.data, true);
    } catch (error) {
      if (isApiUnavailable(error)) {
        return normalizePermissionMatrix(null, false);
      }
      throw formatAxiosError(error);
    }
  },

  async getUserPermissions(userId: string): Promise<UserPermissionAssignment> {
    assertUserId(userId);
    const paths = [USER_API.userPermissionMatrix(userId), USER_API.permissions(userId)];
    let lastErr: unknown;
    for (const path of paths) {
      try {
        const res = await axiosInstance.get(path);
        return normalizeUserPermissionAssignment(res.data, true);
      } catch (error) {
        lastErr = error;
        if (!isApiUnavailable(error)) throw formatAxiosError(error);
      }
    }
    if (isApiUnavailable(lastErr)) {
      return normalizeUserPermissionAssignment(null, false);
    }
    throw formatAxiosError(lastErr);
  },

  async updateUserPermissions(
    userId: string,
    dto: UpdatePermissionMatrixDto | UpdateUserPermissionsDto,
  ): Promise<UserPermissionAssignment> {
    assertUserId(userId);
    const grants =
      'grants' in dto && Array.isArray(dto.grants)
        ? dto.grants
        : [];
    const body: UpdatePermissionMatrixDto = { grants };

    try {
      const res = await axiosInstance.put(USER_API.userPermissionMatrix(userId), body);
      return normalizeUserPermissionAssignment(res.data ?? body, true);
    } catch (error) {
      // Legacy flat permissions fallback (older backends).
      if (isApiUnavailable(error) && 'permission_keys' in dto) {
        const res = await axiosInstance.put(USER_API.permissions(userId), {
          permission_ids: dto.permission_ids ?? [],
          permission_keys: dto.permission_keys ?? [],
        });
        return normalizeUserPermissionAssignment(res.data ?? dto, true);
      }
      throw formatAxiosError(error);
    }
  },

  async listRoles(): Promise<RoleListResult> {
    try {
      const res = await axiosInstance.get(ROLE_API.list);
      return normalizeRoleList(res.data, true);
    } catch (error) {
      if (isApiUnavailable(error)) {
        return { available: false, roles: [] };
      }
      throw formatAxiosError(error);
    }
  },

  async updateRolePermissions(
    roleId: string,
    dto: UpdateUserPermissionsDto,
  ): Promise<UserPermissionAssignment> {
    if (!roleId || !isUuid(roleId)) throw new Error('Invalid role id.');
    try {
      const res = await axiosInstance.put(ROLE_API.permissions(roleId), {
        ...(dto.grants ? { grants: dto.grants } : {}),
        ...(dto.permission_ids ? { permission_ids: dto.permission_ids } : {}),
        ...(dto.permission_keys ? { permission_keys: dto.permission_keys } : {}),
      });
      return normalizeUserPermissionAssignment(res.data ?? dto, true);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
