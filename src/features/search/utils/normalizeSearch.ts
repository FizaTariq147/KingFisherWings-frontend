import type {
  GlobalSearchResult,
  SearchHit,
  SearchResultGroup,
} from '../types/search.types';
import {
  hitSubtitle,
  hitTitle,
  normalizeType,
  resolveSearchHref,
  searchGroupLabel,
} from './searchNavigation';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickId(r: Record<string, unknown>): string | null {
  const id = r.id ?? r.entity_id ?? r.entityId;
  if (typeof id === 'string' && id.trim()) return id.trim();
  if (typeof id === 'number' && Number.isFinite(id)) return String(id);
  return null;
}

function unwrapPayload(raw: unknown): unknown {
  const r = asRecord(raw);
  if (!r) return raw;
  if (r.data !== undefined) return r.data;
  if (r.result !== undefined) return r.result;
  if (r.results !== undefined) return r.results;
  return raw;
}

function toHit(
  item: unknown,
  fallbackType: string,
): SearchHit | null {
  const r = asRecord(item);
  if (!r) return null;
  const id = pickId(r);
  if (!id) return null;
  const type = normalizeType(r.type ?? r.entity_type ?? r.entityType ?? fallbackType);
  return {
    id,
    type,
    title: hitTitle(type, r, id),
    subtitle: hitSubtitle(type, r),
    status: typeof r.status === 'string' ? r.status : undefined,
    href: resolveSearchHref(type, id, r),
    raw: r,
  };
}

const GROUP_KEYS = [
  'jobs',
  'quotations',
  'parties',
  'invoices',
  'job',
  'quotation',
  'party',
  'invoice',
  'items',
  'results',
  'hits',
] as const;

/**
 * Swagger does not define a response DTO for GET /search.
 * Normalize common Nest / ERP shapes into grouped SearchHit lists.
 */
export function normalizeGlobalSearch(
  raw: unknown,
  query: string,
): GlobalSearchResult {
  const payload = unwrapPayload(raw);
  const groups: SearchResultGroup[] = [];
  const pushGroup = (type: string, items: SearchHit[]) => {
    if (!items.length) return;
    const existing = groups.find((g) => g.type === type);
    if (existing) {
      existing.items.push(...items);
      return;
    }
    groups.push({ type, label: searchGroupLabel(type), items });
  };

  if (Array.isArray(payload)) {
    const byType = new Map<string, SearchHit[]>();
    for (const item of payload) {
      const hit = toHit(item, 'other');
      if (!hit) continue;
      const list = byType.get(hit.type) ?? [];
      list.push(hit);
      byType.set(hit.type, list);
    }
    for (const [type, items] of byType) pushGroup(type, items);
  } else {
    const record = asRecord(payload);
    if (record) {
      let matchedKey = false;
      for (const key of GROUP_KEYS) {
        const value = record[key];
        if (!Array.isArray(value)) continue;
        matchedKey = true;
        const typeHint = key === 'items' || key === 'results' || key === 'hits' ? 'other' : key;
        const hits = value
          .map((item) => toHit(item, typeHint))
          .filter((h): h is SearchHit => h != null);
        pushGroup(normalizeType(typeHint), hits);
      }
      // Single-object response that is itself a hit
      if (!matchedKey && pickId(record)) {
        const hit = toHit(record, 'other');
        if (hit) pushGroup(hit.type, [hit]);
      }
    }
  }

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  return { groups, total, query };
}
