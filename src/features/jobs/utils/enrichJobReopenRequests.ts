import { isUuid } from '@/lib/isUuid';
import { userService } from '@/features/users/services/user.service';
import { canListTenantUsers } from '@/features/users/utils/canListTenantUsers';
import { useAuthStore } from '@/store/authStore';
import type { JobReopenRequest } from '../types/job.types';

function userDisplayName(user: {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}): string {
  const full = user.full_name?.trim();
  if (full) return full;
  const combined = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  if (combined) return combined;
  return user.email?.trim() || '';
}

function needsName(value?: string | null): boolean {
  const raw = String(value ?? '').trim();
  return !raw || isUuid(raw);
}

/**
 * Fill requested_by_name / reviewed_by_name when the API only returns user UUIDs.
 * Best-effort — Tenant Admin inbox can GET /users/:id; failures leave the row unchanged.
 */
export async function enrichJobReopenRequestsWithUserNames(
  items: JobReopenRequest[],
): Promise<JobReopenRequest[]> {
  if (!items.length) return items;

  const ids = new Set<string>();
  for (const row of items) {
    if (needsName(row.requested_by_name) && row.requested_by && isUuid(row.requested_by)) {
      ids.add(row.requested_by);
    }
    if (needsName(row.reviewed_by_name) && row.reviewed_by && isUuid(row.reviewed_by)) {
      ids.add(row.reviewed_by);
    }
  }
  if (!ids.size) return items;

  const nameById = new Map<string, string>();

  // Prefer list when ACL allows (one/few pages), else per-id GET.
  if (canListTenantUsers()) {
    try {
      const tenantId = useAuthStore.getState().user?.tenantId ?? '';
      let page = 1;
      let totalPages = 1;
      while (page <= totalPages && page <= 10) {
        const result = await userService.list({
          tenantId,
          page,
          limit: 100,
          lifecycle: 'all',
          order: 'asc',
        });
        for (const user of result.users) {
          if (!ids.has(user.id)) continue;
          const label = userDisplayName(user);
          if (label) nameById.set(user.id, label);
        }
        totalPages = result.meta.totalPages;
        if ([...ids].every((id) => nameById.has(id))) break;
        page += 1;
      }
    } catch {
      /* fall through to getById */
    }
  }

  const missing = [...ids].filter((id) => !nameById.has(id));
  if (missing.length) {
    const tenantId = useAuthStore.getState().user?.tenantId ?? 'session';
    await Promise.all(
      missing.map(async (id) => {
        try {
          const user = await userService.getById(tenantId, id);
          const label = userDisplayName(user);
          if (label) nameById.set(id, label);
        } catch {
          /* user deleted / inaccessible */
        }
      }),
    );
  }

  if (!nameById.size) return items;

  return items.map((row) => {
    const requested =
      (!needsName(row.requested_by_name)
        ? row.requested_by_name
        : row.requested_by
          ? nameById.get(row.requested_by)
          : undefined) || row.requested_by_name;
    const reviewed =
      (!needsName(row.reviewed_by_name)
        ? row.reviewed_by_name
        : row.reviewed_by
          ? nameById.get(row.reviewed_by)
          : undefined) || row.reviewed_by_name;
    if (requested === row.requested_by_name && reviewed === row.reviewed_by_name) {
      return row;
    }
    return {
      ...row,
      ...(requested ? { requested_by_name: requested } : {}),
      ...(reviewed ? { reviewed_by_name: reviewed } : {}),
    };
  });
}
