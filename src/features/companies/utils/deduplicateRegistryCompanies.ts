import type { RegistryCompany } from '../services/companyRegistry.service';

/** Score how likely this tenant owns the company (higher = better match). */
function tenantOwnershipScore(company: RegistryCompany): number {
  const tenantName = company.tenant_name.toLowerCase();
  const companyName = company.name.toLowerCase();
  const tenantCode = company.tenant_code.toLowerCase();
  const companyCodePrefix = company.code.split('-')[0]?.toLowerCase() ?? '';

  if (tenantName === companyName) return 5;
  if (companyCodePrefix && tenantCode.startsWith(companyCodePrefix)) return 4;
  if (companyCodePrefix && tenantCode.includes(companyCodePrefix)) return 3;

  const companyFirstWord = companyName.split(/\s+/)[0] ?? '';
  if (companyFirstWord.length > 2 && tenantName.includes(companyFirstWord)) return 2;
  if (tenantName.split(/\s+/)[0] && companyName.includes(tenantName.split(/\s+/)[0]!)) return 2;

  return 1;
}

/**
 * Super-admin company list calls are tenant-scoped, but the API may return the same
 * companies for every X-Tenant-Id. Collapse duplicates by company id and keep the
 * row whose tenant best matches the company profile.
 */
export function deduplicateRegistryCompanies(companies: RegistryCompany[]): RegistryCompany[] {
  const byId = new Map<string, RegistryCompany>();

  for (const company of companies) {
    const existing = byId.get(company.id);
    if (!existing) {
      byId.set(company.id, company);
      continue;
    }

    if (tenantOwnershipScore(company) > tenantOwnershipScore(existing)) {
      byId.set(company.id, company);
    }
  }

  return Array.from(byId.values());
}
