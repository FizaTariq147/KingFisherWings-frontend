import { jobService } from '../services/job.service';
import type { CreateJobChargeDto, Job } from '../types/job.types';
import type { JobWizardCostingPayload } from '../types/jobWizardCosting.types';

/**
 * After POST /jobs header create: POST each draft charge via /jobs/:id/charges.
 * Failures are collected so the job still navigates.
 */
export async function persistJobWizardCosting(
  jobId: string,
  costing: JobWizardCostingPayload | undefined,
): Promise<{ job: Job; warnings: string[] }> {
  const warnings: string[] = [];
  let job = await jobService.getById(jobId);

  if (!costing?.charges.length) return { job, warnings };

  for (const [index, charge] of costing.charges.entries()) {
    try {
      const dto: CreateJobChargeDto = {
        charge_code_id: charge.charge_code_id,
        description: charge.description,
        unit_price: charge.unit_price,
        currency_code: charge.currency_code,
        ...(charge.quantity != null ? { quantity: charge.quantity } : {}),
        ...(charge.exchange_rate != null ? { exchange_rate: charge.exchange_rate } : {}),
        ...(charge.tax_rate_id ? { tax_rate_id: charge.tax_rate_id } : {}),
        ...(charge.is_cost != null ? { is_cost: charge.is_cost } : {}),
        ...(charge.is_provisional != null ? { is_provisional: charge.is_provisional } : {}),
        ...(charge.is_billable != null ? { is_billable: charge.is_billable } : {}),
        ...(charge.party_id ? { party_id: charge.party_id } : {}),
      };
      await jobService.createCharge(jobId, dto);
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `Charge ${index + 1}: ${err.message}`
          : `Charge ${index + 1} could not be saved.`,
      );
    }
  }

  try {
    job = await jobService.getById(jobId);
  } catch {
    // keep last known job
  }

  return { job, warnings };
}
