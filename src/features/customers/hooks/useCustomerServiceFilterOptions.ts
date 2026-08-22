import { useQuery } from '@tanstack/react-query';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { partyService } from '@/features/parties/services/party.service';
import { userService } from '@/features/users/services/user.service';
import { useAuthStore } from '@/store/authStore';
import type {
  CustomerFilterOption,
  CustomerServiceFilterOptions,
} from '../types/customerFilter.types';
import {
  branchLabel,
  carrierLabel,
  departmentLabel,
  fetchAllMasterRecords,
  portLabelFromRecord,
  vesselLabel,
} from '../utils/customerMasterLookup';
import { CUSTOMER_API_MAX_PAGES, CUSTOMER_API_PAGE_LIMIT } from '../utils/customerServiceApi';
import { filterOptionsOrFallback, FILTER_SELECT } from '../utils/customerFilterDefaults';

export const customerFilterKeys = {
  all: ['customer-service', 'filter-options'] as const,
};

function allOption(): CustomerFilterOption {
  return { value: 'All', label: 'All' };
}

function selectOption(): CustomerFilterOption {
  return { value: '-Select-', label: '-Select-' };
}

function toOptions(
  records: Array<{ id: string; label: string }>,
  blank: CustomerFilterOption,
): CustomerFilterOption[] {
  const seen = new Set<string>();
  const options = [blank];
  for (const record of records) {
    if (!record.id || !record.label || seen.has(record.id)) continue;
    seen.add(record.id);
    options.push({ value: record.id, label: record.label });
  }
  return options;
}

async function fetchAllParties() {
  const first = await partyService.list({ page: 1, limit: CUSTOMER_API_PAGE_LIMIT, order: 'asc' });
  const parties = [...first.parties];
  const totalPages = Math.min(first.meta.totalPages, CUSTOMER_API_MAX_PAGES);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await partyService.list({ page, limit: CUSTOMER_API_PAGE_LIMIT, order: 'asc' });
    parties.push(...next.parties);
  }
  return parties;
}

async function fetchSalesUsers() {
  const tenantId = useAuthStore.getState().user?.tenantId ?? '';
  const first = await userService.list({
    tenantId,
    page: 1,
    limit: CUSTOMER_API_PAGE_LIMIT,
    lifecycle: 'all',
    order: 'asc',
  });
  let users = [...first.users];
  const totalPages = Math.min(first.meta.totalPages, CUSTOMER_API_MAX_PAGES);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await userService.list({
      tenantId,
      page,
      limit: CUSTOMER_API_PAGE_LIMIT,
      lifecycle: 'all',
      order: 'asc',
    });
    users.push(...next.users);
  }
  users = users.filter((user) => user.is_salesperson || user.status === 'ACTIVE');
  return users.map((user) => ({
    id: user.id,
    label:
      user.full_name?.trim() ||
      [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
      user.email,
  }));
}

async function loadFilterOptions(): Promise<CustomerServiceFilterOptions> {
  const [branches, ports, departments, carriers, vessels, parties, salesPersons] = await Promise.all([
    fetchAllMasterRecords(MASTER_PATHS.branches),
    fetchAllMasterRecords(MASTER_PATHS.ports),
    fetchAllMasterRecords(MASTER_PATHS.departments),
    fetchAllMasterRecords(MASTER_PATHS['shipping-lines']),
    fetchAllMasterRecords(MASTER_PATHS.vessels),
    fetchAllParties(),
    fetchSalesUsers(),
  ]);

  const partyOptions = parties.map((party) => ({ id: party.id, label: party.name }));
  const customerParties = parties
    .filter((party) => party.party_type === 'CUSTOMER' || party.party_type === 'AGENT')
    .map((party) => ({ id: party.id, label: party.name }));

  return {
    branches: toOptions(
      branches.map((item) => ({ id: String(item.id), label: branchLabel(item) })),
      allOption(),
    ),
    ports: toOptions(
      ports.map((item) => ({ id: String(item.id), label: portLabelFromRecord(item) })),
      allOption(),
    ),
    departments: toOptions(
      departments.map((item) => ({ id: String(item.id), label: departmentLabel(item) })),
      allOption(),
    ),
    carriers: toOptions(
      carriers.map((item) => ({ id: String(item.id), label: carrierLabel(item) })),
      selectOption(),
    ),
    vessels: toOptions(
      vessels.map((item) => ({ id: String(item.id), label: vesselLabel(item) })),
      selectOption(),
    ),
    clients: toOptions(customerParties.length ? customerParties : partyOptions, allOption()),
    shippers: toOptions(partyOptions, selectOption()),
    consignees: toOptions(partyOptions, selectOption()),
    salesPersons: toOptions(salesPersons, allOption()),
  };
}

export function useCustomerServiceFilterOptions() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: customerFilterKeys.all,
    queryFn: loadFilterOptions,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60_000,
  });
}

export function useCustomerFilterSelectOptions() {
  const query = useCustomerServiceFilterOptions();
  return {
    isLoading: query.isLoading,
    branches: filterOptionsOrFallback(query.data?.branches),
    clients: filterOptionsOrFallback(query.data?.clients),
    salesPersons: filterOptionsOrFallback(query.data?.salesPersons),
    departments: filterOptionsOrFallback(query.data?.departments),
    ports: filterOptionsOrFallback(query.data?.ports),
    carriers: filterOptionsOrFallback(query.data?.carriers, FILTER_SELECT),
    vessels: filterOptionsOrFallback(query.data?.vessels, FILTER_SELECT),
    shippers: filterOptionsOrFallback(query.data?.shippers, FILTER_SELECT),
    consignees: filterOptionsOrFallback(query.data?.consignees, FILTER_SELECT),
  };
}
