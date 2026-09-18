import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import {
  REPORT_TEMPLATE_CONTEXT_ENUM,
  REPORT_TEMPLATE_FAMILY_ENUM,
} from '../api/reportCatalog.api';
import { filterRegistry } from '../data/fresaReportRegistry';
import type { ReportFamily, ReportTemplate } from '../types/reportCatalog.types';
import { reportContextLabel, reportFamilyLabel } from '../types/reportCatalog.types';
import { metaToTemplate } from '../utils/normalizeReportCatalog';
import {
  reportTemplateMatchesSearch,
  tokenizeReportSearch,
} from '../utils/reportCatalogSearch';
import { ReportCatalogBrowseList } from '../components/ReportCatalog/ReportCatalogBrowseList';
import { InvoiceFormatBrowseStrip } from '../components/ReportCatalog/InvoiceFormatBrowseStrip';
import { InvoiceFormatAutoPdf } from '../components/ReportCatalog/InvoiceFormatAutoPdf';
import { AccountsFormatBrowseStrip } from '../components/ReportCatalog/AccountsFormatBrowseStrip';
import { AccountsFormatAutoPdf } from '../components/ReportCatalog/AccountsFormatAutoPdf';
import { WmsFormatBrowseStrip } from '../components/ReportCatalog/WmsFormatBrowseStrip';
import { WmsFormatAutoPdf } from '../components/ReportCatalog/WmsFormatAutoPdf';
import { ArrivalNoticeFormatBrowseStrip } from '../components/ReportCatalog/ArrivalNoticeFormatBrowseStrip';
import { ArrivalNoticeFormatAutoPdf } from '../components/ReportCatalog/ArrivalNoticeFormatAutoPdf';
import { DeliveryOrderFormatBrowseStrip } from '../components/ReportCatalog/DeliveryOrderFormatBrowseStrip';
import { DeliveryOrderFormatAutoPdf } from '../components/ReportCatalog/DeliveryOrderFormatAutoPdf';
import { HawbFormatBrowseStrip } from '../components/ReportCatalog/HawbFormatBrowseStrip';
import { HawbFormatAutoPdf } from '../components/ReportCatalog/HawbFormatAutoPdf';
import { HblFormatBrowseStrip } from '../components/ReportCatalog/HblFormatBrowseStrip';
import { HblFormatAutoPdf } from '../components/ReportCatalog/HblFormatAutoPdf';
import { OtherReportsFormatBrowseStrip } from '../components/ReportCatalog/OtherReportsFormatBrowseStrip';
import { OtherReportsFormatAutoPdf } from '../components/ReportCatalog/OtherReportsFormatAutoPdf';
import { QuotationFormatBrowseStrip } from '../components/ReportCatalog/QuotationFormatBrowseStrip';
import { QuotationFormatAutoPdf } from '../components/ReportCatalog/QuotationFormatAutoPdf';
import { OpsListFormatBrowseStrip } from '../components/ReportCatalog/OpsListFormatBrowseStrip';
import { OpsListFormatAutoPdf } from '../components/ReportCatalog/OpsListFormatAutoPdf';
import { CommercialExtraFormatBrowseStrip } from '../components/ReportCatalog/CommercialExtraFormatBrowseStrip';
import { CommercialExtraFormatAutoPdf } from '../components/ReportCatalog/CommercialExtraFormatAutoPdf';
import { SeaDocsExtraFormatBrowseStrip } from '../components/ReportCatalog/SeaDocsExtraFormatBrowseStrip';
import { SeaDocsExtraFormatAutoPdf } from '../components/ReportCatalog/SeaDocsExtraFormatAutoPdf';
import { LeftoverFormatBrowseStrip } from '../components/ReportCatalog/LeftoverFormatBrowseStrip';
import { LeftoverFormatAutoPdf } from '../components/ReportCatalog/LeftoverFormatAutoPdf';
import { CatalogReportAutoPdf } from '../components/ReportCatalog/CatalogReportAutoPdf';
import { ReportGeneratePanel } from '../components/ReportCatalog/ReportGeneratePanel';
import { Button } from '@/components/ui/Button';
import {
  useImportReportTemplates,
  useReportTemplate,
  useReportTemplatesBrowse,
} from '../hooks/useReportCatalog';
import { isInvoiceReportFormatCode } from '../types/invoiceFormatPreview.types';
import { hasInvoiceFormatUiLayout } from '../data/invoiceFormatUiLayouts';
import { hasAccountsFormatUiLayout } from '../data/accountsFormatUiLayouts';
import { hasWmsFormatUiLayout } from '../data/wmsFormatUiLayouts';
import { hasArrivalNoticeFormatUiLayout } from '../data/arrivalNoticeFormatUiLayouts';
import { hasDeliveryOrderFormatUiLayout } from '../data/deliveryOrderFormatUiLayouts';
import { hasHawbFormatUiLayout } from '../data/hawbFormatUiLayouts';
import { hasHblFormatUiLayout } from '../data/hblFormatUiLayouts';
import { hasOtherReportsFormatUiLayout } from '../data/otherReportsFormatUiLayouts';
import { hasQuotationFormatUiLayout } from '../data/quotationFormatUiLayouts';
import { hasOpsListFormatUiLayout } from '../data/opsListFormatUiLayouts';
import { hasCommercialExtraFormatUiLayout } from '../data/commercialExtraFormatUiLayouts';
import { hasSeaDocsExtraFormatUiLayout } from '../data/seaDocsExtraFormatUiLayouts';
import { hasLeftoverFormatUiLayout } from '../data/leftoverFormatUiLayouts';
import {
  hasAnyFormatUiLayout,
  listAllRegisteredFormatCatalogEntries,
  resolveAnyFormatUiLayout,
} from '../data/resolveAnyFormatUiLayout';
import {
  isAccountsFormatCode,
  listAccountsFormats,
  accountsFormatsMatchSearch,
} from '../constants/accountsFormatCatalog';
import {
  isWmsFormatCode,
  listWmsFormats,
  wmsFormatsMatchSearch,
} from '../constants/wmsFormatCatalog';
import { invoiceFormatsMatchSearch } from '../constants/invoiceFormatCatalogNames';
import { listInvoiceFormatPreviews } from '../data/invoiceFormatPreviews';
import {
  getArrivalNoticeFormatSpec,
  isArrivalNoticeFormatCode,
  listArrivalNoticeFormats,
  arrivalNoticeFormatsMatchSearch,
} from '../constants/arrivalNoticeFormatCatalog';
import {
  getDeliveryOrderFormatSpec,
  isDeliveryOrderFormatCode,
  listDeliveryOrderFormats,
  deliveryOrderFormatsMatchSearch,
} from '../constants/deliveryOrderFormatCatalog';
import {
  getHawbFormatSpec,
  isHawbFormatCode,
  listHawbFormats,
  hawbFormatsMatchSearch,
} from '../constants/hawbFormatCatalog';
import {
  getHblFormatSpec,
  isHblFormatCode,
  listHblFormats,
  hblFormatsMatchSearch,
} from '../constants/hblFormatCatalog';
import {
  getOtherReportsFormatSpec,
  isOtherReportsFormatCode,
  listOtherReportsFormats,
  otherReportsFormatsMatchSearch,
} from '../constants/otherReportsFormatCatalog';
import {
  getQuotationFormatSpec,
  isQuotationFormatCode,
  listQuotationFormats,
  quotationFormatsMatchSearch,
} from '../constants/quotationFormatCatalog';
import {
  getOpsListFormatSpec,
  isOpsListFormatCode,
  listOpsListFormats,
  opsListFormatsMatchSearch,
} from '../constants/opsListFormatCatalog';
import {
  getCommercialExtraFormatSpec,
  isCommercialExtraFormatCode,
  listCommercialExtraFormats,
  commercialExtraFormatsMatchSearch,
} from '../constants/commercialExtraFormatCatalog';
import {
  getSeaDocsExtraFormatSpec,
  isSeaDocsExtraFormatCode,
  listSeaDocsExtraFormats,
  seaDocsExtraFormatsMatchSearch,
} from '../constants/seaDocsExtraFormatCatalog';
import {
  getLeftoverFormatSpec,
  isLeftoverFormatCode,
  leftoverFormatsMatchSearch,
} from '../constants/leftoverFormatCatalog';

const CATALOG_STATE_KEY = 'kfg-report-catalog-url';
const SEARCH_URL_DEBOUNCE_MS = 300;

/**
 * Report formats catalog — list all reports; click an invoice format to open its PDF.
 */
export default function ReportCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contextFilter = searchParams.get('context') || 'all';
  const jobId = searchParams.get('job_id') || undefined;
  const quotationId = searchParams.get('quotation_id') || undefined;
  const invoiceId = searchParams.get('invoice_id') || undefined;
  const partyId = searchParams.get('party_id') || undefined;
  const selectedCode = (searchParams.get('code') || '').trim();
  const family = ((searchParams.get('family') as ReportFamily) || 'all') as ReportFamily | 'all';

  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const searchQuery = searchInput.trim();
  /** Debounced query for API + URL — input itself stays immediate. */
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [restoredOnce, setRestoredOnce] = useState(false);
  const lastWrittenQRef = useRef(searchParams.get('q') || '');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const importTemplates = useImportReportTemplates();

  const reportContext = useMemo(
    () => ({
      job_id: jobId,
      quotation_id: quotationId,
      invoice_id: invoiceId,
      party_id: partyId,
    }),
    [jobId, quotationId, invoiceId, partyId],
  );

  const patchParams = (updates: Record<string, string | null | undefined>, replace = true) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (
        value == null ||
        value === '' ||
        (key === 'page' && value === '1') ||
        (key === 'family' && value === 'all') ||
        (key === 'context' && value === 'all')
      ) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next, { replace });
  };

  useEffect(() => {
    if (restoredOnce) return;
    setRestoredOnce(true);
    const hasBrowseState =
      Boolean(searchParams.get('code')) ||
      Boolean(searchParams.get('q')) ||
      Boolean(searchParams.get('family')) ||
      Boolean(searchParams.get('context'));
    if (hasBrowseState) return;
    try {
      const saved =
        localStorage.getItem(CATALOG_STATE_KEY) || sessionStorage.getItem(CATALOG_STATE_KEY);
      if (!saved) return;
      const restored = new URLSearchParams(saved);
      for (const key of ['job_id', 'quotation_id', 'invoice_id', 'party_id', 'context'] as const) {
        const current = searchParams.get(key);
        if (current) restored.set(key, current);
      }
      if ([...restored.keys()].length === 0) return;
      const restoredQ = restored.get('q') || '';
      lastWrittenQRef.current = restoredQ;
      if (restoredQ) {
        setSearchInput(restoredQ);
        setDebouncedSearch(restoredQ.trim());
      }
      setSearchParams(restored, { replace: true });
    } catch {
      /* ignore */
    }
  }, [restoredOnce, searchParams, setSearchParams]);

  useEffect(() => {
    try {
      const serialized = searchParams.toString();
      localStorage.setItem(CATALOG_STATE_KEY, serialized);
      sessionStorage.setItem(CATALOG_STATE_KEY, serialized);
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  // One debounce: API search + URL `q` (does not rewrite the input while typing).
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
      lastWrittenQRef.current = searchQuery;
      const current = searchParams.get('q') || '';
      if (searchQuery !== current) {
        patchParams({ q: searchQuery || null, page: '1' });
      }
    }, SEARCH_URL_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // External URL `q` only (back/forward / deep-link).
  useEffect(() => {
    const qFromUrl = searchParams.get('q') || '';
    if (qFromUrl === lastWrittenQRef.current) return;
    lastWrittenQRef.current = qFromUrl;
    setSearchInput(qFromUrl);
    setDebouncedSearch(qFromUrl.trim());
  }, [searchParams]);

  // Dynamic search via GET /reports/templates?search=… (debounced).
  const browseParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      family,
      context: contextFilter,
      includeInactive: true,
    }),
    [debouncedSearch, family, contextFilter],
  );

  const liveBrowse = useReportTemplatesBrowse(browseParams, true);
  const selectedDetail = useReportTemplate(selectedCode, Boolean(selectedCode));

  const backendUnavailable = liveBrowse.data?.backendUnavailable;

  const registeredLayoutEntries = useMemo(() => listAllRegisteredFormatCatalogEntries(), []);
  const items = useMemo(() => {
    // Catalogue browse = every permanent JSON layout (section-wise family groups below).
    return registeredLayoutEntries
      .filter((spec) => {
        if (family !== 'all' && family !== spec.family) return false;
        const ctxs = spec.contexts ?? ['job'];
        if (contextFilter === 'all') return true;
        return ctxs.includes(
          contextFilter as 'job' | 'quotation' | 'list' | 'invoice' | 'gl' | 'wms' | 'party',
        );
      })
      .filter((spec) =>
        reportTemplateMatchesSearch(
          { name: spec.name, code: spec.code, description: spec.kind },
          searchQuery,
        ),
      )
      .map((spec, i) =>
        metaToTemplate(
          {
            code: spec.code,
            name: spec.name,
            family: spec.family,
            contexts: spec.contexts.length ? spec.contexts : ['job'],
            formats: ['PDF'],
            rolloutPhase: 3,
            gapStatus: 'partial_document_pdf',
            description: `Layout PDF: ${spec.name}`,
            defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
          },
          i,
        ),
      );
  }, [registeredLayoutEntries, searchQuery, family, contextFilter]);
  const metaTotal = items.length;
  const layoutRegistryTotal = registeredLayoutEntries.length;
  const listLoading = false;

  const familyOptions = useMemo(() => {
    const fromApi = new Set<string>();
    for (const t of items) fromApi.add(t.family);
    const base = fromApi.size > 0 ? [...fromApi].sort() : [...REPORT_TEMPLATE_FAMILY_ENUM];
    return ['all', ...base];
  }, [items]);

  const selected = useMemo(() => {
    if (!selectedCode) return null;
    const fromList = items.find((t) => t.code === selectedCode);
    if (fromList) return fromList;
    const meta = filterRegistry({}).find((t) => t.code === selectedCode);
    if (meta) return metaToTemplate(meta, 0);
    if (selectedDetail.data) return selectedDetail.data;

    // Format-catalog fallback when API has not imported the code yet.
    if (isInvoiceReportFormatCode(selectedCode)) {
      const row = listInvoiceFormatPreviews().find((r) => r.code === selectedCode);
      if (row) {
        return metaToTemplate(
          {
            code: row.code,
            name: row.name,
            family: 'commercial',
            contexts: ['invoice'],
            formats: ['PDF'],
            rolloutPhase: 3,
            gapStatus: 'partial_document_pdf',
            description: `FRESA sample: ${row.name}`,
            defaultParams: [
              { name: 'invoice_id', label: 'Invoice', type: 'uuid', required: true },
            ],
          },
          0,
        );
      }
    }
    const accounts = isAccountsFormatCode(selectedCode)
      ? listAccountsFormats().find((r) => r.code === selectedCode)
      : undefined;
    if (accounts) {
      return metaToTemplate(
        {
          code: accounts.code,
          name: accounts.name,
          family: 'finance',
          contexts: ['gl'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${accounts.name}`,
          defaultParams: [],
        },
        0,
      );
    }
    const wms = isWmsFormatCode(selectedCode)
      ? listWmsFormats().find((r) => r.code === selectedCode)
      : undefined;
    if (wms) {
      return metaToTemplate(
        {
          code: wms.code,
          name: wms.name,
          family: 'wms',
          contexts: ['wms'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${wms.name}`,
          defaultParams: [],
        },
        0,
      );
    }
    const arrival = getArrivalNoticeFormatSpec(selectedCode);
    if (arrival) {
      return metaToTemplate(
        {
          code: arrival.code,
          name: arrival.name,
          family: arrival.family,
          contexts: ['job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${arrival.name}`,
          defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }
    const delivery = getDeliveryOrderFormatSpec(selectedCode);
    if (delivery) {
      return metaToTemplate(
        {
          code: delivery.code,
          name: delivery.name,
          family: delivery.family,
          contexts: ['job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${delivery.name}`,
          defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }
    const hawb = getHawbFormatSpec(selectedCode);
    if (hawb) {
      return metaToTemplate(
        {
          code: hawb.code,
          name: hawb.name,
          family: hawb.family,
          contexts: ['job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${hawb.name}`,
          defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }
    const hbl = getHblFormatSpec(selectedCode);
    if (hbl) {
      return metaToTemplate(
        {
          code: hbl.code,
          name: hbl.name,
          family: hbl.family,
          contexts: ['job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${hbl.name}`,
          defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }
    const other = getOtherReportsFormatSpec(selectedCode);
    if (other) {
      return metaToTemplate(
        {
          code: other.code,
          name: other.name,
          family: other.family,
          contexts: other.contexts ?? ['job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${other.name}`,
          defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }
    const quotation = getQuotationFormatSpec(selectedCode);
    if (quotation) {
      return metaToTemplate(
        {
          code: quotation.code,
          name: quotation.name,
          family: 'quotation',
          contexts: ['quotation'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${quotation.name}`,
          defaultParams: [
            { name: 'quotation_id', label: 'Quotation', type: 'uuid', required: true },
          ],
        },
        0,
      );
    }
    const opsList = getOpsListFormatSpec(selectedCode);
    if (opsList) {
      return metaToTemplate(
        {
          code: opsList.code,
          name: opsList.name,
          family: 'ops_list',
          contexts: ['list', 'job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${opsList.name}`,
          defaultParams: [],
        },
        0,
      );
    }
    const commercialExtra = getCommercialExtraFormatSpec(selectedCode);
    if (commercialExtra) {
      return metaToTemplate(
        {
          code: commercialExtra.code,
          name: commercialExtra.name,
          family: 'commercial',
          contexts: ['invoice'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${commercialExtra.name}`,
          defaultParams: [
            { name: 'invoice_id', label: 'Invoice', type: 'uuid', required: true },
          ],
        },
        0,
      );
    }
    const seaExtra = getSeaDocsExtraFormatSpec(selectedCode);
    if (seaExtra) {
      return metaToTemplate(
        {
          code: seaExtra.code,
          name: seaExtra.name,
          family: seaExtra.family,
          contexts: ['job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `FRESA sample: ${seaExtra.name}`,
          defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }
    const leftover = getLeftoverFormatSpec(selectedCode);
    if (leftover) {
      return metaToTemplate(
        {
          code: leftover.code,
          name: leftover.name,
          family: leftover.family,
          contexts: leftover.contexts,
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `Leftover sample: ${leftover.name}`,
          defaultParams:
            leftover.contexts[0] === 'invoice'
              ? [{ name: 'invoice_id', label: 'Invoice', type: 'uuid', required: true }]
              : [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }

    const layout = resolveAnyFormatUiLayout(selectedCode);
    if (layout) {
      const entry = registeredLayoutEntries.find(
        (r) => r.code.toUpperCase() === selectedCode.toUpperCase(),
      );
      return metaToTemplate(
        {
          code: layout.code,
          name: layout.name || selectedCode,
          family: entry?.family || 'other',
          contexts: entry?.contexts?.length ? entry.contexts : ['job'],
          formats: ['PDF'],
          rolloutPhase: 3,
          gapStatus: 'partial_document_pdf',
          description: `Layout PDF: ${layout.name || selectedCode}`,
          defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
        },
        0,
      );
    }
    return null;
  }, [selectedCode, items, selectedDetail.data, registeredLayoutEntries]);

  const selectTemplate = (t: ReportTemplate) => {
    patchParams({ code: t.code }, false);
  };

  const selectInvoiceFormatCode = (code: string) => {
    patchParams(
      {
        code,
        family: 'commercial',
        context: 'invoice',
      },
      false,
    );
  };

  const selectAccountsFormatCode = (code: string) => {
    patchParams(
      {
        code,
        family: 'finance',
        context: 'gl',
      },
      false,
    );
  };

  const selectWmsFormatCode = (code: string) => {
    patchParams(
      {
        code,
        family: 'wms',
        context: 'wms',
      },
      false,
    );
  };

  const selectArrivalNoticeFormatCode = (code: string) => {
    const spec = getArrivalNoticeFormatSpec(code);
    patchParams(
      {
        code,
        family: spec?.family || 'sea_docs',
        context: 'job',
      },
      false,
    );
  };

  const selectDeliveryOrderFormatCode = (code: string) => {
    const spec = getDeliveryOrderFormatSpec(code);
    patchParams(
      {
        code,
        family: spec?.family || 'sea_docs',
        context: 'job',
      },
      false,
    );
  };

  const selectHawbFormatCode = (code: string) => {
    const spec = getHawbFormatSpec(code);
    patchParams(
      {
        code,
        family: spec?.family || 'air_docs',
        context: 'job',
      },
      false,
    );
  };

  const selectHblFormatCode = (code: string) => {
    const spec = getHblFormatSpec(code);
    patchParams(
      {
        code,
        family: spec?.family || 'sea_docs',
        context: 'job',
      },
      false,
    );
  };

  const selectOtherReportsFormatCode = (code: string) => {
    const spec = getOtherReportsFormatSpec(code);
    patchParams(
      {
        code,
        family: spec?.family || 'sea_docs',
        context: spec?.contexts?.[0] || 'job',
      },
      false,
    );
  };

  const selectQuotationFormatCode = (code: string) => {
    patchParams({ code, family: 'quotation', context: 'quotation' }, false);
  };

  const selectOpsListFormatCode = (code: string) => {
    patchParams({ code, family: 'ops_list', context: 'list' }, false);
  };

  const selectCommercialExtraFormatCode = (code: string) => {
    patchParams({ code, family: 'commercial', context: 'invoice' }, false);
  };

  const selectSeaDocsExtraFormatCode = (code: string) => {
    const spec = getSeaDocsExtraFormatSpec(code);
    patchParams(
      {
        code,
        family: spec?.family || 'sea_docs',
        context: 'job',
      },
      false,
    );
  };

  const selectLeftoverFormatCode = (code: string) => {
    const spec = getLeftoverFormatSpec(code);
    patchParams(
      {
        code,
        family: spec?.family || 'commercial',
        context: spec?.contexts?.[0] || 'invoice',
      },
      false,
    );
  };

  const searchActive = tokenizeReportSearch(searchQuery).length > 0;

  const showInvoiceFormatStrip =
    (family === 'all' ||
      family === 'commercial' ||
      contextFilter === 'invoice' ||
      Boolean(invoiceId) ||
      isInvoiceReportFormatCode(selectedCode)) &&
    (!searchActive ||
      invoiceFormatsMatchSearch(searchQuery) ||
      isInvoiceReportFormatCode(selectedCode));

  const showAccountsFormatStrip =
    (family === 'all' ||
      family === 'finance' ||
      contextFilter === 'gl' ||
      isAccountsFormatCode(selectedCode)) &&
    (!searchActive ||
      accountsFormatsMatchSearch(searchQuery) ||
      isAccountsFormatCode(selectedCode));

  const showWmsFormatStrip =
    (family === 'all' ||
      family === 'wms' ||
      contextFilter === 'wms' ||
      isWmsFormatCode(selectedCode)) &&
    (!searchActive || wmsFormatsMatchSearch(searchQuery) || isWmsFormatCode(selectedCode));

  const showArrivalNoticeFormatStrip =
    (family === 'all' ||
      family === 'sea_docs' ||
      family === 'air_docs' ||
      isArrivalNoticeFormatCode(selectedCode)) &&
    (!searchActive ||
      arrivalNoticeFormatsMatchSearch(searchQuery) ||
      isArrivalNoticeFormatCode(selectedCode));

  const showDeliveryOrderFormatStrip =
    (family === 'all' ||
      family === 'sea_docs' ||
      family === 'air_docs' ||
      isDeliveryOrderFormatCode(selectedCode)) &&
    (!searchActive ||
      deliveryOrderFormatsMatchSearch(searchQuery) ||
      isDeliveryOrderFormatCode(selectedCode));

  const showHawbFormatStrip =
    (family === 'all' || family === 'air_docs' || isHawbFormatCode(selectedCode)) &&
    (!searchActive || hawbFormatsMatchSearch(searchQuery) || isHawbFormatCode(selectedCode));

  const showHblFormatStrip =
    (family === 'all' || family === 'sea_docs' || isHblFormatCode(selectedCode)) &&
    (!searchActive || hblFormatsMatchSearch(searchQuery) || isHblFormatCode(selectedCode));

  const showOtherReportsFormatStrip =
    (family === 'all' ||
      family === 'sea_docs' ||
      family === 'air_docs' ||
      family === 'quotation' ||
      family === 'ops_list' ||
      family === 'other' ||
      family === 'commercial' ||
      isOtherReportsFormatCode(selectedCode)) &&
    (!searchActive ||
      otherReportsFormatsMatchSearch(searchQuery) ||
      isOtherReportsFormatCode(selectedCode));

  const showQuotationFormatStrip =
    (family === 'all' || family === 'quotation' || isQuotationFormatCode(selectedCode)) &&
    (!searchActive ||
      quotationFormatsMatchSearch(searchQuery) ||
      isQuotationFormatCode(selectedCode));

  const showOpsListFormatStrip =
    (family === 'all' || family === 'ops_list' || isOpsListFormatCode(selectedCode)) &&
    (!searchActive ||
      opsListFormatsMatchSearch(searchQuery) ||
      isOpsListFormatCode(selectedCode));

  const showCommercialExtraFormatStrip =
    (family === 'all' ||
      family === 'commercial' ||
      isCommercialExtraFormatCode(selectedCode)) &&
    (!searchActive ||
      commercialExtraFormatsMatchSearch(searchQuery) ||
      isCommercialExtraFormatCode(selectedCode));

  const showSeaDocsExtraFormatStrip =
    (family === 'all' ||
      family === 'sea_docs' ||
      family === 'air_docs' ||
      isSeaDocsExtraFormatCode(selectedCode)) &&
    (!searchActive ||
      seaDocsExtraFormatsMatchSearch(searchQuery) ||
      isSeaDocsExtraFormatCode(selectedCode));

  const showLeftoverFormatStrip =
    (family === 'all' ||
      family === 'commercial' ||
      family === 'sea_docs' ||
      family === 'other' ||
      isLeftoverFormatCode(selectedCode)) &&
    (!searchActive ||
      leftoverFormatsMatchSearch(searchQuery) ||
      isLeftoverFormatCode(selectedCode));

  const isInvoiceSelected = isInvoiceReportFormatCode(selectedCode);
  const isAccountsSelected = isAccountsFormatCode(selectedCode);
  const isWmsSelected = isWmsFormatCode(selectedCode);
  const isArrivalNoticeSelected = isArrivalNoticeFormatCode(selectedCode);
  const isDeliveryOrderSelected = isDeliveryOrderFormatCode(selectedCode);
  const isHawbSelected = isHawbFormatCode(selectedCode);
  const isHblSelected = isHblFormatCode(selectedCode);
  const isOtherReportsSelected = isOtherReportsFormatCode(selectedCode);
  const isQuotationSelected = isQuotationFormatCode(selectedCode);
  const isOpsListSelected = isOpsListFormatCode(selectedCode);
  const isCommercialExtraSelected = isCommercialExtraFormatCode(selectedCode);
  const isSeaDocsExtraSelected = isSeaDocsExtraFormatCode(selectedCode);
  const isLeftoverSelected = isLeftoverFormatCode(selectedCode);
  const hasInvoiceLayout = isInvoiceSelected && hasInvoiceFormatUiLayout(selectedCode);
  const hasAccountsLayout = isAccountsSelected && hasAccountsFormatUiLayout(selectedCode);
  const hasWmsLayout = isWmsSelected && hasWmsFormatUiLayout(selectedCode);
  const hasArrivalNoticeLayout =
    isArrivalNoticeSelected && hasArrivalNoticeFormatUiLayout(selectedCode);
  const hasDeliveryOrderLayout =
    isDeliveryOrderSelected && hasDeliveryOrderFormatUiLayout(selectedCode);
  const hasHawbLayout = isHawbSelected && hasHawbFormatUiLayout(selectedCode);
  const hasHblLayout = isHblSelected && hasHblFormatUiLayout(selectedCode);
  const hasOtherReportsLayout =
    isOtherReportsSelected && hasOtherReportsFormatUiLayout(selectedCode);
  const hasQuotationLayout = isQuotationSelected && hasQuotationFormatUiLayout(selectedCode);
  const hasOpsListLayout = isOpsListSelected && hasOpsListFormatUiLayout(selectedCode);
  const hasCommercialExtraLayout =
    isCommercialExtraSelected && hasCommercialExtraFormatUiLayout(selectedCode);
  const hasSeaDocsExtraLayout =
    isSeaDocsExtraSelected && hasSeaDocsExtraFormatUiLayout(selectedCode);
  const hasLeftoverLayout = isLeftoverSelected && hasLeftoverFormatUiLayout(selectedCode);
  const hasRegisteredLayout = Boolean(selectedCode) && hasAnyFormatUiLayout(selectedCode);
  const showSpecificAutoPdf =
    hasInvoiceLayout ||
    hasAccountsLayout ||
    hasWmsLayout ||
    hasArrivalNoticeLayout ||
    hasDeliveryOrderLayout ||
    hasHawbLayout ||
    hasHblLayout ||
    hasOtherReportsLayout ||
    hasQuotationLayout ||
    hasOpsListLayout ||
    hasCommercialExtraLayout ||
    hasSeaDocsExtraLayout ||
    hasLeftoverLayout;

  return (
    <div className="space-y-4">
      <PageBackLink to="/reports" label="Back to Reports" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Report catalogue</h2>
          <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">
            {metaTotal} of {layoutRegistryTotal} registered layout PDFs — section catalogues above;
            click any row or strip to open a preview.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={importTemplates.isPending}
            onClick={() => {
              setImportMessage(null);
              importTemplates.mutate(undefined, {
                onSuccess: (result) => {
                  const inserted = result?.inserted ?? 0;
                  const updated = result?.updated ?? 0;
                  const skipped = result?.skipped ?? 0;
                  setImportMessage(
                    result?.message ||
                      `Import finished: ${inserted} inserted, ${updated} updated, ${skipped} skipped.`,
                  );
                },
                onError: (err) => {
                  setImportMessage(
                    err instanceof Error ? err.message : 'Import registry failed.',
                  );
                },
              });
            }}
          >
            {importTemplates.isPending ? 'Importing…' : 'Import registry'}
          </Button>
          {importMessage ? (
            <p
              role="status"
              className={`text-xs ${
                importTemplates.isError
                  ? 'text-[var(--color-danger-600)]'
                  : 'text-[var(--color-neutral-500)]'
              }`}
            >
              {importMessage}
            </p>
          ) : null}
        </div>
      </div>

      {liveBrowse.isError && !backendUnavailable ? (
        <p role="alert" className="text-sm text-[var(--color-danger-600)]">
          Could not load reports. Showing local list.
        </p>
      ) : null}

      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative min-w-0 flex-1">
            <label
              className="mb-1 block text-xs font-medium text-[var(--color-neutral-500)]"
              htmlFor="report-catalog-search"
            >
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-primary-500)]" />
              <Input
                id="report-catalog-search"
                className="h-10 border-[var(--color-neutral-200)] bg-white pl-9 shadow-sm focus-visible:border-[var(--color-secondary)]"
                placeholder="Search report formats by name or code…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0">
            <div className="min-w-[9.5rem] space-y-1">
              <label
                className="text-xs font-medium text-[var(--color-neutral-500)]"
                htmlFor="family"
              >
                Family
              </label>
              <select
                id="family"
                className="h-10 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[var(--color-secondary)]"
                value={family}
                onChange={(e) => patchParams({ family: e.target.value, page: '1' })}
              >
                {familyOptions.map((f) => (
                  <option key={f} value={f}>
                    {f === 'all' ? 'All families' : reportFamilyLabel(f)}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[9.5rem] space-y-1">
              <label
                className="text-xs font-medium text-[var(--color-neutral-500)]"
                htmlFor="context"
              >
                Context
              </label>
              <select
                id="context"
                className="h-10 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[var(--color-secondary)]"
                value={contextFilter}
                onChange={(e) => patchParams({ context: e.target.value, page: '1' })}
              >
                <option value="all">All contexts</option>
                {REPORT_TEMPLATE_CONTEXT_ENUM.map((k) => (
                  <option key={k} value={k}>
                    {reportContextLabel(k)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <InvoiceFormatBrowseStrip
        visible={showInvoiceFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectInvoiceFormatCode}
        searchQuery={searchQuery}
      />

      <AccountsFormatBrowseStrip
        visible={showAccountsFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectAccountsFormatCode}
        searchQuery={searchQuery}
      />

      <WmsFormatBrowseStrip
        visible={showWmsFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectWmsFormatCode}
        searchQuery={searchQuery}
      />

      <ArrivalNoticeFormatBrowseStrip
        visible={showArrivalNoticeFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectArrivalNoticeFormatCode}
        searchQuery={searchQuery}
      />

      <DeliveryOrderFormatBrowseStrip
        visible={showDeliveryOrderFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectDeliveryOrderFormatCode}
        searchQuery={searchQuery}
      />

      <HawbFormatBrowseStrip
        visible={showHawbFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectHawbFormatCode}
        searchQuery={searchQuery}
      />

      <HblFormatBrowseStrip
        visible={showHblFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectHblFormatCode}
        searchQuery={searchQuery}
      />

      <OtherReportsFormatBrowseStrip
        visible={showOtherReportsFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectOtherReportsFormatCode}
        searchQuery={searchQuery}
      />

      <QuotationFormatBrowseStrip
        visible={showQuotationFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectQuotationFormatCode}
        searchQuery={searchQuery}
      />

      <OpsListFormatBrowseStrip
        visible={showOpsListFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectOpsListFormatCode}
        searchQuery={searchQuery}
      />

      <CommercialExtraFormatBrowseStrip
        visible={showCommercialExtraFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectCommercialExtraFormatCode}
        searchQuery={searchQuery}
      />

      <SeaDocsExtraFormatBrowseStrip
        visible={showSeaDocsExtraFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectSeaDocsExtraFormatCode}
        searchQuery={searchQuery}
      />

      <LeftoverFormatBrowseStrip
        visible={showLeftoverFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectLeftoverFormatCode}
        searchQuery={searchQuery}
      />

      <ReportCatalogBrowseList
        items={items}
        selectedCode={selectedCode}
        onSelect={selectTemplate}
        loading={listLoading}
        emptyHint="No reports match these filters."
      />

      {hasInvoiceLayout ? (
        <InvoiceFormatAutoPdf code={selectedCode} invoiceId={invoiceId} />
      ) : hasAccountsLayout ? (
        <AccountsFormatAutoPdf code={selectedCode} />
      ) : hasWmsLayout ? (
        <WmsFormatAutoPdf code={selectedCode} />
      ) : hasArrivalNoticeLayout ? (
        <ArrivalNoticeFormatAutoPdf code={selectedCode} />
      ) : hasDeliveryOrderLayout ? (
        <DeliveryOrderFormatAutoPdf code={selectedCode} />
      ) : hasHawbLayout ? (
        <HawbFormatAutoPdf code={selectedCode} />
      ) : hasHblLayout ? (
        <HblFormatAutoPdf code={selectedCode} />
      ) : hasOtherReportsLayout ? (
        <OtherReportsFormatAutoPdf code={selectedCode} />
      ) : hasQuotationLayout ? (
        <QuotationFormatAutoPdf code={selectedCode} />
      ) : hasOpsListLayout ? (
        <OpsListFormatAutoPdf code={selectedCode} />
      ) : hasCommercialExtraLayout ? (
        <CommercialExtraFormatAutoPdf code={selectedCode} />
      ) : hasSeaDocsExtraLayout ? (
        <SeaDocsExtraFormatAutoPdf code={selectedCode} />
      ) : hasLeftoverLayout ? (
        <LeftoverFormatAutoPdf code={selectedCode} />
      ) : hasRegisteredLayout ? (
        <CatalogReportAutoPdf code={selectedCode} invoiceId={invoiceId} />
      ) : null}

      {selected && !hasRegisteredLayout && !showSpecificAutoPdf ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No layout PDF is registered for this report yet. Use Import registry / bind pack to
          generate from the backend when available.
        </p>
      ) : null}

      {selected ? (
        <ReportGeneratePanel
          template={selected}
          context={reportContext}
          discoveryMode
          omitClientPreview
          onClose={() => patchParams({ code: null }, false)}
        />
      ) : null}

      {(jobId || quotationId || invoiceId || partyId) && (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Opened with context
          {invoiceId ? ' · invoice' : ''}
          {jobId ? ' · job' : ''}
          {quotationId ? ' · quotation' : ''}
          {partyId ? ' · party' : ''}
        </p>
      )}
    </div>
  );
}
