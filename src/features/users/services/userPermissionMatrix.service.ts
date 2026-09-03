import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { ROLE_API, USER_API } from '../api/user.api';
import type {
  PermissionMatrix,
  RoleListResult,
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

function buildUpdateBody(dto: UpdateUserPermissionsDto): UpdateUserPermissionsDto {
  const body: UpdateUserPermissionsDto = {};
  if (dto.permission_ids && dto.permission_ids.length > 0) {
    body.permission_ids = dto.permission_ids;
  }
  if (dto.permission_keys && dto.permission_keys.length > 0) {
    body.permission_keys = dto.permission_keys;
  }
  if (!body.permission_ids && !body.permission_keys) {
    body.permission_ids = dto.permission_ids ?? [];
    body.permission_keys = dto.permission_keys ?? [];
  }
  return body;
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
    try {
      const res = await axiosInstance.get(USER_API.permissions(userId));
      return normalizeUserPermissionAssignment(res.data, true);
    } catch (error) {
      if (isApiUnavailable(error)) {
        return normalizeUserPermissionAssignment(null, false);
      }
      throw formatAxiosError(error);
    }
  },

  async updateUserPermissions(
    userId: string,
    dto: UpdateUserPermissionsDto,
  ): Promise<UserPermissionAssignment> {
    assertUserId(userId);
    try {
      const res = await axiosInstance.put(USER_API.permissions(userId), buildUpdateBody(dto));
      return normalizeUserPermissionAssignment(res.data ?? dto, true);
    } catch (error) {
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
      const res = await axiosInstance.put(ROLE_API.permissions(roleId), buildUpdateBody(dto));
      return normalizeUserPermissionAssignment(res.data ?? dto, true);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
