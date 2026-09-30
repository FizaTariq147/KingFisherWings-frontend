import type { CreateJobDto } from '@/features/jobs/types/job.types';
import { canonicalizeJobType } from '@/features/jobs/utils/canonicalizeJobType';
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

  const jobType = canonicalizeJobType(quotation.job_type, 'AIR_EXPORT');
  const isRoadLand = jobType === 'ROAD_FREIGHT' || jobType === 'LAND';
  const isCourier = jobType === 'COURIER';
  const remarks = String(quotation.remarks ?? '').trim();
  const originPort =
    quotation.origin_port_id && isUuid(quotation.origin_port_id)
      ? quotation.origin_port_id
      : undefined;
  const destPort =
    quotation.dest_port_id && isUuid(quotation.dest_port_id)
      ? quotation.dest_port_id
      : undefined;

  return {
    job_type: jobType,
    shipper_id: quotation.customer_id,
    company_id: companyId,
    branch_id: branchId,
    ...(quotation.department_id && isUuid(quotation.department_id)
      ? { department_id: quotation.department_id }
      : {}),
    ...(quotation.salesperson_id && isUuid(quotation.salesperson_id)
      ? { salesperson_id: quotation.salesperson_id }
      : {}),
    billing_party_id: quotation.customer_id || undefined,
    ...(jobType === 'SERVICE_JOB'
      ? {}
      : {
          ...(originPort ? { origin_port_id: originPort } : {}),
          ...(destPort ? { dest_port_id: destPort } : {}),
          commodity: quotation.commodity || undefined,
          hs_code: quotation.hs_code || undefined,
          gross_weight: quotation.gross_weight,
          chargeable_weight: quotation.chargeable_weight,
          volume_cbm: quotation.volume_cbm,
          pieces: quotation.pieces,
          ...(isRoadLand || isCourier
            ? {
                // CreateJobDto door/scope fields (OpenAPI) — ports optional for road/land.
                service_scope: 'DOOR_TO_DOOR' as const,
              }
            : {
                ...(quotation.container_type_id && isUuid(quotation.container_type_id)
                  ? { container_type_id: quotation.container_type_id }
                  : {}),
                container_count: quotation.container_count,
              }),
          incoterms: quotation.incoterm || undefined,
          is_dg: quotation.is_dg ?? false,
          dg_class: quotation.dg_class || undefined,
        }),
    notes: quotation.internal_notes || undefined,
    customer_remarks: remarks || undefined,
  };
}
