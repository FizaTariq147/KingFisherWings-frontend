import { isUuid } from '@/lib/isUuid';
import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { COMPANY_API } from '../api/company.api';
import { filterCompaniesByStatus } from '../utils/filterCompanies';
import { prepareCompanyPayload } from '../utils/prepareCompanyPayload';
import type {
  Company,
  CompanyListParams,
  CreateCompanyDto,
  PaginationMeta,
  UpdateCompanyDto,
} from '../types/company.types';

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
  return {
    ...(raw as unknown as Company),
    legal_name: (raw.legal_name as string) ?? '',
    registration_number: (raw.registration_number as string) ?? '',
    vat_number: (raw.vat_number as string) ?? '',
    is_default: Boolean(raw.is_default),
    is_active: raw.is_active !== false,
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

    let companies = normalizeCompanies(res.data?.data);
    const apiMeta = res.data?.meta;

    if (params.status === 'deleted') {
      companies = filterCompaniesByStatus(companies, 'deleted');
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

  async softDelete(tenantId: string, id: string): Promise<void> {
    assertTenantId(tenantId);
    assertCompanyId(id);

    await superAdminApiClient.delete<ApiEnvelope<null>>(COMPANY_API.byId(id), {
      ...tenantHeaders(tenantId),
    });
  },
};
