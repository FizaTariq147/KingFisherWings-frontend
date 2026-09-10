import type {
  ReportFamily,
  ReportGapStatus,
  ReportTemplateMeta,
} from '../types/reportCatalog.types';
import { FRESA_REPORT_REGISTRY as GENERATED } from './fresaReportRegistry.generated';

/** Static FRESA-aligned taxonomy (Phase 0 registry). */
export const FRESA_REPORT_REGISTRY: ReportTemplateMeta[] = GENERATED;

export function getRegistryByCode(code: string): ReportTemplateMeta | undefined {
  const needle = code.trim().toUpperCase();
  return FRESA_REPORT_REGISTRY.find((t) => t.code === needle);
}

export function filterRegistry(options: {
  search?: string;
  family?: ReportFamily | 'all';
  context?: string;
  rolloutPhase?: number;
  gapStatus?: ReportGapStatus | 'all';
}): ReportTemplateMeta[] {
  const q = options.search?.trim().toLowerCase() ?? '';
  return FRESA_REPORT_REGISTRY.filter((t) => {
    if (options.family && options.family !== 'all' && t.family !== options.family) return false;
    if (options.context && options.context !== 'all') {
      if (!t.contexts.includes(options.context as ReportTemplateMeta['contexts'][number])) {
        return false;
      }
    }
    if (options.rolloutPhase != null && t.rolloutPhase > options.rolloutPhase) return false;
    if (options.gapStatus && options.gapStatus !== 'all' && t.gapStatus !== options.gapStatus) {
      return false;
    }
    if (!q) return true;
    const hay = `${t.name} ${t.code} ${t.description ?? ''} ${t.family}`.toLowerCase();
    return hay.includes(q);
  });
}

export interface ReportGapMatrixRow {
  family: ReportFamily;
  total: number;
  net_new: number;
  partial_analytics: number;
  partial_document_pdf: number;
  covered_analytics: number;
  covered_document_pdf: number;
}

export function buildReportGapMatrix(
  items: ReportTemplateMeta[] = FRESA_REPORT_REGISTRY,
): ReportGapMatrixRow[] {
  const map = new Map<ReportFamily, ReportGapMatrixRow>();
  for (const t of items) {
    let row = map.get(t.family);
    if (!row) {
      row = {
        family: t.family,
        total: 0,
        net_new: 0,
        partial_analytics: 0,
        partial_document_pdf: 0,
        covered_analytics: 0,
        covered_document_pdf: 0,
      };
      map.set(t.family, row);
    }
    row.total += 1;
    row[t.gapStatus] += 1;
  }
  return [...map.values()].sort((a, b) => a.family.localeCompare(b.family));
}
