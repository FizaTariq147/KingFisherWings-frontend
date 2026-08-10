import { isUuid } from '@/lib/isUuid';
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '../api/tenant.api';
import {
  forgetDeletedTenant,
  isDeletedTenant,
  isRememberedDeletedTenant,
  listRememberedDeletedTenants,
  rememberDeletedTenant,
} from '../utils/deletedTenantsRegistry';
import { enrichTenantListMetrics } from '../utils/enrichTenantListMetrics';
import { filterTenantsByStatus, paginateTenants } from '../utils/filterTenants';
import { normalizeTenant, normalizeTenants } from '../utils/normalizeTenant';
import {
  deriveTenantStatisticsFromList,
  normalizeTenantStatistics,
} from '../utils/normalizeTenantStatistics';
import { prepareTenantPayload } from '../utils/prepareTenantPayload';
import { sortTenants } from '../utils/sortTenants';
import type {
  CreateTenantDto,
  PaginationMeta,
  Tenant,
  TenantListParams,
  TenantStatistics,
  UpdateTenantDto,
} from '../types/tenant.types';

export interface TenantListResult {
  tenants: Tenant[];
  meta: PaginationMeta;
}

/** Swagger documents only `search` for GET /tenants — other list params are client-side. */
function buildListQueryParams(params: TenantListParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  return query;
}

function applyClientListParams(tenants: Tenant[], params: TenantListParams): TenantListResult {
  let filtered = tenants;

  if (params.status) {
    filtered = filterTenantsByStatus(filtered, params.status);
  }

  filtered = sortTenants(filtered, params.sortBy, params.order);

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const { items, meta } = paginateTenants(filtered, page, limit);

  return { tenants: items, meta };
}

export const tenantService = {
  /** POST /tenants */
  async create(dto: CreateTenantDto): Promise<Tenant> {
    const res = await superAdminApiClient.post<ApiEnvelope<Tenant>>(
      TENANT_API.list,
      prepareTenantPayload(dto, { mode: 'create' }),
    );
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /** GET /tenants — query: search (Swagger); status/page/sort applied client-side */
  async list(params: TenantListParams): Promise<TenantListResult> {
    // Soft-deleted tenants are omitted from GET /tenants — Deleted tab uses the local registry
    // filled when Super Admin soft-deletes a tenant (so Restore remains available).
    if (params.status === 'deleted') {
      let deleted = listRememberedDeletedTenants();
      const search = params.search?.trim().toLowerCase();
      if (search) {
        deleted = deleted.filter((tenant) => {
          const haystack = [
            tenant.code,
            tenant.name,
            tenant.display_name,
            tenant.slug,
            tenant.company_name,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(search);
        });
      }
      return applyClientListParams(deleted, { ...params, status: 'deleted' });
    }

    const res = await superAdminApiClient.get<ApiEnvelope<Tenant[], PaginationMeta>>(
      TENANT_API.list,
      { params: buildListQueryParams(params) },
    );

    const tenants = normalizeTenants(res.data.data).filter(
      (tenant) => !isDeletedTenant(tenant) && !isRememberedDeletedTenant(tenant.id),
    );
    const apiMeta = res.data.meta;

    // Server-side pagination when meta indicates more records than returned.
    const pageResult =
      apiMeta && apiMeta.total > tenants.length
        ? {
            tenants: sortTenants(tenants, params.sortBy, params.order),
            meta: apiMeta,
          }
        : applyClientListParams(tenants, params);

    // Fill Company Name + Total Users for the visible page when list payload omits them.
    return {
      ...pageResult,
      tenants: await enrichTenantListMetrics(pageResult.tenants),
    };
  },

  /** GET /tenants/statistics — Trial includes subscription_plan TRIAL tenants */
  async getStatistics(): Promise<TenantStatistics> {
    const [statsRes, listRes] = await Promise.all([
      superAdminApiClient.get<ApiEnvelope<TenantStatistics>>(TENANT_API.statistics),
      superAdminApiClient.get<ApiEnvelope<Tenant[]>>(TENANT_API.list),
    ]);

    const apiStats = normalizeTenantStatistics(statsRes.data?.data);
    const tenants = normalizeTenants(listRes.data?.data);

    return deriveTenantStatisticsFromList(tenants, apiStats);
  },

  /** GET /tenants/{id} */
  async getById(id: string): Promise<Tenant> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    try {
      const res = await superAdminApiClient.get<ApiEnvelope<Tenant>>(TENANT_API.byId(id));
      const tenant = normalizeTenant(res.data.data as unknown as Record<string, unknown>);
      const [enriched] = await enrichTenantListMetrics([tenant]);
      return enriched;
    } catch (error) {
      const remembered = listRememberedDeletedTenants().find((tenant) => tenant.id === id);
      if (remembered) return remembered;
      throw error;
    }
  },

  /** PATCH /tenants/{id} */
  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(
      TENANT_API.byId(id),
      prepareTenantPayload(dto, { mode: 'update' }),
    );
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /** DELETE /tenants/{id} — Soft delete tenant. */
  async softDelete(id: string, snapshot?: Tenant): Promise<void> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    await superAdminApiClient.delete<ApiEnvelope<null>>(TENANT_API.byId(id));
    if (snapshot) {
      rememberDeletedTenant({
        ...snapshot,
        id,
        deleted_at: snapshot.deleted_at || new Date().toISOString(),
      });
    }
  },

  /** PATCH /tenants/{id}/restore — Restore a soft-deleted tenant. */
  async restore(id: string): Promise<Tenant> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.restore(id));
    forgetDeletedTenant(id);
    const tenant = normalizeTenant((res.data?.data ?? { id }) as unknown as Record<string, unknown>);
    return {
      ...tenant,
      id: tenant.id || id,
      deleted_at: null,
    };
  },

  /** PATCH /tenants/{id}/activate */
  async activate(id: string): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.activate(id));
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /** PATCH /tenants/{id}/deactivate */
  async deactivate(id: string): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.deactivate(id));
    return normalizeTenant(res.data.data as unknown as Record<string, unknown>);
  },

  /**
   * POST /tenants/{id}/sync-permissions
   * Reconcile one tenant against the current permission/role catalog
   * (needed after new GL modules add permissions like gl.manage_coa).
   */
  async syncPermissions(id: string): Promise<unknown> {
    const res = await superAdminApiClient.post(TENANT_API.syncPermissions(id));
    return res.data;
  },

  /** POST /tenants/sync-permissions — all tenants. */
  async syncPermissionsAll(): Promise<unknown> {
    const res = await superAdminApiClient.post(TENANT_API.syncPermissionsAll);
    return res.data;
  },
};

