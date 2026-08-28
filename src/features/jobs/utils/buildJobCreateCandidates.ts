import { isUuid } from '@/lib/isUuid';
import type { CreateJobDto } from '../types/job.types';
import {
  prepareBareJobCreatePayload,
  prepareJobPayload,
  prepareMinimalJobCreatePayload,
} from './prepareJobPayload';

function pushUnique(
  out: Record<string, unknown>[],
  body: Record<string, unknown>,
): void {
  if (!body.job_type || !body.shipper_id) return;
  const key = JSON.stringify(body);
  if (out.some((c) => JSON.stringify(c) === key)) return;
  out.push(body);
}

/**
 * Ordered POST /jobs bodies.
 * branchId should already be resolved via ensureJobBranchReady before calling this.
 */
export async function buildJobCreateCandidatesAsync(
  dto: CreateJobDto,
  companyId?: string,
  branchId?: string,
): Promise<Record<string, unknown>[]> {
  const resolvedBranch =
    branchId ??
    (typeof dto.branch_id === 'string' && isUuid(dto.branch_id) ? dto.branch_id : undefined);

  const prepared = prepareJobPayload(dto);
  const minimal = prepareMinimalJobCreatePayload(dto);
  const bare = prepareBareJobCreatePayload(dto);

  const jobType = String(bare.job_type ?? prepared.job_type ?? '');
  const shipperId = String(bare.shipper_id ?? prepared.shipper_id ?? '');

  const candidates: Record<string, unknown>[] = [];

  if (jobType && shipperId && resolvedBranch) {
    pushUnique(candidates, {
      job_type: jobType,
      shipper_id: shipperId,
      branch_id: resolvedBranch,
      ...(companyId ? { company_id: companyId } : {}),
    });

    const minimalWithBranch = prepareMinimalJobCreatePayload(dto);
    pushUnique(candidates, {
      ...minimalWithBranch,
      branch_id: resolvedBranch,
      ...(companyId && !minimalWithBranch.company_id ? { company_id: companyId } : {}),
    });

    if (companyId) {
      pushUnique(candidates, {
        job_type: jobType,
        shipper_id: shipperId,
        company_id: companyId,
        branch_id: resolvedBranch,
        billing_party_id: shipperId,
      });
    }

    const preparedWithBranch = prepareJobPayload(dto);
    pushUnique(candidates, {
      ...preparedWithBranch,
      branch_id: resolvedBranch,
      ...(companyId && !preparedWithBranch.company_id ? { company_id: companyId } : {}),
    });
  } else if (jobType && shipperId) {
    pushUnique(candidates, bare);

    if (companyId) {
      pushUnique(candidates, {
        job_type: jobType,
        shipper_id: shipperId,
        company_id: companyId,
      });
    }

    pushUnique(candidates, {
      job_type: jobType,
      shipper_id: shipperId,
      billing_party_id: shipperId,
    });

    if (companyId) {
      pushUnique(candidates, {
        job_type: jobType,
        shipper_id: shipperId,
        company_id: companyId,
        billing_party_id: shipperId,
      });
    }

    pushUnique(candidates, minimal);
    pushUnique(candidates, prepared);
    if (companyId) {
      pushUnique(candidates, { ...prepared, company_id: companyId });
    }
  }

  return candidates;
}

export function summarizeJobCreateCandidates(
  candidates: Record<string, unknown>[],
  limit = 6,
): string {
  const slice = candidates.slice(0, limit);
  if (!slice.length) return 'no payloads generated';
  return slice
    .map((body, i) => `${i + 1}. ${JSON.stringify(body)}`)
    .join(' | ');
}

/** Axios config used for POST /jobs (matches tariff create — avoids cookie-related 500s). */
export const JOB_POST_AXIOS_CONFIG = {
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
} as const;
