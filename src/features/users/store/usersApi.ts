import { superAdminApi } from '@/store/api/superAdminBaseApi';
import { serializeApiError } from '@/store/api/axiosBaseQuery';
import { USER_API_TAGS } from '../api/user.api';
import { userService } from '../services/user.service';
import type {
  CreateUserDto,
  CreateUserResult,
  UpdateUserDto,
  UpdateUserStatusDto,
  User,
  UserListParams,
  UserListResult,
} from '../types/user.types';

export const usersApi = superAdminApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserListResult, UserListParams>({
      async queryFn(params) {
        try {
          const data = await userService.list(params);
          return { data };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      providesTags: (result, _error, params) =>
        result
          ? [
              USER_API_TAGS.list(params.tenantId),
              ...result.users.map((user) => USER_API_TAGS.detail(user.id)),
            ]
          : [USER_API_TAGS.list(params.tenantId)],
      // Always refetch when tenant (or other args) change so we never show another workspace's users
      keepUnusedDataFor: 0,
    }),

    getUserById: builder.query<User, { tenantId: string; id: string }>({
      async queryFn({ tenantId, id }) {
        try {
          const data = await userService.getById(tenantId, id);
          return { data };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      providesTags: (_result, _error, { id }) => [USER_API_TAGS.detail(id)],
    }),

    createUser: builder.mutation<CreateUserResult, CreateUserDto>({
      async queryFn(dto) {
        try {
          const data = await userService.create(dto);
          return { data };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, dto) => [USER_API_TAGS.list(dto.tenant_id)],
    }),

    updateUser: builder.mutation<
      User,
      { tenantId: string; id: string; dto: UpdateUserDto }
    >({
      async queryFn({ tenantId, id, dto }) {
        try {
          const data = await userService.update(tenantId, id, dto);
          return { data };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, { tenantId, id }) => [
        USER_API_TAGS.list(tenantId),
        USER_API_TAGS.detail(id),
      ],
    }),

    deleteUser: builder.mutation<void, { tenantId: string; id: string }>({
      async queryFn({ tenantId, id }) {
        try {
          await userService.softDelete(tenantId, id);
          return { data: undefined };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, { tenantId, id }) => [
        USER_API_TAGS.list(tenantId),
        USER_API_TAGS.detail(id),
      ],
    }),

    updateUserStatus: builder.mutation<
      User,
      { tenantId: string; id: string; dto: UpdateUserStatusDto }
    >({
      async queryFn({ tenantId, id, dto }) {
        try {
          const data = await userService.updateStatus(tenantId, id, dto);
          return { data };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, { tenantId, id }) => [
        USER_API_TAGS.list(tenantId),
        USER_API_TAGS.detail(id),
      ],
    }),

    restoreUser: builder.mutation<User, { tenantId: string; id: string }>({
      async queryFn({ tenantId, id }) {
        try {
          const data = await userService.restore(tenantId, id);
          return { data };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, { tenantId, id }) => [
        USER_API_TAGS.list(tenantId),
        USER_API_TAGS.detail(id),
      ],
    }),

    adminResetUserPassword: builder.mutation<
      { temporary_password?: string },
      { tenantId: string; id: string }
    >({
      async queryFn({ tenantId, id }) {
        try {
          const data = await userService.adminResetPassword(tenantId, id);
          return { data };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [USER_API_TAGS.detail(id)],
    }),

    forceUserLogout: builder.mutation<void, { tenantId: string; id: string }>({
      async queryFn({ tenantId, id }) {
        try {
          await userService.forceLogout(tenantId, id);
          return { data: undefined };
        } catch (error) {
          return { error: serializeApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [USER_API_TAGS.detail(id)],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useRestoreUserMutation,
  useAdminResetUserPasswordMutation,
  useForceUserLogoutMutation,
} = usersApi;
