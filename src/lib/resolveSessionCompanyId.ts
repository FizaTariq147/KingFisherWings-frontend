import { isUuid } from '@/lib/isUuid';
import { companyIdFromAccessToken, resolveCompanyIdFromUserLike } from '@/lib/tenantFromAuth';
import { fetchTenantCompanyOptions } from '@/features/users/hooks/useTenantCompanies';
import { useAuthStore } from '@/store/authStore';

/** Resolve company UUID from form override, session JWT, or user profile. */
export function resolveSessionCompanyId(override?: string): string {
  const trimmed = override?.trim();
  if (trimmed && isUuid(trimmed)) return trimmed;

  const { accessToken, user } = useAuthStore.getState();
  const fromSession =
    user?.companyId?.trim() ||
    resolveCompanyIdFromUserLike(user) ||
    companyIdFromAccessToken(accessToken) ||
    '';
  return fromSession && isUuid(fromSession) ? fromSession : '';
}

/** Async company resolution — falls back to tenant /companies list when session has no id. */
export async function resolveSessionCompanyIdAsync(override?: string): Promise<string> {
  const direct = resolveSessionCompanyId(override);
  if (direct) return direct;

  try {
    const companies = await fetchTenantCompanyOptions();
    if (companies.length === 1) return companies[0]!.id;
    const sessionHint = resolveSessionCompanyId();
    const matched = companies.find((company) => company.id === sessionHint);
    if (matched) return matched.id;
    if (companies[0]?.id) return companies[0].id;
  } catch {
    /* optional */
  }
  return '';
}
