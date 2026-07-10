import { isUuid } from '@/lib/isUuid';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { USER_API } from '../api/user.api';
import { normalizeUser, normalizeUsers } from '../utils/normalizeUser';
import { prepareUserPayload } from '../utils/prepareUserPayload';
import type {
  AdminResetPasswordResult,
  CreateUserDto,
  CreateUserResult,
  PaginationMeta,
  UpdateUserDto,
  UpdateUserStatusDto,
  User,
  UserListParams,
  UserListResult,
} from '../types/user.types';

/** Shared envelope used by Nest API responses. */
interface ApiEnvelope<T, M = undefined> {
  data: T;
  meta?: M;
  message?: string;
  success?: boolean;
}

/**
 * Tenant for user ops must come from the authenticated session (JWT / store).
 * Never trust a client-supplied tenant id for create/list scoping.
 * Returns '' when the JWT is tenant-scoped but has no explicit tenant UUID
 * (API still scopes by Bearer token; CreateUserDto.tenant_id is ignored then).
 */
function tryResolveSessionTenantId(): string {
  const state = useAuthStore.getState();
  return resolveSessionTenantIdFromAuth({
    accessToken: state.accessToken,
    user: state.user,
  });
}

function resolveSessionTenantId(): string {
  const tenantId = tryResolveSessionTenantId();
  if (tenantId) return tenantId;
  const state = useAuthStore.getState();
  if (state.accessToken) {
    // Authenticated tenant-scoped session — caller may omit tenant_id.
    return '';
  }
  throw new Error('Your session is missing tenant context. Sign in again as a Tenant Admin.');
}

function assertSameTenant(explicit: string | undefined, sessionTenantId: string) {
  if (!sessionTenantId) return;
  if (explicit && isUuid(explicit) && explicit !== sessionTenantId) {
    throw new Error('Users can only be managed within your own tenant.');
  }
}

function assertUserId(id?: string): asserts id is string {
  if (!id || !isUuid(id)) {
    throw new Error('Invalid user id.');
  }
}

function defaultMeta(params: UserListParams, total: number): PaginationMeta {
  const limit = params.limit ?? 20;
  return {
    page: params.page ?? 1,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function buildListQuery(params: UserListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };

  if (params.search?.trim()) query.search = params.search.trim();
  if (params.role) query.role = params.role;
  if (params.status) query.status = params.status;
  if (params.branch_id) query.branch_id = params.branch_id;
  if (params.department_id) query.department_id = params.department_id;
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.order) query.order = params.order;

  return query;
}

function extractUserPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const record = data as Record<string, unknown>;
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as Record<string, unknown>;
  }
  return record;
}

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
  return new Error(axiosErr.message || 'Request failed');
}

/**
 * Tenant Admin user service — uses ERP `axiosInstance`.
 * All users are created/listed for the authenticated tenant only.
 */
export const userService = {
  async list(params: UserListParams): Promise<UserListResult> {
    const tenantId = resolveSessionTenantId();
    assertSameTenant(params.tenantId, tenantId);

    try {
      const res = await axiosInstance.get<ApiEnvelope<User[], PaginationMeta>>(USER_API.list, {
        params: buildListQuery(params),
      });

      const users = normalizeUsers(res.data?.data).filter(
        (user) => !tenantId || !user.tenant_id || user.tenant_id === tenantId,
      );

      return {
        users,
        meta: res.data?.meta ?? defaultMeta(params, users.length),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(tenantId: string, id: string): Promise<User> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      const res = await axiosInstance.get<ApiEnvelope<User>>(USER_API.byId(id));
      const user = normalizeUser(extractUserPayload(res.data));
      if (sessionTenantId && user.tenant_id && user.tenant_id !== sessionTenantId) {
        throw new Error('User belongs to another tenant.');
      }
      return user;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateUserDto): Promise<CreateUserResult> {
    const tenantId = resolveSessionTenantId();
    assertSameTenant(dto.tenant_id, tenantId);
    // Bind to session tenant when known. For tenant-scoped JWTs, API ignores tenant_id.
    const body = prepareUserPayload({
      ...dto,
      ...(tenantId ? { tenant_id: tenantId } : { tenant_id: undefined }),
    });

    try {
      const res = await axiosInstance.post<ApiEnvelope<User> & { temporary_password?: string }>(
        USER_API.list,
        body,
      );

      const payload = res.data as ApiEnvelope<User> & {
        temporary_password?: string;
        data?: (User & { temporary_password?: string }) | User;
      };
      const userPayload = extractUserPayload(payload);
      const user = normalizeUser(userPayload);
      const nestedPassword =
        typeof userPayload.temporary_password === 'string'
          ? userPayload.temporary_password
          : undefined;

      return {
        user,
        temporary_password:
          typeof payload.temporary_password === 'string'
            ? payload.temporary_password
            : nestedPassword,
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(tenantId: string, id: string, dto: UpdateUserDto): Promise<User> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      const res = await axiosInstance.patch<ApiEnvelope<User>>(
        USER_API.byId(id),
        prepareUserPayload(dto as unknown as Record<string, unknown>),
      );
      return normalizeUser(extractUserPayload(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(tenantId: string, id: string): Promise<void> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      await axiosInstance.delete(USER_API.byId(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateUserStatusDto,
  ): Promise<User> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      const res = await axiosInstance.patch<ApiEnvelope<User>>(USER_API.status(id), dto);
      return normalizeUser(extractUserPayload(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async restore(tenantId: string, id: string): Promise<User> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      const res = await axiosInstance.patch<ApiEnvelope<User>>(USER_API.restore(id));
      return normalizeUser(extractUserPayload(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async adminResetPassword(tenantId: string, id: string): Promise<AdminResetPasswordResult> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      const res = await axiosInstance.post<ApiEnvelope<{ temporary_password?: string }>>(
        USER_API.adminResetPassword(id),
      );
      const payload = extractUserPayload(res.data);
      return {
        temporary_password:
          typeof payload.temporary_password === 'string' ? payload.temporary_password : '',
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async forceLogout(tenantId: string, id: string): Promise<void> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      await axiosInstance.post(USER_API.forceLogout(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
