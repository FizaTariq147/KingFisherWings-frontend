import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import {
  REPORT_TEMPLATE_CONTEXT_ENUM,
  REPORT_TEMPLATE_FAMILY_ENUM,
} from '../api/reportCatalog.api';
import { filterRegistry } from '../data/fresaReportRegistry';
import { useReportTemplate, useReportTemplatesBrowse } from '../hooks/useReportCatalog';
import type { ReportFamily, ReportTemplate } from '../types/reportCatalog.types';
import { reportContextLabel, reportFamilyLabel } from '../types/reportCatalog.types';
import { metaToTemplate } from '../utils/normalizeReportCatalog';
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
import { isInvoiceReportFormatCode } from '../types/invoiceFormatPreview.types';
import { hasInvoiceFormatUiLayout } from '../data/invoiceFormatUiLayouts';
import { hasAccountsFormatUiLayout } from '../data/accountsFormatUiLayouts';
import { hasWmsFormatUiLayout } from '../data/wmsFormatUiLayouts';
import { hasArrivalNoticeFormatUiLayout } from '../data/arrivalNoticeFormatUiLayouts';
import { hasDeliveryOrderFormatUiLayout } from '../data/deliveryOrderFormatUiLayouts';
import { hasHawbFormatUiLayout } from '../data/hawbFormatUiLayouts';
import { hasHblFormatUiLayout } from '../data/hblFormatUiLayouts';
import { hasOtherReportsFormatUiLayout } from '../data/otherReportsFormatUiLayouts';
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

const CATALOG_STATE_KEY = 'kfg-report-catalog-url';

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

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [restoredOnce, setRestoredOnce] = useState(false);

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

  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const current = searchParams.get('q') || '';
    if (deferredSearch === current) return;
    patchParams({ q: deferredSearch || null, page: '1' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch]);

  const browseParams = useMemo(
    () => ({
      search: deferredSearch || undefined,
      family,
      context: contextFilter,
      includeInactive: true,
    }),
    [deferredSearch, family, contextFilter],
  );

  const liveBrowse = useReportTemplatesBrowse(browseParams, true);
  const selectedDetail = useReportTemplate(selectedCode, Boolean(selectedCode));

  const backendUnavailable = liveBrowse.data?.backendUnavailable;

  const localItems = useMemo(() => {
    const filtered = filterRegistry({
      search: deferredSearch || undefined,
      family,
      context: contextFilter,
    });
    return filtered.map((meta, i) => metaToTemplate(meta, i));
  }, [deferredSearch, family, contextFilter]);

  const liveItems = liveBrowse.data?.items ?? [];
  const items = useMemo(() => {
    const base = backendUnavailable || liveBrowse.isError ? localItems : liveItems;
    const q = deferredSearch.trim().toLowerCase();
    const qTokens = q ? q.split(/\s+/).filter(Boolean) : [];
    const pinInvoice =
      Boolean(qTokens.length) && invoiceFormatsMatchSearch(deferredSearch);
    const pinAccounts =
      Boolean(qTokens.length) && accountsFormatsMatchSearch(deferredSearch);
    const pinWms = Boolean(qTokens.length) && wmsFormatsMatchSearch(deferredSearch);
    const pinArrival =
      Boolean(qTokens.length) && arrivalNoticeFormatsMatchSearch(deferredSearch);
    const pinDelivery =
      Boolean(qTokens.length) && deliveryOrderFormatsMatchSearch(deferredSearch);
    const pinHawb = Boolean(qTokens.length) && hawbFormatsMatchSearch(deferredSearch);
    const pinHbl = Boolean(qTokens.length) && hblFormatsMatchSearch(deferredSearch);
    // Always surface Other Reports in the catalogue list (filter by family/context/search).
    const pinOther = !qTokens.length || otherReportsFormatsMatchSearch(deferredSearch);

    const pinSpecList = (
      specs: Array<{
        code: string;
        name: string;
        family:
          | 'sea_docs'
          | 'air_docs'
          | 'other'
          | 'quotation'
          | 'ops_list'
          | 'commercial'
          | 'finance'
          | 'wms';
        kind: string;
        contexts?: Array<'job' | 'quotation' | 'list' | 'invoice' | 'gl' | 'wms'>;
      }>,
    ) =>
      specs
        .filter((spec) => family === 'all' || family === spec.family)
        .filter((spec) => {
          const ctxs = spec.contexts ?? ['job'];
          if (contextFilter === 'all') return true;
          return ctxs.includes(
            contextFilter as 'job' | 'quotation' | 'list' | 'invoice' | 'gl' | 'wms',
          );
        })
        .filter((spec) => {
          if (!qTokens.length) return true;
          const hay = `${spec.name} ${spec.code} ${spec.kind}`.toLowerCase();
          return qTokens.every((token) => hay.includes(token));
        })
        .map((spec, i) => {
          const existing = base.find((t) => t.code.toUpperCase() === spec.code.toUpperCase());
          if (existing) {
            return { ...existing, name: spec.name };
          }
          return metaToTemplate(
            {
              code: spec.code,
              name: spec.name,
              family: spec.family,
              contexts: spec.contexts ?? ['job'],
              formats: ['PDF'],
              rolloutPhase: 3,
              gapStatus: 'partial_document_pdf',
              description: `FRESA sample: ${spec.name}`,
              defaultParams: [{ name: 'job_id', label: 'Job', type: 'uuid', required: true }],
            },
            i,
          );
        });

    const pinnedInvoice = pinInvoice
      ? pinSpecList(
          listInvoiceFormatPreviews().map((row) => ({
            code: row.code,
            name: row.name,
            family: 'commercial' as const,
            kind: `invoice_${row.formatNumber}`,
            contexts: ['invoice'] as const,
          })),
        )
      : [];
    const pinnedAccounts = pinAccounts
      ? pinSpecList(
          listAccountsFormats().map((row) => ({
            ...row,
            family: 'finance' as const,
            contexts: ['gl'] as const,
          })),
        )
      : [];
    const pinnedWms = pinWms
      ? pinSpecList(
          listWmsFormats().map((row) => ({
            ...row,
            family: 'wms' as const,
            contexts: ['wms'] as const,
          })),
        )
      : [];
    const pinnedArrival = pinArrival ? pinSpecList(listArrivalNoticeFormats()) : [];
    const pinnedDelivery = pinDelivery ? pinSpecList(listDeliveryOrderFormats()) : [];
    const pinnedHawb = pinHawb ? pinSpecList(listHawbFormats()) : [];
    const pinnedHbl = pinHbl ? pinSpecList(listHblFormats()) : [];
    const pinnedOther = pinOther ? pinSpecList(listOtherReportsFormats()) : [];
    const pinned = [
      ...pinnedInvoice,
      ...pinnedAccounts,
      ...pinnedWms,
      ...pinnedOther,
      ...pinnedArrival,
      ...pinnedDelivery,
      ...pinnedHawb,
      ...pinnedHbl,
    ];

    const pinnedCodes = new Set(pinned.map((t) => t.code.toUpperCase()));
    const rest = base.filter((t) => !pinnedCodes.has(t.code.toUpperCase()));
    return [...pinned, ...rest];
  }, [
    backendUnavailable,
    liveBrowse.isError,
    localItems,
    liveItems,
    deferredSearch,
    family,
    contextFilter,
  ]);
  const metaTotal =
    backendUnavailable || liveBrowse.isError
      ? items.length
      : Math.max(liveBrowse.data?.meta.total ?? 0, items.length);
  const listLoading = !backendUnavailable && liveBrowse.isLoading;

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
    return meta ? metaToTemplate(meta, 0) : selectedDetail.data ?? null;
  }, [selectedCode, items, selectedDetail.data]);

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

  const showInvoiceFormatStrip =
    family === 'all' ||
    family === 'commercial' ||
    contextFilter === 'invoice' ||
    Boolean(invoiceId) ||
    isInvoiceReportFormatCode(selectedCode) ||
    invoiceFormatsMatchSearch(deferredSearch);

  const showAccountsFormatStrip =
    family === 'all' ||
    family === 'finance' ||
    contextFilter === 'gl' ||
    isAccountsFormatCode(selectedCode) ||
    accountsFormatsMatchSearch(deferredSearch);

  const showWmsFormatStrip =
    family === 'all' ||
    family === 'wms' ||
    contextFilter === 'wms' ||
    isWmsFormatCode(selectedCode) ||
    wmsFormatsMatchSearch(deferredSearch);

  const showArrivalNoticeFormatStrip =
    family === 'all' ||
    family === 'sea_docs' ||
    family === 'air_docs' ||
    isArrivalNoticeFormatCode(selectedCode) ||
    arrivalNoticeFormatsMatchSearch(deferredSearch);

  const showDeliveryOrderFormatStrip =
    family === 'all' ||
    family === 'sea_docs' ||
    family === 'air_docs' ||
    isDeliveryOrderFormatCode(selectedCode) ||
    deliveryOrderFormatsMatchSearch(deferredSearch);

  const showHawbFormatStrip =
    family === 'all' ||
    family === 'air_docs' ||
    isHawbFormatCode(selectedCode) ||
    hawbFormatsMatchSearch(deferredSearch);

  const showHblFormatStrip =
    family === 'all' ||
    family === 'sea_docs' ||
    isHblFormatCode(selectedCode) ||
    hblFormatsMatchSearch(deferredSearch);

  const showOtherReportsFormatStrip =
    family === 'all' ||
    family === 'sea_docs' ||
    family === 'air_docs' ||
    family === 'quotation' ||
    family === 'ops_list' ||
    family === 'other' ||
    family === 'commercial' ||
    isOtherReportsFormatCode(selectedCode) ||
    otherReportsFormatsMatchSearch(deferredSearch);

  const isInvoiceSelected = isInvoiceReportFormatCode(selectedCode);
  const isAccountsSelected = isAccountsFormatCode(selectedCode);
  const isWmsSelected = isWmsFormatCode(selectedCode);
  const isArrivalNoticeSelected = isArrivalNoticeFormatCode(selectedCode);
  const isDeliveryOrderSelected = isDeliveryOrderFormatCode(selectedCode);
  const isHawbSelected = isHawbFormatCode(selectedCode);
  const isHblSelected = isHblFormatCode(selectedCode);
  const isOtherReportsSelected = isOtherReportsFormatCode(selectedCode);
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

  return (
    <div className="space-y-4">
      <PageBackLink to="/reports" label="Back to Reports" />

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Report formats</h2>
        <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">
          {metaTotal} reports — open an Invoice, Accounts, WMS, Arrival Notice, Delivery Order, HAWB, HBL, or Other Reports format to preview its PDF.
        </p>
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
        searchQuery={deferredSearch}
      />

      <AccountsFormatBrowseStrip
        visible={showAccountsFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectAccountsFormatCode}
        searchQuery={deferredSearch}
      />

      <WmsFormatBrowseStrip
        visible={showWmsFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectWmsFormatCode}
        searchQuery={deferredSearch}
      />

      <ArrivalNoticeFormatBrowseStrip
        visible={showArrivalNoticeFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectArrivalNoticeFormatCode}
        searchQuery={deferredSearch}
      />

      <DeliveryOrderFormatBrowseStrip
        visible={showDeliveryOrderFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectDeliveryOrderFormatCode}
        searchQuery={deferredSearch}
      />

      <HawbFormatBrowseStrip
        visible={showHawbFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectHawbFormatCode}
        searchQuery={deferredSearch}
      />

      <HblFormatBrowseStrip
        visible={showHblFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectHblFormatCode}
        searchQuery={deferredSearch}
      />

      <OtherReportsFormatBrowseStrip
        visible={showOtherReportsFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectOtherReportsFormatCode}
        searchQuery={deferredSearch}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-sm">
        <ReportCatalogBrowseList
          items={items}
          selectedCode={selectedCode}
          onSelect={selectTemplate}
          loading={listLoading}
          emptyHint="No reports match these filters."
        />
      </div>

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
      ) : selected &&
        !isInvoiceSelected &&
        !isAccountsSelected &&
        !isWmsSelected &&
        !isArrivalNoticeSelected &&
        !isDeliveryOrderSelected &&
        !isHawbSelected &&
        !isHblSelected &&
        !isOtherReportsSelected ? (
        <p className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 text-sm text-[var(--color-neutral-600)]">
          {selected.name} — PDF layout for this report is provided by the backend when available.
        </p>
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
