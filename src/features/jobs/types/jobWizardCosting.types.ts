import type { CreateJobChargeDto } from '../types/job.types';

/** Draft charges collected on create wizard; persisted after POST /jobs. */
export interface JobWizardCostingPayload {
  charges: CreateJobChargeDto[];
}
