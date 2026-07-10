/** Form-only id for a company profile saved before tenant provisioning */
export const PENDING_COMPANY_ID = 'pending' as const;

export type OnboardingStep = 'company' | 'tenant';

export const ONBOARDING_STEPS: { id: OnboardingStep; label: string; path: string }[] = [
  { id: 'company', label: 'Register company', path: '/superadmin/companies/new' },
  { id: 'tenant', label: 'Create tenant', path: '/superadmin/tenants/new' },
];

export const NO_COMPANY_BEFORE_TENANT_MESSAGE =
  'Please create a company before creating a tenant.';
