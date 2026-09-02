import {
  asRecord,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import { portalApiClient } from '@/lib/portalApiClient';
import { isUuid } from '@/lib/isUuid';
import { PORTAL_REFERENCE_API } from '../api/portalReference.api';

export interface PortalPortOption {
  id: string;
  code?: string;
  name?: string;
  label: string;
}

function portLabel(record: Record<string, unknown>): string {
  const code = pickString(
    record.code,
    record.un_locode,
    record.unLocode,
    record.port_code,
    record.portCode,
    record.iata_code,
  );
  const name = pickString(record.name, record.city, record.port_name, record.portName);
  if (code && name && code.toLowerCase() !== name.toLowerCase()) return `${code} — ${name}`;
  return code || name || '';
}

function normalizePortalPort(raw: unknown): PortalPortOption | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.port_id, record.portId);
  if (!id || !isUuid(id)) return null;
  const code = pickString(record.code, record.un_locode, record.unLocode, record.port_code);
  const name = pickString(record.name, record.city, record.port_name);
  const label = portLabel(record);
  if (!label) return null;
  return { id, code: code || undefined, name: name || undefined, label };
}

/** Active ports for portal quote booking (Bearer portal JWT). */
export async function fetchPortalPortOptions(search?: string): Promise<PortalPortOption[]> {
  const res = await portalApiClient.get<unknown>(PORTAL_REFERENCE_API.ports, {
    params: {
      page: 1,
      limit: 500,
      is_active: true,
      order: 'asc',
      search: search?.trim() || undefined,
    },
  });

  const payload = unwrapData(res.data);
  const { items } = unwrapList(payload ?? res.data, ['items', 'results', 'ports', 'data']);
  const list = Array.isArray(payload) ? payload : items;

  return (Array.isArray(list) ? list : [])
    .map(normalizePortalPort)
    .filter((p): p is PortalPortOption => Boolean(p))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function portalPortsToSelectOptions(ports: PortalPortOption[]) {
  return ports.map((p) => ({ value: p.id, label: p.label }));
}
