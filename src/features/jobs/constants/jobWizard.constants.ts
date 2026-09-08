export const JOB_CREATE_WIZARD_STEPS = [
  { key: 'department', label: 'Department' },
  { key: 'job_info', label: 'Job Info' },
  { key: 'consignment', label: 'Container / Consignment' },
  { key: 'costing', label: 'Costing' },
  { key: 'summary', label: 'Summary' },
] as const;

export type JobCreateWizardStepKey = (typeof JOB_CREATE_WIZARD_STEPS)[number]['key'];
