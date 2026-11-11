import { FRESA_REPORT_REGISTRY } from '../data/fresaReportRegistry';
import type { ReportTemplateMeta } from '../types/reportCatalog.types';
import { enrichReportMeta } from './enrichReportMeta';
import type {
  ReportImplementationStatus,
  ReportRegistryEnrichment,
  ReportTemplateFamily,
} from './reportRegistry.schema';

export type ReportRegistryEntryV2 = ReportTemplateMeta & {
  enrichment: ReportRegistryEnrichment;
};

const ENRICHED: ReportRegistryEntryV2[] = FRESA_REPORT_REGISTRY.map((meta) => ({
  ...meta,
  enrichment: enrichReportMeta(meta),
}));

const byCode = new Map(ENRICHED.map((r) => [r.code.toUpperCase(), r]));

export function listReportRegistryV2(): ReportRegistryEntryV2[] {
  return ENRICHED;
}

export function getReportRegistryEntryV2(code: string): ReportRegistryEntryV2 | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function getReportEnrichment(code: string): ReportRegistryEnrichment | undefined {
  return getReportRegistryEntryV2(code)?.enrichment;
}

export function listReportsByTemplateFamily(
  family: ReportTemplateFamily,
): ReportRegistryEntryV2[] {
  return ENRICHED.filter((r) => r.enrichment.templateFamily === family);
}

export function listReportsByImplementation(
  status: ReportImplementationStatus,
): ReportRegistryEntryV2[] {
  return ENRICHED.filter((r) => r.enrichment.implementationStatus === status);
}

/** Inventory summary for governance / catalog refresh. */
export function summarizeReportRegistryV2() {
  const byTemplateFamily: Record<string, number> = {};
  const byImplementation: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byVerification: Record<string, number> = {};
  const bySuggestedPackKey: Record<string, number> = {};

  for (const row of ENRICHED) {
    const e = row.enrichment;
    byTemplateFamily[e.templateFamily] = (byTemplateFamily[e.templateFamily] || 0) + 1;
    byImplementation[e.implementationStatus] =
      (byImplementation[e.implementationStatus] || 0) + 1;
    bySource[e.source] = (bySource[e.source] || 0) + 1;
    byVerification[e.verificationStatus] = (byVerification[e.verificationStatus] || 0) + 1;
    if (row.suggestedPackKey) {
      bySuggestedPackKey[row.suggestedPackKey] =
        (bySuggestedPackKey[row.suggestedPackKey] || 0) + 1;
    }
  }

  return {
    reports: ENRICHED.length,
    byTemplateFamily,
    byImplementation,
    bySource,
    byVerification,
    bySuggestedPackKey,
  };
}
