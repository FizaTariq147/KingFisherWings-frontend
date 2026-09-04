import { isUuid } from '@/lib/isUuid';
import type { PortalPortOption } from './loadPortalPortOptions';

export interface PortalQuotationFormRoute {
  origin_port?: string;
  dest_port?: string;
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

/** Match typed port text or UUID to a master port id (portal DTO accepts ids only). */
export function resolvePortalPortId(
  value: string | undefined,
  ports: PortalPortOption[],
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (isUuid(trimmed)) {
    const byId = ports.find((p) => p.id === trimmed);
    return byId?.id ?? trimmed;
  }

  const token = normalizeToken(trimmed);
  for (const port of ports) {
    const candidates = [port.label, port.code, port.name]
      .filter(Boolean)
      .map((s) => normalizeToken(String(s)));
    if (candidates.some((c) => c === token)) return port.id;
  }

  for (const port of ports) {
    const label = normalizeToken(port.label);
    const code = port.code ? normalizeToken(port.code) : '';
    const name = port.name ? normalizeToken(port.name) : '';
    if (
      label.includes(token) ||
      token.includes(label) ||
      (code && (code === token || token.includes(code) || code.includes(token))) ||
      (name && (name === token || token.includes(name) || name.includes(token)))
    ) {
      return port.id;
    }
  }

  return undefined;
}

function stripPreviousRouteNotes(specialRequirements: string | undefined): string {
  if (!specialRequirements?.trim()) return '';
  return specialRequirements
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^Customer route:/i.test(line)) return false;
      if (/^Origin port:/i.test(line)) return false;
      if (/^Destination port:/i.test(line)) return false;
      // Drop the old combined "Origin port: X; Destination port: Y" single line.
      if (/Origin port:.*Destination port:/i.test(line)) return false;
      return true;
    })
    .join('\n')
    .trim();
}

/**
 * Always persist the customer-typed route so admin list/detail can show every
 * enquiry route, even when port IDs resolve (or fail to).
 */
function appendCustomerRouteNote(
  specialRequirements: string | undefined,
  originRaw?: string,
  destRaw?: string,
): string | undefined {
  const cleaned = stripPreviousRouteNotes(specialRequirements);
  if (!originRaw && !destRaw) return cleaned || undefined;

  const routeLine = `Customer route: ${originRaw || '—'} → ${destRaw || '—'}`;
  return cleaned ? `${routeLine}\n\n${cleaned}` : routeLine;
}

type PortalRoutableDto = {
  origin_port_id?: string;
  dest_port_id?: string;
  special_requirements?: string;
};

/**
 * Portal quote API accepts `origin_port_id` / `dest_port_id` only.
 * Resolve names against the reference port list; always note the typed route
 * in special_requirements for dynamic display on staff quotations.
 */
export function applyPortalRouteFields<T extends PortalRoutableDto>(
  dto: T,
  route: PortalQuotationFormRoute,
  ports: PortalPortOption[] = [],
): T {
  const next = { ...dto };
  const originRaw = route.origin_port?.trim();
  const destRaw = route.dest_port?.trim();

  if (originRaw) {
    const id = resolvePortalPortId(originRaw, ports);
    if (id) next.origin_port_id = id;
  }
  if (destRaw) {
    const id = resolvePortalPortId(destRaw, ports);
    if (id) next.dest_port_id = id;
  }

  if (originRaw || destRaw) {
    next.special_requirements = appendCustomerRouteNote(
      dto.special_requirements,
      originRaw,
      destRaw,
    );
  }

  return next;
}
