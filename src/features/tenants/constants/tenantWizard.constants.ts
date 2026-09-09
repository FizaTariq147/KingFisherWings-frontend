export const TENANT_CREATE_WIZARD_STEPS = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'admin', label: 'Admin' },
  { key: 'company', label: 'Company' },
  { key: 'subscription', label: 'Subscription' },
] as const;

export type TenantWizardStepKey = (typeof TENANT_CREATE_WIZARD_STEPS)[number]['key'];
