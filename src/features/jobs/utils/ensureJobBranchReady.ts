import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { masterService } from '@/features/masters/services/master.service';

export async function fetchFirstBranchId(companyId?: string): Promise<string | undefined> {
  for (const activeOnly of [true, false]) {
    try {
      const result = await masterService.list(MASTER_PATHS.branches, {
        page: 1,
        limit: 100,
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

/**
 * Resolve an existing branch id required for job create / quotation convert.
 * Never auto-creates seeded branch rows (Dubai / example.com) — Masters must supply one.
 */
export async function ensureJobBranchReady(companyId?: string): Promise<string> {
  const existing = await fetchFirstBranchId(companyId);
  if (existing) return existing;

  throw new Error(
    companyId && isUuid(companyId)
      ? 'No branch is configured for this company (required for job create). Go to Masters → Branches and create a branch, then retry.'
      : 'Job create requires a company and branch. Edit the quotation, select Company, ensure Masters → Branches has at least one branch, then retry convert.',
  );
}

/** Best-effort branch for quotation forms — never throws. */
export async function resolveOptionalBranchId(companyId?: string): Promise<string | undefined> {
  return fetchFirstBranchId(companyId);
}
