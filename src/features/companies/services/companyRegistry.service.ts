import { superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import { TENANT_API } from '@/features/tenants/api/tenant.api';
import { normalizeTenants } from '@/features/tenants/utils/normalizeTenant';
import type { Tenant } from '@/features/tenants/types/tenant.types';
import { COMPANY_API } from '../api/company.api';
import {
  filterCompaniesBySearch,
  filterCompaniesByStatus,
  paginateCompanies,
} from '../utils/filterCompanies';
import { deduplicateRegistryCompanies } from '../utils/deduplicateRegistryCompanies';
import type { Company, CompanyListParams, PaginationMeta } from '../types/company.types';

export interface RegistryCompany extends Company {
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
}

export interface CompanyRegistryResult {
  companies: RegistryCompany[];
  meta: PaginationMeta;
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

async function fetchTenants(): Promise<Tenant[]> {
  const res = await superAdminApiClient.get<ApiEnvelope<Tenant[]>>(TENANT_API.list, {
    params: { limit: 200 },
  });
  return normalizeTenants(res.data?.data);
}

/** Companies API is tenant-scoped — aggregate across all tenants for the platform registry. */
export const companyRegistryService = {
  async list(params: CompanyListParams = {}): Promise<CompanyRegistryResult> {
    const tenants = await fetchTenants();

    const results = await Promise.allSettled(
      tenants.map(async (tenant) => {
        const res = await superAdminApiClient.get<ApiEnvelope<Company[]>>(COMPANY_API.list, {
          headers: { 'X-Tenant-Id': tenant.id },
          params: { limit: 200 },
        });
        const companies = normalizeCompanies(res.data?.data);
        return companies.map<RegistryCompany>((company) => {
          const raw = company as Company & { tenant_id?: string };
          const resolvedTenantId =
            typeof raw.tenant_id === 'string' && raw.tenant_id ? raw.tenant_id : tenant.id;

          return {
            ...company,
            tenant_id: resolvedTenantId,
            tenant_name: tenant.display_name || tenant.name,
            tenant_code: tenant.code,
          };
        });
      }),
    );

    let companies = results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : [],
    );

    companies = deduplicateRegistryCompanies(companies);

    if (params.status) {
      companies = filterCompaniesByStatus(companies, params.status);
    }

    companies = filterCompaniesBySearch(companies, params.search);
    companies.sort((a, b) => a.name.localeCompare(b.name));

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const { items, meta } = paginateCompanies(companies, page, limit);

    return { companies: items, meta };
  },
};
