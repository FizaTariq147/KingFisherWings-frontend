import { isUuid } from '@/lib/isUuid';
import { ApiError, superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { COMPANY_API } from '../api/company.api';
import {
  isDeletedCompany,
  isRememberedDeletedCompany,
  listRememberedDeletedCompanies,
  rememberDeletedCompany,
} from '../utils/deletedCompaniesRegistry';
import { filterCompaniesByStatus } from '../utils/filterCompanies';
import { prepareCompanyPayload } from '../utils/prepareCompanyPayload';
import type {
  Company,
  CompanyListParams,
  CreateCompanyDto,
  PaginationMeta,
  UpdateCompanyDto,
} from '../types/company.types';

export type CompanyDeleteSnapshot = Company & {
  tenant_id?: string;
  tenant_name?: string;
  tenant_code?: string;
};

export interface CompanyListResult {
  companies: Company[];
  meta: PaginationMeta;
}

function tenantHeaders(tenantId: string) {
  return { headers: { 'X-Tenant-Id': tenantId } };
}

function assertTenantId(tenantId?: string): asserts tenantId is string {
  if (!tenantId) {
    throw new Error('Select a tenant workspace before managing companies.');
  }
  if (!isUuid(tenantId)) {
    throw new Error('Selected tenant is invalid. Choose a tenant from the list.');
  }
}

function assertCompanyId(id: string) {
  if (!isUuid(id)) {
    throw new Error('Invalid company id.');
  }
}

function normalizeCompany(raw: Record<string, unknown>): Company {
  const deletedAt =
    typeof raw.deleted_at === 'string' && raw.deleted_at
      ? raw.deleted_at
      : typeof raw.deletedAt === 'string' && raw.deletedAt
        ? raw.deletedAt
        : raw.is_deleted === true || raw.isDeleted === true
          ? new Date().toISOString()
          : null;

  return {
    ...(raw as unknown as Company),
    name: typeof raw.name === 'string' ? raw.name : '',
    code: typeof raw.code === 'string' ? raw.code : '',
    legal_name: (raw.legal_name as string) ?? (raw.legalName as string) ?? '',
    registration_number:
      (raw.registration_number as string) ?? (raw.registrationNumber as string) ?? '',
    vat_number: (raw.vat_number as string) ?? (raw.vatNumber as string) ?? '',
    is_default: Boolean(raw.is_default ?? raw.isDefault),
    is_active: deletedAt ? false : raw.is_active !== false && raw.isActive !== false,
    deleted_at: deletedAt,
  };
}

function normalizeCompanies(raw: unknown): Company[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeCompany(item as Record<string, unknown>));
}

function buildListQuery(params: CompanyListParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status === 'active') query.is_active = true;
  if (params.status === 'inactive') query.is_active = false;
  return query;
}

function defaultMeta(params: CompanyListParams, total: number): PaginationMeta {
  const limit = params.limit ?? 20;
  return {
    page: params.page ?? 1,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const companyService = {
  async list(params: CompanyListParams): Promise<CompanyListResult> {
    assertTenantId(params.tenantId);

    const res = await superAdminApiClient.get<ApiEnvelope<Company[], PaginationMeta>>(
      COMPANY_API.list,
      {
        ...tenantHeaders(params.tenantId),
        params: buildListQuery(params),
      },
    );

    let companies = normalizeCompanies(res.data?.data).filter(
      (company) => !isDeletedCompany(company) && !isRememberedDeletedCompany(company.id),
    );
    const apiMeta = res.data?.meta;

    if (params.status === 'deleted') {
      companies = listRememberedDeletedCompanies().filter(
        (company) => !params.tenantId || company.tenant_id === params.tenantId,
      ) as Company[];
    } else if (params.status) {
      companies = filterCompaniesByStatus(companies, params.status);
    }

    return {
      companies,
      meta: apiMeta ?? defaultMeta(params, companies.length),
    };
  },

  async getById(tenantId: string, id: string): Promise<Company> {
    assertTenantId(tenantId);
    assertCompanyId(id);

    const res = await superAdminApiClient.get<ApiEnvelope<Company>>(COMPANY_API.byId(id), {
      ...tenantHeaders(tenantId),
    });
    return normalizeCompany((res.data?.data ?? res.data) as Record<string, unknown>);
  },

  async create(tenantId: string, dto: CreateCompanyDto): Promise<Company> {
    assertTenantId(tenantId);

    const res = await superAdminApiClient.post<ApiEnvelope<Company>>(
      COMPANY_API.list,
      prepareCompanyPayload(dto),
      tenantHeaders(tenantId),
    );
    return normalizeCompany((res.data?.data ?? res.data) as Record<string, unknown>);
  },

  async update(tenantId: string, id: string, dto: UpdateCompanyDto): Promise<Company> {
    assertTenantId(tenantId);
    assertCompanyId(id);

    const res = await superAdminApiClient.patch<ApiEnvelope<Company>>(
      COMPANY_API.byId(id),
      prepareCompanyPayload(dto),
      tenantHeaders(tenantId),
    );
    return normalizeCompany((res.data?.data ?? res.data) as Record<string, unknown>);
  },

  /** DELETE /companies/{id} — Soft-delete (blocked if only company or currently default). Returns 204. */
  async softDelete(
    tenantId: string,
    id: string,
    snapshot?: CompanyDeleteSnapshot,
  ): Promise<void> {
    assertTenantId(tenantId);
    assertCompanyId(id);

    if (snapshot?.is_default) {
      throw new ApiError(
        'Cannot delete the default company. Set another company as default first.',
        400,
      );
    }

    try {
      await superAdminApiClient.delete(COMPANY_API.byId(id), {
        ...tenantHeaders(tenantId),
        validateStatus: (status) => status === 204 || (status >= 200 && status < 300),
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to delete company.';
      throw error instanceof Error ? error : new Error(message);
    }

    if (snapshot) {
      rememberDeletedCompany({
        ...snapshot,
        id,
        tenant_id: snapshot.tenant_id || tenantId,
        tenant_name: snapshot.tenant_name || '',
        tenant_code: snapshot.tenant_code || '',
        deleted_at: snapshot.deleted_at || new Date().toISOString(),
        is_active: false,
      });
    }
  },
};
