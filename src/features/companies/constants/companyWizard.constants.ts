export const COMPANY_CREATE_WIZARD_STEPS = [
  { key: 'details', label: 'Company Details' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
] as const;

export type CompanyWizardStepKey = (typeof COMPANY_CREATE_WIZARD_STEPS)[number]['key'];
