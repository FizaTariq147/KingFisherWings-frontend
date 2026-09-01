import { isUuid } from '@/lib/isUuid';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { USER_API } from '../api/user.api';
import {
  forgetDeletedUser,
  isDeletedUser,
  listRememberedDeletedUsers,
  rememberDeletedUser,
  resolveDeletedUsersTenantKey,
} from '../utils/deletedUsersRegistry';
import { normalizeUser, normalizeUsers } from '../utils/normalizeUser';
import { prepareUserPayload } from '../utils/prepareUserPayload';
import { pickTemporaryPassword } from '../utils/pickTemporaryPassword';
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
  if (params.branch_id) query.branch_id = params.branch_id;
  if (params.department_id) query.department_id = params.department_id;
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.order) query.order = params.order;

  const lifecycle = params.lifecycle ?? 'all';
  // Swagger only allows status enum values — never send include_deleted / with_deleted / deleted.
  if (lifecycle === 'active') {
    query.status = 'ACTIVE';
  } else if (lifecycle === 'inactive') {
    query.status = 'INACTIVE';
  } else if (lifecycle !== 'deleted' && params.status) {
    query.status = params.status;
  }

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

function summarizeUnknownKeys(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return String(raw);
  const top = Object.keys(raw as object).slice(0, 20).join(', ');
  const data = (raw as { data?: unknown }).data;
  if (data && typeof data === 'object') {
    return `${top} → data:[${Object.keys(data as object).slice(0, 20).join(', ')}]`;
  }
  return top || '(empty)';
}

/**
 * Tenant Admin user service — uses ERP `axiosInstance`.
 * All users are created/listed for the authenticated tenant only.
 */
export const userService = {
  async list(params: UserListParams): Promise<UserListResult> {
    const tenantId = resolveSessionTenantId();
    assertSameTenant(params.tenantId, tenantId);

    const lifecycle = params.lifecycle ?? 'all';
    const tenantKey = resolveDeletedUsersTenantKey(tenantId || params.tenantId);

    // Soft-deleted users are omitted from GET /users — Deleted tab uses the local registry
    // filled when Tenant Admin soft-deletes a user (so Restore remains available).
    if (lifecycle === 'deleted') {
      const users = listRememberedDeletedUsers(tenantKey);
      return { users, meta: defaultMeta(params, users.length) };
    }

    try {
      const res = await axiosInstance.get<ApiEnvelope<User[], PaginationMeta>>(USER_API.list, {
        params: buildListQuery(params),
      });

      let users = normalizeUsers(res.data?.data).filter(
        (user) => !tenantId || !user.tenant_id || user.tenant_id === tenantId,
      );

      users = users.filter((user) => !isDeletedUser(user));
      if (lifecycle === 'active') {
        users = users.filter((user) => user.status === 'ACTIVE');
      } else if (lifecycle === 'inactive') {
        users = users.filter((user) => user.status !== 'ACTIVE');
      }

      return {
        users,
        meta: res.data?.meta
          ? {
              ...res.data.meta,
              total: users.length,
              totalPages: Math.max(1, Math.ceil(users.length / (params.limit ?? 20))),
            }
          : defaultMeta(params, users.length),
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
    // CreateUserDto has no password — API generates a temporary password.
    const body = prepareUserPayload({
      ...dto,
      status: 'ACTIVE',
      ...(tenantId ? { tenant_id: tenantId } : { tenant_id: undefined }),
    });
    // Never send undocumented password fields (API ignores / may reject them).
    delete (body as Record<string, unknown>).password;

    try {
      const res = await axiosInstance.post<unknown>(USER_API.list, body);
      const userPayload = extractUserPayload(res.data);
      const user = normalizeUser(userPayload);

      let temporaryPassword = pickTemporaryPassword(res.data);

      // Always ensure we have the real API password for Staff / User login.
      if (user.id) {
        try {
          // Activate if create left user INVITED.
          if (user.status && user.status !== 'ACTIVE') {
            await this.updateStatus(tenantId || user.tenant_id || '', user.id, {
              status: 'ACTIVE',
              reason: 'Activate for staff login',
            });
          }
        } catch {
          // Non-fatal — login may still work if already ACTIVE.
        }

        // Prefer admin-reset so require_password_change is set (first login → set own password).
        try {
          const reset = await this.adminResetPassword(tenantId || user.tenant_id || '', user.id);
          if (reset.temporary_password) {
            temporaryPassword = reset.temporary_password;
          }
        } catch (resetErr) {
          if (!temporaryPassword) {
            throw new Error(
              `User was created, but no temporary password was returned. ` +
                `Open the user and click “Reset password”. ` +
                `(${resetErr instanceof Error ? resetErr.message : 'reset failed'})`,
            );
          }
        }
      }

      if (!temporaryPassword) {
        throw new Error(
          'User was created, but the API did not return a temporary password. Open the user and reset password.',
        );
      }

      return {
        user,
        temporary_password: temporaryPassword,
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
        prepareUserPayload(dto as unknown as Record<string, unknown>, {
          keepEmptyAllowlists: Array.isArray(dto.allowed_ips) || Array.isArray(dto.allowed_mac_addresses),
        }),
      );
      return normalizeUser(extractUserPayload(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(tenantId: string, id: string, snapshot?: User): Promise<void> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      await axiosInstance.delete(USER_API.byId(id));
      const tenantKey = resolveDeletedUsersTenantKey(sessionTenantId || tenantId);
      if (snapshot) {
        rememberDeletedUser(tenantKey, snapshot);
      } else {
        rememberDeletedUser(tenantKey, {
          id,
          tenant_id: sessionTenantId || tenantId || '',
          email: '',
          first_name: 'Deleted',
          last_name: 'User',
          role: 'READ_ONLY',
          status: 'INACTIVE',
          deleted_at: new Date().toISOString(),
          is_salesperson: false,
          is_cs_rep: false,
          is_operations: false,
          is_finance: false,
          can_see_sales: false,
          can_see_cost: false,
          can_see_gp: false,
          can_see_invoices: false,
          can_see_payments: false,
          can_see_bank_balances: false,
          can_see_ar_ap: false,
          can_see_mgmt_reports: false,
          can_see_job_pnl: false,
          allowed_ips: [],
          allowed_mac_addresses: [],
          max_concurrent_sessions: 3,
        });
      }
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

  /** POST /users/{id}/restore — Restore a soft-deleted user. */
  async restore(tenantId: string, id: string): Promise<User> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      const res = await axiosInstance.post<unknown>(USER_API.restore(id));
      const user = normalizeUser(extractUserPayload(res.data));
      forgetDeletedUser(resolveDeletedUsersTenantKey(sessionTenantId || tenantId), id);
      return {
        ...user,
        deleted_at: null,
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async adminResetPassword(tenantId: string, id: string): Promise<AdminResetPasswordResult> {
    const sessionTenantId = resolveSessionTenantId();
    assertSameTenant(tenantId, sessionTenantId);
    assertUserId(id);

    try {
      // AdminResetPasswordDto — require_password_change so staff must set their own password after first login.
      const res = await axiosInstance.post<unknown>(USER_API.adminResetPassword(id), {
        require_password_change: true,
        send_email: false,
      });
      const temporaryPassword = pickTemporaryPassword(res.data);
      if (!temporaryPassword && import.meta.env.DEV) {
        console.warn('[users] admin-reset-password response keys:', summarizeUnknownKeys(res.data));
      }
      return {
        temporary_password: temporaryPassword,
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
