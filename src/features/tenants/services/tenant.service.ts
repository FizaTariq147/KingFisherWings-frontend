import { isUuid } from '@/lib/isUuid';
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '../api/tenant.api';
import { filterTenantsByStatus, paginateTenants } from '../utils/filterTenants';
import { normalizeTenant, normalizeTenants } from '../utils/normalizeTenant';
import { normalizeTenantStatistics } from '../utils/normalizeTenantStatistics';
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
      prepareTenantPayload(dto),
    );
    return normalizeTenant(res.data.data as Record<string, unknown>);
  },

  /** GET /tenants — query: search (Swagger); status/page/sort applied client-side */
  async list(params: TenantListParams): Promise<TenantListResult> {
    const res = await superAdminApiClient.get<ApiEnvelope<Tenant[], PaginationMeta>>(
      TENANT_API.list,
      { params: buildListQueryParams(params) },
    );

    const tenants = normalizeTenants(res.data.data);
    const apiMeta = res.data.meta;

    // Server-side pagination when meta indicates more records than returned.
    if (apiMeta && apiMeta.total > tenants.length) {
      return {
        tenants: sortTenants(tenants, params.sortBy, params.order),
        meta: apiMeta,
      };
    }

    return applyClientListParams(tenants, params);
  },

  /** GET /tenants/statistics */
  async getStatistics(): Promise<TenantStatistics> {
    const res = await superAdminApiClient.get<ApiEnvelope<TenantStatistics>>(
      TENANT_API.statistics,
    );
    return normalizeTenantStatistics(res.data?.data);
  },

  /** GET /tenants/{id} */
  async getById(id: string): Promise<Tenant> {
    if (!isUuid(id)) {
      throw new Error('Invalid tenant id.');
    }
    const res = await superAdminApiClient.get<ApiEnvelope<Tenant>>(TENANT_API.byId(id));
    return normalizeTenant(res.data.data as Record<string, unknown>);
  },

  /** PATCH /tenants/{id} */
  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(
      TENANT_API.byId(id),
      prepareTenantPayload(dto),
    );
    return normalizeTenant(res.data.data as Record<string, unknown>);
  },

  /** DELETE /tenants/{id} */
  async softDelete(id: string): Promise<void> {
    await superAdminApiClient.delete<ApiEnvelope<null>>(TENANT_API.byId(id));
  },

  /** PATCH /tenants/{id}/restore */
  async restore(id: string): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.restore(id));
    return normalizeTenant(res.data.data as Record<string, unknown>);
  },

  /** PATCH /tenants/{id}/activate */
  async activate(id: string): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.activate(id));
    return normalizeTenant(res.data.data as Record<string, unknown>);
  },

  /** PATCH /tenants/{id}/deactivate */
  async deactivate(id: string): Promise<Tenant> {
    const res = await superAdminApiClient.patch<ApiEnvelope<Tenant>>(TENANT_API.deactivate(id));
    return normalizeTenant(res.data.data as Record<string, unknown>);
  },
};

