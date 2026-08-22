import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { masterService } from '@/features/masters/services/master.service';
import type { MasterRecord } from '@/features/masters/types/master.types';
import { isUuid } from '@/lib/isUuid';

const MASTER_PAGE_LIMIT = 100;
const MASTER_MAX_PAGES = 10;

function pickString(record: MasterRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return '';
}

export async function fetchAllMasterRecords(basePath: string): Promise<MasterRecord[]> {
  const first = await masterService.list(basePath, { page: 1, limit: MASTER_PAGE_LIMIT, order: 'asc' });
  const items = [...first.items];
  const totalPages = Math.min(first.meta.totalPages, MASTER_MAX_PAGES);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await masterService.list(basePath, { page, limit: MASTER_PAGE_LIMIT, order: 'asc' });
    items.push(...next.items);
  }
  return items;
}

export function portLabelFromRecord(port: MasterRecord): string {
  const code = pickString(port, 'un_locode', 'code', 'port_code', 'iata_code', 'unlocode');
  const name = pickString(port, 'name', 'city');
  if (code && name && code !== name) return `${code} — ${name}`;
  return code || name || '';
}

export function buildPortLookup(ports: MasterRecord[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const port of ports) {
    const label = portLabelFromRecord(port);
    const id = String(port.id ?? '').trim();
    if (id && label) lookup.set(id, label);
  }
  return lookup;
}

export function buildMasterLookup(
  records: MasterRecord[],
  labelFn: (record: MasterRecord) => string,
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const record of records) {
    const id = String(record.id ?? '').trim();
    const label = labelFn(record);
    if (id && label) lookup.set(id, label);
  }
  return lookup;
}

export function resolvePortLabel(
  code: string | undefined,
  id: string | undefined,
  lookup: Map<string, string>,
): string {
  const trimmedCode = code?.trim();
  if (trimmedCode && !isUuid(trimmedCode)) return trimmedCode;
  if (id && lookup.has(id)) return lookup.get(id)!;
  return '—';
}

export function resolveMasterLabel(
  id: string | undefined,
  lookup: Map<string, string>,
): string {
  if (!id?.trim()) return '—';
  if (lookup.has(id)) return lookup.get(id)!;
  return isUuid(id) ? '—' : id;
}

let cachedPortLookup: Map<string, string> | null = null;

export async function fetchPortLookup(): Promise<Map<string, string>> {
  if (cachedPortLookup) return cachedPortLookup;
  try {
    const ports = await fetchAllMasterRecords(MASTER_PATHS.ports);
    cachedPortLookup = buildPortLookup(ports);
  } catch {
    cachedPortLookup = new Map();
  }
  return cachedPortLookup;
}

export function branchLabel(record: MasterRecord): string {
  return pickString(record, 'name', 'code') || pickString(record, 'branch_name', 'branchName');
}

export function departmentLabel(record: MasterRecord): string {
  return pickString(record, 'name', 'code');
}

export function carrierLabel(record: MasterRecord): string {
  return pickString(record, 'name', 'code', 'scac_code', 'scacCode');
}

export function vesselLabel(record: MasterRecord): string {
  return pickString(record, 'name', 'vessel_name', 'vesselName', 'imo_number', 'imoNumber');
}
