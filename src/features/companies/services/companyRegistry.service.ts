import { TENANT_API } from '@/features/tenants/api/tenant.api';
import { normalizeTenants } from '@/features/tenants/utils/normalizeTenant';
import type { Tenant } from '@/features/tenants/types/tenant.types';
import { ApiError, superAdminApiClient, type ApiEnvelope } from '@/lib/superAdminApiClient';
import {
  isDeletedCompany,
  listRememberedDeletedCompanies,
} from '../utils/deletedCompaniesRegistry';
import {
  filterCompaniesBySearch,
  filterCompaniesByStatus,
  paginateCompanies,
} from '../utils/filterCompanies';
import { deduplicateRegistryCompanies } from '../utils/deduplicateRegistryCompanies';
import type { Company, CompanyListParams } from '../types/company.types';

export interface RegistryCompany extends Company {
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
}

export interface CompanyRegistryResult {
  companies: RegistryCompany[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.results)) return record.results;
  if (Array.isArray(record.tenants)) return record.tenants;
  if (Array.isArray(record.companies)) return record.companies;
  return [];
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNestedCompany(raw: Record<string, unknown>): Record<string, unknown> | null {
  return (
    asRecord(raw.company) ||
    asRecord(raw.Company) ||
    asRecord(raw.default_company) ||
    asRecord(raw.defaultCompany) ||
    asRecord(raw.primary_company) ||
    asRecord(raw.primaryCompany) ||
    null
  );
}

/**
 * Platform Super Admin cannot call tenant ERP `/companies`.
 * Company profiles for the platform console come from `/tenants` only.
 */
export function companyFromTenant(tenant: Tenant): RegistryCompany | null {
  const raw = tenant as unknown as Record<string, unknown>;
  const nested = pickNestedCompany(raw);

  const name = pickString(
    nested?.name,
    nested?.company_name,
    tenant.company_name,
    tenant.display_name,
    tenant.name,
  );
  const code = pickString(nested?.code, nested?.company_code, tenant.company_code, tenant.code);
  if (!name && !code) return null;

  const deletedAt =
    pickString(nested?.deleted_at, nested?.deletedAt) ||
    (tenant.deleted_at ? tenant.deleted_at : null);

  const id =
    pickString(nested?.id, nested?.company_id, nested?.companyId) ||
    // Stable platform id when API only denormalizes company fields on the tenant.
    `tenant-company:${tenant.id}`;

  const company: RegistryCompany = {
    id,
    code: code || tenant.code || '—',
    name: name || code || '—',
    legal_name: pickString(
      nested?.legal_name,
      nested?.legalName,
      tenant.company_legal_name,
    ),
    registration_number: pickString(
      nested?.registration_number,
      nested?.registrationNumber,
      tenant.company_registration_number,
    ),
    vat_number: pickString(nested?.vat_number, nested?.vatNumber, tenant.vat_number),
    address: pickString(nested?.address, raw.address, tenant.address),
    city: pickString(nested?.city, raw.city, tenant.city),
    country_code: pickString(nested?.country_code, nested?.countryCode, tenant.country_code) || 'AE',
    phone: pickString(nested?.phone, raw.phone, tenant.phone),
    email: pickString(nested?.email, raw.email, tenant.email),
    is_default: nested?.is_default === true || nested?.isDefault === true || true,
    is_active: deletedAt ? false : tenant.is_active !== false,
    deleted_at: deletedAt,
    created_at: pickString(nested?.created_at, nested?.createdAt, tenant.created_at),
    updated_at: pickString(nested?.updated_at, nested?.updatedAt, tenant.updated_at),
    tenant_id: tenant.id,
    tenant_name: tenant.display_name || tenant.name,
    tenant_code: tenant.code,
  };

  if (isDeletedCompany(company)) return null;
  return company;
}

async function fetchTenants(): Promise<Tenant[]> {
  // GET /tenants only accepts optional `search` (Swagger) — no limit/page query.
  const res = await superAdminApiClient.get<ApiEnvelope<unknown>>(TENANT_API.list);
  return normalizeTenants(unwrapList(res.data?.data ?? res.data));
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message.trim()) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

/** Build the Super Admin company registry from GET /tenants only. */
export const companyRegistryService = {
  async list(params: CompanyListParams = {}): Promise<CompanyRegistryResult> {
    if (params.status === 'deleted') {
      let companies = listRememberedDeletedCompanies() as unknown as RegistryCompany[];
      if (params.tenantId) {
        companies = companies.filter((company) => company.tenant_id === params.tenantId);
      }
      companies = filterCompaniesBySearch(companies, params.search);
      companies.sort((a, b) => a.name.localeCompare(b.name));
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const { items, meta } = paginateCompanies(companies, page, limit);
      return { companies: items, meta };
    }

    let tenants: Tenant[];
    try {
      tenants = await fetchTenants();
    } catch (error) {
      throw new Error(
        errorMessage(
          error,
          'Could not load tenants. Platform admin must use /tenants for company profiles.',
        ),
      );
    }

    if (params.tenantId) {
      tenants = tenants.filter((tenant) => tenant.id === params.tenantId);
    }

    let companies = deduplicateRegistryCompanies(
      tenants
        .map((tenant) => companyFromTenant(tenant))
        .filter((company): company is RegistryCompany => Boolean(company)),
    );

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

  async getById(tenantId: string, companyId: string): Promise<RegistryCompany> {
    const { companies } = await this.list({ tenantId, limit: 200 });
    const match = companies.find(
      (company) =>
        company.id === companyId ||
        company.tenant_id === companyId ||
        company.id === `tenant-company:${tenantId}`,
    );
    if (!match) {
      throw new Error(
        'Company profile not found on this tenant. Platform admin reads companies from /tenants only.',
      );
    }
    return match;
  },
};
