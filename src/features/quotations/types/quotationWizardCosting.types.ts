import type { CreateQuotationLineFormValues } from '../../types/quotation.types';

/** Draft costing collected on the create wizard; persisted after POST /quotations. */
export interface QuotationWizardCostingPayload {
  /** Manual charge lines → POST /quotations/:id/lines */
  lines: CreateQuotationLineFormValues[];
  /** When true → POST /quotations/:id/apply-tariff after header create (before manual lines). */
  apply_tariff: boolean;
}
