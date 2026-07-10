import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { userService } from '../services/user.service';
import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UserListParams,
} from '../types/user.types';

export const userKeys = {
  all: ['tenant', 'users'] as const,
  list: (params: UserListParams) => [...userKeys.all, 'list', params] as const,
  detail: (tenantId: string, id: string) => [...userKeys.all, 'detail', tenantId, id] as const,
};

export function useUsers(params: UserListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const storeUser = useAuthStore((s) => s.user);
  const resolvedTenantId =
    params.tenantId && isUuid(params.tenantId)
      ? params.tenantId
      : resolveSessionTenantIdFromAuth({ accessToken, user: storeUser });

  const queryParams: UserListParams = {
    ...params,
    tenantId: resolvedTenantId || params.tenantId,
  };

  return useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => userService.list(queryParams),
    // List is JWT-scoped; allow when authenticated even if tenant UUID is not in claims.
    enabled: Boolean(accessToken) || (!!resolvedTenantId && isUuid(resolvedTenantId)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUser(tenantId: string, id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: userKeys.detail(tenantId || 'session', id),
    queryFn: () => userService.getById(tenantId || 'session', id),
    enabled: isUuid(id) && (Boolean(accessToken) || isUuid(tenantId)),
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return (tenantId?: string, detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    if (tenantId && detailId) {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(tenantId, detailId) });
    }
  };
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => userService.create(dto),
    onSuccess: (result) => invalidate(result.user.tenant_id, result.user.id),
  });
}

export function useUpdateUser(tenantId: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateUserDto) => userService.update(tenantId, id, dto),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.detail(tenantId, id), user);
    },
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
      userService.softDelete(tenantId, id),
    onSuccess: (_data, { tenantId, id }) => invalidate(tenantId, id),
  });
}

export function useUpdateUserStatus() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({
      tenantId,
      id,
      dto,
    }: {
      tenantId: string;
      id: string;
      dto: UpdateUserStatusDto;
    }) => userService.updateStatus(tenantId, id, dto),
    onSuccess: (_data, { tenantId, id }) => invalidate(tenantId, id),
  });
}

export function useRestoreUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
      userService.restore(tenantId, id),
    onSuccess: (_data, { tenantId, id }) => invalidate(tenantId, id),
  });
}

export function useAdminResetUserPassword() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
      userService.adminResetPassword(tenantId, id),
    onSuccess: (_data, { tenantId, id }) => invalidate(tenantId, id),
  });
}

export function useForceUserLogout() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
      userService.forceLogout(tenantId, id),
    onSuccess: (_data, { tenantId, id }) => invalidate(tenantId, id),
  });
}
