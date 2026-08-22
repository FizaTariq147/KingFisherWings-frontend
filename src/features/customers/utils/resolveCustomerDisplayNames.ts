import { crmLeadsService } from '@/features/crm/services/crmLeads.service';
import {
  branchLabel,
  buildMasterLookup,
  carrierLabel,
  fetchAllMasterRecords,
  fetchPortLookup,
  resolvePortLabel,
  vesselLabel,
} from './customerMasterLookup';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { partyService } from '@/features/parties/services/party.service';
import type { Enquiry } from '@/features/crm/types/crm.types';
import type { Job } from '@/features/jobs/types/job.types';
import { userService } from '@/features/users/services/user.service';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import type { CustomerEnquiryRow } from '../types/customerService.types';

function uniqueIds(ids: Array<string | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => typeof id === 'string' && isUuid(id)))];
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
  await Promise.all(
    ids.map(async (id) => {
      try {
        const party = await partyService.getById(id);
        if (party.name && party.name !== '—') map.set(id, party.name);
      } catch {
        // Party may be deleted or inaccessible — keep row without name.
      }
    }),
  );
  return map;
}

async function buildLeadNameMap(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const lead = await crmLeadsService.get(id);
        const name = lead.company_name?.trim() || lead.contact_name?.trim();
        if (name) map.set(id, name);
      } catch {
        // ignore
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

async function buildBranchNameMap(ids: string[]): Promise<Map<string, string>> {
  const wanted = new Set(ids);
  const map = new Map<string, string>();
  if (!wanted.size) return map;

  try {
    const branches = await fetchAllMasterRecords(MASTER_PATHS.branches);
    for (const item of branches) {
      const id = String(item.id ?? '').trim();
      const name = branchLabel(item);
      if (id && name && wanted.has(id)) map.set(id, name);
    }
  } catch {
    // Branches master optional for display.
  }

  return map;
}

export async function enrichJobsWithDisplayNames(jobs: Job[]): Promise<Job[]> {
  if (!jobs.length) return jobs;

  const partyIds = uniqueIds(
    jobs.flatMap((job) => [job.shipper_id, job.consignee_id, job.agent_id]),
  );
  const userIds = uniqueIds(jobs.flatMap((job) => [job.salesperson_id, job.ops_user_id]));
  const branchIds = uniqueIds(jobs.map((job) => job.branch_id));

  const [parties, users, branches, ports, carriers, vessels] = await Promise.all([
    buildPartyNameMap(partyIds),
    buildUserNameMap(userIds),
    buildBranchNameMap(branchIds),
    fetchPortLookup(),
    fetchAllMasterRecords(MASTER_PATHS['shipping-lines'])
      .then((items) => buildMasterLookup(items, carrierLabel))
      .catch(() => new Map<string, string>()),
    fetchAllMasterRecords(MASTER_PATHS.vessels)
      .then((items) => buildMasterLookup(items, vesselLabel))
      .catch(() => new Map<string, string>()),
  ]);

  return jobs.map((job) => ({
    ...job,
    shipper_name: job.shipper_name || parties.get(job.shipper_id) || job.shipper_name,
    consignee_name:
      job.consignee_name || (job.consignee_id ? parties.get(job.consignee_id) : undefined) || job.consignee_name,
    agent_name: job.agent_name || (job.agent_id ? parties.get(job.agent_id) : undefined) || job.agent_name,
    salesperson_name:
      job.salesperson_name || (job.salesperson_id ? users.get(job.salesperson_id) : undefined) || job.salesperson_name,
    branch_name: job.branch_name || (job.branch_id ? branches.get(job.branch_id) : undefined) || job.branch_name,
    origin_port_code: resolvePortLabel(job.origin_port_code, job.origin_port_id, ports),
    dest_port_code: resolvePortLabel(job.dest_port_code, job.dest_port_id, ports),
    sea_fcl_details: job.sea_fcl_details
      ? {
          ...job.sea_fcl_details,
          shipping_line_id: job.sea_fcl_details.shipping_line_id,
          vessel_id: job.sea_fcl_details.vessel_id,
          shipping_line_name:
            (job.sea_fcl_details.shipping_line_id
              ? carriers.get(job.sea_fcl_details.shipping_line_id)
              : undefined) || undefined,
          vessel_name:
            (job.sea_fcl_details.vessel_id ? vessels.get(job.sea_fcl_details.vessel_id) : undefined) ||
            undefined,
        }
      : undefined,
  }));
}

export async function enrichEnquiryRowsWithDisplayNames(rows: CustomerEnquiryRow[]): Promise<CustomerEnquiryRow[]> {
  if (!rows.length) return rows;

  const partyIds = uniqueIds(rows.map((row) => row.partyId));
  const leadIds = uniqueIds(rows.map((row) => row.leadId));
  const userIds = uniqueIds(rows.map((row) => row.salesPersonId));

  const [parties, leads, users, ports] = await Promise.all([
    buildPartyNameMap(partyIds),
    buildLeadNameMap(leadIds),
    buildUserNameMap(userIds),
    fetchPortLookup(),
  ]);

  return rows.map((row) => ({
    ...row,
    client:
      (row.client && row.client !== '—' && !isUuid(row.client) ? row.client : undefined) ||
      parties.get(row.partyId ?? '') ||
      leads.get(row.leadId ?? '') ||
      '—',
    salesPerson:
      (row.salesPerson && row.salesPerson !== '—' && !isUuid(row.salesPerson) ? row.salesPerson : undefined) ||
      users.get(row.salesPersonId ?? '') ||
      '—',
    origin: resolvePortLabel(row.origin !== '—' ? row.origin : undefined, row.originPortId, ports),
    destination: resolvePortLabel(row.destination !== '—' ? row.destination : undefined, row.destPortId, ports),
  }));
}

export async function enrichEnquiriesWithDisplayNames(enquiries: Enquiry[]): Promise<Enquiry[]> {
  if (!enquiries.length) return enquiries;

  const partyIds = uniqueIds(enquiries.map((e) => e.party_id));
  const leadIds = uniqueIds(enquiries.map((e) => e.lead_id));
  const userIds = uniqueIds(enquiries.map((e) => e.salesperson_id));

  const [parties, leads, users] = await Promise.all([
    buildPartyNameMap(partyIds),
    buildLeadNameMap(leadIds),
    buildUserNameMap(userIds),
  ]);

  return enquiries.map((enquiry) => {
    const raw = enquiry as Record<string, unknown>;
    const existingPartyName = String(raw.party_name ?? raw.partyName ?? '').trim();
    const existingLeadName = String(raw.lead_name ?? raw.leadName ?? raw.company_name ?? '').trim();
    return {
      ...enquiry,
      party_name:
        existingPartyName ||
        (enquiry.party_id ? parties.get(enquiry.party_id) : undefined) ||
        existingPartyName,
      lead_name:
        existingLeadName || (enquiry.lead_id ? leads.get(enquiry.lead_id) : undefined) || existingLeadName,
      salesperson_name:
        String(raw.salesperson_name ?? raw.salespersonName ?? '').trim() ||
        (enquiry.salesperson_id ? users.get(enquiry.salesperson_id) : undefined) ||
        undefined,
    };
  });
}
