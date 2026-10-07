import {
  departmentLabel,
  fetchAllMasterRecords,
  fetchPortLookup,
  resolvePortLabel,
} from '@/features/customers/utils/customerMasterLookup';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { partyService } from '@/features/parties/services/party.service';
import { userService } from '@/features/users/services/user.service';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import type { Quotation } from '../types/quotation.types';

function uniqueIds(ids: Array<string | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => typeof id === 'string' && isUuid(id)))];
}

function readableName(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isUuid(trimmed)) return undefined;
  return trimmed;
}

function userLabel(user: {
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

async function buildPartyNameMap(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const wanted = new Set(ids);
  if (!wanted.size) return map;

  const partyLabel = (party: { id?: string; code?: string; name?: string }) => {
    const label = [party.code, party.name].filter(Boolean).join(' — ');
    return label && label !== '—' ? label : party.name?.trim() || '';
  };

  try {
    const result = await partyService.list({
      page: 1,
      limit: 100,
      party_type: 'CUSTOMER',
      order: 'asc',
    });
    for (const party of result.parties) {
      const id = String(party.id ?? '');
      if (!wanted.has(id)) continue;
      const label = partyLabel(party);
      if (label) map.set(id, label);
    }
  } catch {
    /* fall through */
  }

  await Promise.all(
    ids
      .filter((id) => !map.has(id))
      .map(async (id) => {
        try {
          const party = await partyService.getById(id);
          const label = partyLabel(party);
          if (label) map.set(id, label);
        } catch {
          /* keep empty */
        }
      }),
  );
  return map;
}

async function buildUserNameMap(ids: string[]): Promise<Map<string, string>> {
  const wanted = new Set(ids);
  const map = new Map<string, string>();
  if (!wanted.size) return map;

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
      const label = userLabel(user);
      if (label) map.set(user.id, label);
    }
    totalPages = result.meta.totalPages;
    if ([...wanted].every((id) => map.has(id))) break;
    page += 1;
  }

  return map;
}

async function buildDepartmentNameMap(ids: string[]): Promise<Map<string, string>> {
  const wanted = new Set(ids);
  const map = new Map<string, string>();
  if (!wanted.size) return map;

  try {
    const departments = await fetchAllMasterRecords(MASTER_PATHS.departments);
    for (const item of departments) {
      const id = String(item.id ?? '').trim();
      const name = departmentLabel(item);
      if (id && name && wanted.has(id)) map.set(id, name);
    }
  } catch {
    /* optional */
  }
  return map;
}

/** Fill missing customer / salesperson / department / port names for quotation list rows. */
export async function enrichQuotationsWithDisplayNames(
  quotations: Quotation[],
): Promise<Quotation[]> {
  if (!quotations.length) return quotations;

  const partyIds = uniqueIds(
    quotations
      .filter((q) => !readableName(q.customer_name))
      .map((q) => q.customer_id),
  );
  const userIds = uniqueIds(
    quotations
      .filter((q) => !readableName(q.salesperson_name))
      .map((q) => q.salesperson_id),
  );
  const departmentIds = uniqueIds(
    quotations
      .filter((q) => !readableName(q.department_name))
      .map((q) => q.department_id),
  );

  const [parties, users, departments, ports] = await Promise.all([
    buildPartyNameMap(partyIds),
    buildUserNameMap(userIds),
    buildDepartmentNameMap(departmentIds),
    fetchPortLookup(),
  ]);

  return quotations.map((q) => ({
    ...q,
    customer_name:
      readableName(q.customer_name) ||
      (q.customer_id ? parties.get(q.customer_id) : undefined) ||
      q.customer_name,
    salesperson_name:
      readableName(q.salesperson_name) ||
      (q.salesperson_id ? users.get(q.salesperson_id) : undefined) ||
      q.salesperson_name,
    department_name:
      readableName(q.department_name) ||
      (q.department_id ? departments.get(q.department_id) : undefined) ||
      q.department_name,
    origin_port_code: resolvePortLabel(q.origin_port_code, q.origin_port_id, ports),
    dest_port_code: resolvePortLabel(q.dest_port_code, q.dest_port_id, ports),
  }));
}
