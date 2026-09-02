import { isUuid } from '@/lib/isUuid';
import type { PortalQuotationRequestDto } from '../types/portalQuotations.types';
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

function appendUnresolvedRouteNotes(
  specialRequirements: string | undefined,
  unresolvedOrigin?: string,
  unresolvedDest?: string,
): string | undefined {
  const parts: string[] = [];
  if (unresolvedOrigin) parts.push(`Origin port: ${unresolvedOrigin}`);
  if (unresolvedDest) parts.push(`Destination port: ${unresolvedDest}`);
  if (parts.length === 0) return specialRequirements?.trim() || undefined;
  const routeLine = parts.join('; ');
  const base = specialRequirements?.trim();
  return base ? `${routeLine}\n\n${base}` : routeLine;
}

/**
 * Portal quote API accepts `origin_port_id` / `dest_port_id` only.
 * Resolve names against the reference port list; otherwise note route in special_requirements.
 */
export function applyPortalRouteFields(
  dto: PortalQuotationRequestDto,
  route: PortalQuotationFormRoute,
  ports: PortalPortOption[] = [],
): PortalQuotationRequestDto {
  const next = { ...dto };
  const originRaw = route.origin_port?.trim();
  const destRaw = route.dest_port?.trim();

  let unresolvedOrigin: string | undefined;
  let unresolvedDest: string | undefined;

  if (originRaw) {
    const id = resolvePortalPortId(originRaw, ports);
    if (id) next.origin_port_id = id;
    else unresolvedOrigin = originRaw;
  }
  if (destRaw) {
    const id = resolvePortalPortId(destRaw, ports);
    if (id) next.dest_port_id = id;
    else unresolvedDest = destRaw;
  }

  if (unresolvedOrigin || unresolvedDest) {
    next.special_requirements = appendUnresolvedRouteNotes(
      dto.special_requirements,
      unresolvedOrigin,
      unresolvedDest,
    );
  }

  return next;
}
