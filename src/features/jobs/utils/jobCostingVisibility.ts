import type { AuthUser } from '@/types/auth.types';
import {
  isOpsUnrestrictedRole,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';
import type { Job } from '../types/job.types';

export type JobCostingAudience = 'none' | 'sale' | 'cost' | 'both';

type CostingActor = Pick<
  AuthUser,
  'role' | 'unrestrictedOps' | 'canSeeSales' | 'canSeeCost' | 'permissions'
> | null | undefined;

function readFlag(
  actions: Record<string, unknown> | undefined,
  ...keys: string[]
): boolean | undefined {
  if (!actions) return undefined;
  for (const key of keys) {
    const v = actions[key];
    if (typeof v === 'boolean') return v;
  }
  return undefined;
}

function actorSeesBoth(user: CostingActor): boolean {
  if (!user) return false;
  if (user.unrestrictedOps) return true;
  const slug = resolveAuthRoleSlug(user.role);
  return isTenantUserManagerRole(slug) || isOpsUnrestrictedRole(slug);
}

/**
 * Resolve costing audience for the current actor on a job.
 * Prefer GET /jobs/:id/detail action flags; fall back to User can_see_sales / can_see_cost.
 */
export function resolveJobCostingAudience(
  job: Pick<Job, 'actions'> | null | undefined,
  user?: CostingActor,
): JobCostingAudience {
  const actions = job?.actions as Record<string, unknown> | undefined;

  const canViewCosting = readFlag(actions, 'can_view_costing', 'canViewCosting');
  if (canViewCosting === false) return 'none';

  const canViewSale = readFlag(actions, 'can_view_sale', 'canViewSale', 'can_see_sales');
  const canViewCost = readFlag(actions, 'can_view_cost', 'canViewCost', 'can_see_cost');

  if (canViewSale === true && canViewCost === true) return 'both';
  if (canViewSale === true && canViewCost === false) return 'sale';
  if (canViewSale === false && canViewCost === true) return 'cost';
  if (canViewSale === false && canViewCost === false) return 'none';

  // Explicit can_view_costing true with one side omitted → treat missing as allowed.
  if (canViewCosting === true) {
    if (canViewSale === false) return canViewCost === false ? 'none' : 'cost';
    if (canViewCost === false) return 'sale';
    return 'both';
  }

  if (actorSeesBoth(user)) return 'both';

  const seeSale = user?.canSeeSales === true;
  const seeCost = user?.canSeeCost === true;
  // When /auth/me omits both flags, keep legacy full costing (BE still enforces).
  if (user?.canSeeSales === undefined && user?.canSeeCost === undefined) {
    return 'both';
  }
  if (seeSale && seeCost) return 'both';
  if (seeSale) return 'sale';
  if (seeCost) return 'cost';
  return 'none';
}

export function canViewJobCostingTab(
  job: Pick<Job, 'actions' | 'tabs'> | null | undefined,
  user?: CostingActor,
): boolean {
  if (resolveJobCostingAudience(job, user) === 'none') return false;
  if (job?.actions?.can_view_costing === false) return false;
  return true;
}
