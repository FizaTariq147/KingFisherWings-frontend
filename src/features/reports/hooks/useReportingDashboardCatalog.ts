import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { listAllRegisteredFormatCatalogEntries } from '../data/resolveAnyFormatUiLayout';
import { getRegistryByCode } from '../data/fresaReportRegistry';
import { getReportEnrichment } from '../registry';
import { REPORT_FAMILY_LABELS, type ReportTemplate } from '../types/reportCatalog.types';
import { metaToTemplate } from '../utils/normalizeReportCatalog';
import { reportFamilyAllowed } from '../utils/reportModuleAccess';
import { shouldExposeHawbInPrimaryCatalogue } from '../utils/officialFormatGovernance';
import { hasFreightnestGeneratePath } from '../utils/generateCatalogLayoutPdf';
import { isClientFlowInvoiceCode } from '../flow/invoiceFlowOptions';
import { useReportTemplatesBrowse } from './useReportCatalog';
import {
  availabilityFromMeta,
  mapDocumentTypeToDashboardType,
  type DashboardReportCardModel,
} from '../utils/dashboardFilters';
import { moduleLabelForFamily } from '../utils/dashboardCategories';

export type DashboardCatalogRow = DashboardReportCardModel & {
  template: ReportTemplate;
};

/**
 * Catalogue for the Reporting Dashboard: permanent layouts + API enrich + module permissions.
 * Does not invent codes. Mirrors ReportCatalogPage data rules.
 */
export function useReportingDashboardCatalog() {
  const { user } = useAuth();
  const enabledModules = user?.enabledModules;
  const liveBrowse = useReportTemplatesBrowse({ includeInactive: true }, true);

  const backendUnavailable =
    liveBrowse.data?.backendUnavailable || liveBrowse.data?.fromLocalRegistry;
  const liveAvailable =
    Boolean(liveBrowse.data) &&
    !liveBrowse.isError &&
    !backendUnavailable &&
    !liveBrowse.data?.fromLocalRegistry;

  const registeredLayoutEntries = useMemo(
    () =>
      listAllRegisteredFormatCatalogEntries().filter((entry) => {
        if (!/^HAWB_/i.test(entry.code)) return true;
        return shouldExposeHawbInPrimaryCatalogue(entry.code);
      }),
    [],
  );

  const rows = useMemo(() => {
    const liveByCode = new Map<string, ReportTemplate>();
    if (liveAvailable && liveBrowse.data?.items) {
      for (const t of liveBrowse.data.items) {
        if (t.code) liveByCode.set(t.code.toUpperCase(), t);
      }
    }

    const out: DashboardCatalogRow[] = [];
    registeredLayoutEntries.forEach((entry, index) => {
      if (!reportFamilyAllowed(entry.family, enabledModules)) return;

      const live = liveByCode.get(entry.code.toUpperCase());
      const meta = getRegistryByCode(entry.code);
      const template: ReportTemplate = live
        ? live
        : meta
          ? metaToTemplate(meta, index)
          : metaToTemplate(
              {
                code: entry.code,
                name: entry.name,
                family: entry.family,
                contexts: entry.contexts,
                formats: ['PDF'],
                gapStatus: 'covered_document_pdf',
                rolloutPhase: 1,
                defaultParams: [],
              },
              index,
            );

      const enrichment = getReportEnrichment(entry.code);
      const formats = template.formats?.length ? template.formats : (['PDF'] as const);
      // Client layout / flow codes are listed and usable without Bind / Activate.
      const clientReady =
        isClientFlowInvoiceCode(entry.code) || hasFreightnestGeneratePath(entry.code);
      const listedActive = clientReady || template.is_active !== false;
      const { availability, availabilityLabel } = availabilityFromMeta({
        is_active: listedActive,
        gapStatus: template.gapStatus ?? meta?.gapStatus,
        hasClientLayout: clientReady || meta?.hasClientLayout !== false,
      });

      const listedTemplate: ReportTemplate = clientReady
        ? { ...template, is_active: true }
        : template;

      out.push({
        code: listedTemplate.code,
        name: listedTemplate.name || entry.name,
        description: listedTemplate.description || meta?.description || '',
        family: listedTemplate.family || entry.family,
        categoryLabel:
          REPORT_FAMILY_LABELS[listedTemplate.family || entry.family] || entry.family,
        moduleLabel: moduleLabelForFamily(listedTemplate.family || entry.family),
        reportType: mapDocumentTypeToDashboardType(
          enrichment?.documentType,
          listedTemplate.family || entry.family,
        ),
        formats: [...formats],
        availability,
        availabilityLabel,
        keywords: [entry.kind, ...(entry.contexts || []), enrichment?.templateType || '']
          .filter(Boolean)
          .join(' '),
        is_active: listedActive,
        template: listedTemplate,
      });
    });
    return out;
  }, [enabledModules, liveAvailable, liveBrowse.data?.items, registeredLayoutEntries]);

  return {
    rows,
    isLoading: liveBrowse.isLoading && !liveBrowse.data,
    isError: liveBrowse.isError && !liveBrowse.data,
    backendUnavailable: Boolean(backendUnavailable),
    fromLocalRegistry: Boolean(liveBrowse.data?.fromLocalRegistry) || !liveAvailable,
  };
}
