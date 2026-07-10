import type { DraftCompany } from '@/features/platform/store/platformOnboardingStore';
import type { RegistryCompany } from '@/features/companies/services/companyRegistry.service';
import type { CreateTenantFormValues } from '../types/tenant.types';
import type { UseFormSetValue } from 'react-hook-form';

type CompanyProfile = RegistryCompany | DraftCompany;

/** Map a company profile into tenant create form fields */
export function applyCompanyToTenantForm(
  company: CompanyProfile,
  setValue: UseFormSetValue<CreateTenantFormValues>,
) {
  setValue('selected_company_id', company.id, { shouldValidate: true });
  setValue('name', company.name, { shouldValidate: true });
  setValue('display_name', company.name, { shouldValidate: true });
  setValue('company_code', company.code, { shouldValidate: true });
  setValue('company_name', company.name, { shouldValidate: true });
  setValue('company_legal_name', company.legal_name ?? '', { shouldValidate: true });
  setValue('company_registration_number', company.registration_number ?? '', { shouldValidate: true });
  setValue('address', company.address, { shouldValidate: true });
  setValue('city', company.city, { shouldValidate: true });
  setValue('phone', company.phone, { shouldValidate: true });
  setValue('country_code', company.country_code, { shouldValidate: true });
  setValue('vat_number', company.vat_number ?? '', { shouldValidate: true });

  if (!company.email) return;
  setValue('email', company.email, { shouldValidate: true });
}

export function companyOptionLabel(company: CompanyProfile): string {
  if ('tenant_name' in company && company.tenant_name) {
    const parts = [company.name, company.code, company.tenant_name].filter(Boolean);
    if (company.legal_name && company.legal_name !== company.name) {
      parts.push(company.legal_name);
    }
    return parts.join(' · ');
  }

  return `${company.name} · ${company.code} · Draft`;
}
