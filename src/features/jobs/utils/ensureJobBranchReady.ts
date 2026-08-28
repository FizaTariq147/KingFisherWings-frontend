import { axiosInstance } from '@/lib/axios';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { masterService } from '@/features/masters/services/master.service';
import {
  normalizeMasterRecord,
} from '@/features/masters/utils/normalizeMasterRecord';
import { prepareMasterPayload } from '@/features/masters/utils/prepareMasterPayload';
import { unwrapEntity } from '@/features/jobs/utils/normalizeJob';
import { JOB_POST_AXIOS_CONFIG } from './buildJobCreateCandidates';

const BRANCH_POST_CONFIG = JOB_POST_AXIOS_CONFIG;

export async function fetchFirstBranchId(companyId?: string): Promise<string | undefined> {
  for (const activeOnly of [true, false]) {
    try {
      const result = await masterService.list(MASTER_PATHS.branches, {
        page: 1,
        limit: 200,
        order: 'asc',
        ...(activeOnly ? { is_active: true } : {}),
      });
      for (const row of result.items) {
        const id = String(row.id ?? '');
        if (!isUuid(id)) continue;
        if (companyId && isUuid(companyId)) {
          const rowCompany = String(row.company_id ?? row.companyId ?? '');
          if (rowCompany && rowCompany !== companyId) continue;
        }
        return id;
      }
    } catch {
      /* try without active filter */
    }
  }
  return undefined;
}

function branchCreateAttempts(companyId: string): Record<string, unknown>[] {
  const base = {
    city: 'Dubai',
    country_code: 'AE',
    phone: '+971501234567',
    email: 'headoffice@example.com',
    is_head_office: true,
    is_active: true,
  };

  return [
    { company_id: companyId, name: 'Head Office', code: 'HO', ...base },
    { company_id: companyId, name: 'Head Office', code: 'HQ', ...base },
    { company_id: companyId, name: 'Main Branch', code: 'MAIN', ...base },
    { company_id: companyId, name: 'Dubai Office', code: 'DXB', ...base },
    { name: 'Head Office', code: 'HO', city: 'Dubai', country_code: 'AE', is_active: true },
  ];
}

async function postBranch(body: Record<string, unknown>): Promise<string | undefined> {
  const res = await withGatewayRetry(() =>
    axiosInstance.post<unknown>(
      MASTER_PATHS.branches,
      prepareMasterPayload(body),
      BRANCH_POST_CONFIG,
    ),
  );
  const record = normalizeMasterRecord(unwrapEntity(res.data));
  const id = String(record?.id ?? '');
  return isUuid(id) ? id : undefined;
}

/**
 * Resolve or create a branch id required for job create / quotation convert.
 * Throws a clear error when branch setup fails (instead of opaque job 500).
 */
export async function ensureJobBranchReady(companyId?: string): Promise<string> {
  const existing = await fetchFirstBranchId(companyId);
  if (existing) return existing;

  if (!companyId || !isUuid(companyId)) {
    throw new Error(
      'Job create requires a company on the quotation. Edit the quotation, select Company, save, then retry convert.',
    );
  }

  let lastError = '';
  for (const body of branchCreateAttempts(companyId)) {
    try {
      const id = await postBranch(body);
      if (id) return id;
    } catch (error) {
      lastError = extractAxiosErrorDetail(error);
    }
  }

  const afterCreate = await fetchFirstBranchId(companyId);
  if (afterCreate) return afterCreate;

  throw new Error(
    `No branch is configured for this tenant (required for job create). ` +
      `Go to Masters → Branches and create Head Office, or fix branch create: ${lastError || 'unknown error'}.`,
  );
}

/** Best-effort branch for quotation forms — never throws. */
export async function resolveOptionalBranchId(companyId?: string): Promise<string | undefined> {
  try {
    return await ensureJobBranchReady(companyId);
  } catch {
    return fetchFirstBranchId(companyId);
  }
}
