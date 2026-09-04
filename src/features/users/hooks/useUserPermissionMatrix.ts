import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { userKeys } from './useUsers';
import { userPermissionMatrixService } from '../services/userPermissionMatrix.service';
import type {
  UpdatePermissionMatrixDto,
  UpdateUserPermissionsDto,
} from '../types/userPermissionMatrix.types';

export const userPermissionKeys = {
  matrix: [...userKeys.all, 'permission-matrix'] as const,
  user: (userId: string) => [...userKeys.all, 'permissions', userId] as const,
  roles: [...userKeys.all, 'roles'] as const,
};

export function usePermissionMatrix() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: userPermissionKeys.matrix,
    queryFn: () => userPermissionMatrixService.getPermissionMatrix(),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useUserPermissions(userId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: userPermissionKeys.user(userId),
    queryFn: () => userPermissionMatrixService.getUserPermissions(userId),
    enabled: Boolean(accessToken) && isUuid(userId),
  });
}

export function useUpdateUserPermissions(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePermissionMatrixDto | UpdateUserPermissionsDto) =>
      userPermissionMatrixService.updateUserPermissions(userId, dto),
    onSuccess: (data) => {
      queryClient.setQueryData(userPermissionKeys.user(userId), data);
      void queryClient.invalidateQueries({ queryKey: userKeys.detail('session', userId) });
    },
  });
}

export function useRoles() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: userPermissionKeys.roles,
    queryFn: () => userPermissionMatrixService.listRoles(),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, dto }: { roleId: string; dto: UpdateUserPermissionsDto }) =>
      userPermissionMatrixService.updateRolePermissions(roleId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userPermissionKeys.roles });
    },
  });
}
