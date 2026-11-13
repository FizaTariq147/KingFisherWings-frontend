/**
 * P0 Fresa live-PDF queue — verified samples and pack-ready codes only.
 * Live visual PDF / screenshot work should target this set, not the full 852
 * registry or shared-shell Format-N aliases.
 */
import { listHblFormats } from '../constants/hblFormatCatalog';
import { listHawbFormats } from '../constants/hawbFormatCatalog';
import { listReportRegistryV2 } from '../registry';

export type FresaP0QueueEntry = {
  code: string;
  reason: 'verified_sample' | 'pack_bound';
  family: string;
  packKey?: string | null;
  samplePdfUrl?: string | null;
};

/** HBL/HAWB codes with a distinct CDN sample (not sampleIsFallback). */
export function listP0VerifiedSampleCodes(): FresaP0QueueEntry[] {
  const rows: FresaP0QueueEntry[] = [];
  for (const h of listHblFormats()) {
    if ((h.samplePdfUrl || '').trim()) {
      rows.push({
        code: h.code,
        reason: 'verified_sample',
        family: 'hbl',
        samplePdfUrl: h.samplePdfUrl,
      });
    }
  }
  for (const h of listHawbFormats()) {
    if ((h.samplePdfUrl || '').trim() && !h.sampleIsFallback) {
      rows.push({
        code: h.code,
        reason: 'verified_sample',
        family: 'hawb',
        samplePdfUrl: h.samplePdfUrl,
      });
    }
  }
  return rows;
}

/**
 * Pack-ready P0 families: arrival, delivery order, commercial invoice packs.
 * Excludes shared_shell implementationStatus.
 */
export function listP0PackBoundCodes(): FresaP0QueueEntry[] {
  const packFamilies = new Set(['arrival_notice', 'delivery_order', 'invoice']);
  const rows: FresaP0QueueEntry[] = [];
  for (const entry of listReportRegistryV2()) {
    const e = entry.enrichment;
    if (e.implementationStatus === 'shared_shell') continue;
    if (e.isSharedLayout) continue;
    if (!entry.suggestedPackKey) continue;
    if (!packFamilies.has(e.templateFamily)) continue;
    // Prefer codes that are pack-bound or still template_v2 but have a pack hint.
    if (
      e.implementationStatus === 'pack_bound' ||
      e.implementationStatus === 'template_v2' ||
      e.implementationStatus === 'json_legacy'
    ) {
      rows.push({
        code: entry.code,
        reason: 'pack_bound',
        family: e.templateFamily,
        packKey: entry.suggestedPackKey,
      });
    }
  }
  return rows;
}

/** Full P0 queue (samples first, then pack-bound). Deduped by code. */
export function listFresaP0LivePdfQueue(): FresaP0QueueEntry[] {
  const byCode = new Map<string, FresaP0QueueEntry>();
  for (const row of listP0VerifiedSampleCodes()) {
    byCode.set(row.code.toUpperCase(), row);
  }
  for (const row of listP0PackBoundCodes()) {
    const key = row.code.toUpperCase();
    if (!byCode.has(key)) byCode.set(key, row);
  }
  return [...byCode.values()];
}

export function summarizeFresaP0LivePdfQueue() {
  const all = listFresaP0LivePdfQueue();
  const byReason: Record<string, number> = {};
  const byFamily: Record<string, number> = {};
  for (const row of all) {
    byReason[row.reason] = (byReason[row.reason] || 0) + 1;
    byFamily[row.family] = (byFamily[row.family] || 0) + 1;
  }
  return { total: all.length, byReason, byFamily };
}
