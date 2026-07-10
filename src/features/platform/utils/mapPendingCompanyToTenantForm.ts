import type { DraftCompany } from '@/features/platform/store/platformOnboardingStore';
import type { CreateTenantFormValues } from '@/features/tenants/types/tenant.types';

/** Map a saved company profile into tenant create defaults */
export function mapDraftCompanyToTenantForm(
  company: DraftCompany,
): Partial<CreateTenantFormValues> {
  return {
    selected_company_id: company.id,
    name: company.name,
    display_name: company.name,
    company_code: company.code,
    company_name: company.name,
    company_legal_name: company.legal_name ?? '',
    company_registration_number: company.registration_number ?? '',
    address: company.address,
    city: company.city,
    phone: company.phone,
    country_code: company.country_code,
    vat_number: company.vat_number ?? '',
    email: company.email,
  };
}
