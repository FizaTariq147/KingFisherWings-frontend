import { isUuid } from '@/lib/isUuid';
import { ApiError, superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '@/features/tenants/api/tenant.api';
import { normalizeTenant } from '@/features/tenants/utils/normalizeTenant';
import {
  companyFromTenant,
  companyRegistryService,
  type RegistryCompany,
} from './companyRegistry.service';
import { listRememberedDeletedCompanies } from '../utils/deletedCompaniesRegistry';
import { filterCompaniesByStatus } from '../utils/filterCompanies';
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

export const PLATFORM_COMPANY_ERP_MESSAGE =
  'Platform admin tokens cannot access tenant ERP /companies APIs. Use /tenants for platform company operations (or sign in as Tenant Admin for ERP company CRUD).';

function assertTenantId(tenantId?: string): asserts tenantId is string {
  if (!tenantId) {
    throw new Error('Select a tenant workspace before managing companies.');
  }
  if (!isUuid(tenantId)) {
    throw new Error('Selected tenant is invalid. Choose a tenant from the list.');
  }
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

function toCompany(registry: RegistryCompany): Company {
  const { tenant_id: _tenantId, tenant_name: _tenantName, tenant_code: _tenantCode, ...company } =
    registry;
  return company;
}

/**
 * Super Admin company module — backed by /tenants only.
 * Never call tenant ERP /companies with a platform token.
 */
export const companyService = {
  async list(params: CompanyListParams): Promise<CompanyListResult> {
    assertTenantId(params.tenantId);

    if (params.status === 'deleted') {
      const companies = listRememberedDeletedCompanies().filter(
        (company) => company.tenant_id === params.tenantId,
      ) as Company[];
      return { companies, meta: defaultMeta(params, companies.length) };
    }

    const result = await companyRegistryService.list(params);
    let companies = result.companies.map(toCompany);
    if (params.status) {
      companies = filterCompaniesByStatus(companies, params.status);
    }
    return { companies, meta: result.meta };
  },

  async getById(tenantId: string, id: string): Promise<Company> {
    assertTenantId(tenantId);
    const company = await companyRegistryService.getById(tenantId, id);
    return toCompany(company);
  },

  async create(_tenantId: string, _dto: CreateCompanyDto): Promise<Company> {
    throw new ApiError(
      `${PLATFORM_COMPANY_ERP_MESSAGE} To register a company profile, create or update a tenant with company fields.`,
      403,
    );
  },

  async update(tenantId: string, id: string, dto: UpdateCompanyDto): Promise<Company> {
    assertTenantId(tenantId);

    const payload: Record<string, unknown> = {};
    if (dto.name != null) {
      payload.company_name = dto.name;
      payload.name = dto.name;
      payload.display_name = dto.name;
    }
    if (dto.legal_name != null) payload.company_legal_name = dto.legal_name;
    if (dto.registration_number != null) {
      payload.company_registration_number = dto.registration_number;
    }
    if (dto.vat_number != null) payload.vat_number = dto.vat_number;
    if (dto.address != null) payload.address = dto.address;
    if (dto.city != null) payload.city = dto.city;
    if (dto.country_code != null) payload.country_code = dto.country_code;
    if (dto.phone != null) payload.phone = dto.phone;
    if (dto.email != null) payload.email = dto.email;
    if (dto.is_active != null) payload.is_active = dto.is_active;

    const res = await superAdminApiClient.patch<ApiEnvelope<unknown>>(
      TENANT_API.byId(tenantId),
      payload,
    );
    const tenant = normalizeTenant(
      (res.data?.data ?? res.data ?? { id: tenantId }) as Record<string, unknown>,
    );
    const company = companyFromTenant({ ...tenant, id: tenant.id || tenantId });
    if (!company) {
      throw new Error('Tenant updated but no company profile was returned.');
    }
    if (id.startsWith('tenant-company:')) {
      return toCompany({ ...company, id });
    }
    return toCompany(company);
  },

  async softDelete(_tenantId: string, _id: string, _snapshot?: CompanyDeleteSnapshot): Promise<void> {
    throw new ApiError(
      `${PLATFORM_COMPANY_ERP_MESSAGE} Soft-delete a company from ERP as Tenant Admin, or deactivate the tenant from /tenants.`,
      403,
    );
  },
};
