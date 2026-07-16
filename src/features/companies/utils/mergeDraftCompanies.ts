import type { DraftCompany } from '@/features/platform/store/platformOnboardingStore';
import type { RegistryCompany } from '../services/companyRegistry.service';
import type { CompanyListParams } from '../types/company.types';
import { filterCompaniesBySearch, filterCompaniesByStatus } from './filterCompanies';

export type CompanyListItem = RegistryCompany & { is_draft?: boolean };

function toDraftListItem(draft: DraftCompany): CompanyListItem {
  return {
    ...draft,
    is_draft: true,
    tenant_id: '',
    tenant_name: 'Not linked yet',
    tenant_code: '',
    is_default: draft.is_default ?? false,
    is_active: draft.is_active ?? true,
  };
}

export function mergeDraftCompaniesIntoList(
  registryCompanies: RegistryCompany[],
  draftCompanies: DraftCompany[],
  params: CompanyListParams = {},
): CompanyListItem[] {
  let drafts = draftCompanies.map(toDraftListItem);
  let registered = registryCompanies.map((company) => ({ ...company, is_draft: false }));

  if (params.status) {
    registered = filterCompaniesByStatus(registered, params.status);
    if (params.status === 'active') {
      drafts = drafts.filter((company) => company.is_active !== false);
    } else if (params.status === 'inactive') {
      drafts = [];
    } else if (params.status === 'deleted') {
      drafts = [];
    }
  }

  drafts = filterCompaniesBySearch(drafts, params.search);
  registered = filterCompaniesBySearch(registered, params.search);

  return [...drafts, ...registered].sort((a, b) => a.name.localeCompare(b.name));
}
