export const INVOICE_CREATE_WIZARD_STEPS = [
  { key: 'source', label: 'Department' },
  { key: 'info', label: 'Invoice Info' },
  { key: 'notes', label: 'Notes' },
  { key: 'lines', label: 'Charge Lines' },
  { key: 'summary', label: 'Summary' },
] as const;

export type InvoiceCreateWizardStepKey = (typeof INVOICE_CREATE_WIZARD_STEPS)[number]['key'];

export const INVOICE_CREATE_MODES = ['MANUAL', 'FROM_JOB'] as const;
export type InvoiceCreateMode = (typeof INVOICE_CREATE_MODES)[number];

export const INVOICE_CREATE_MODE_LABELS: Record<InvoiceCreateMode, string> = {
  MANUAL: 'Manual Invoice',
  FROM_JOB: 'Create from Job',
};
