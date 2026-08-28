import type { CreateJobDto } from '@/features/jobs/types/job.types';
import { ensureJobBranchReady } from '@/features/jobs/utils/ensureJobBranchReady';
import { isUuid } from '@/lib/isUuid';
import { resolveSessionCompanyIdAsync } from '@/lib/resolveSessionCompanyId';
import type { Quotation } from '../types/quotation.types';

/** Map a WON quotation header to CreateJobDto for direct POST /jobs fallback. */
export async function quotationToCreateJobDto(quotation: Quotation): Promise<CreateJobDto> {
  const companyId =
    (quotation.company_id && isUuid(quotation.company_id)
      ? quotation.company_id
      : '') || (await resolveSessionCompanyIdAsync());

  let branchId =
    quotation.branch_id && isUuid(quotation.branch_id) ? quotation.branch_id : '';
  if (!branchId) {
    branchId = await ensureJobBranchReady(companyId || undefined);
  }

  return {
    job_type: quotation.job_type,
    shipper_id: quotation.customer_id,
    company_id: companyId,
    branch_id: branchId,
    department_id: quotation.department_id ?? '',
    salesperson_id: quotation.salesperson_id ?? '',
    ...(quotation.job_type === 'SERVICE_JOB'
      ? {}
      : {
          origin_port_id: quotation.origin_port_id ?? '',
          dest_port_id: quotation.dest_port_id ?? '',
          commodity: quotation.commodity ?? '',
          hs_code: quotation.hs_code ?? '',
          gross_weight: quotation.gross_weight,
          chargeable_weight: quotation.chargeable_weight,
          volume_cbm: quotation.volume_cbm,
          pieces: quotation.pieces,
          container_type_id: quotation.container_type_id ?? '',
          container_count: quotation.container_count,
          incoterms: quotation.incoterm ?? '',
          is_dg: quotation.is_dg ?? false,
          dg_class: quotation.dg_class ?? '',
        }),
    notes: quotation.internal_notes ?? '',
    customer_remarks: quotation.remarks ?? '',
  };
}
