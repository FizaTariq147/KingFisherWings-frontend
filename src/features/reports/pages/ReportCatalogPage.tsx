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
import { isInvoiceReportFormatCode } from '../types/invoiceFormatPreview.types';
import { hasInvoiceFormatUiLayout } from '../data/invoiceFormatUiLayouts';
import { hasAccountsFormatUiLayout } from '../data/accountsFormatUiLayouts';
import { isAccountsFormatCode } from '../constants/accountsFormatCatalog';

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
  const items = backendUnavailable || liveBrowse.isError ? localItems : liveItems;
  const metaTotal =
    backendUnavailable || liveBrowse.isError
      ? localItems.length
      : (liveBrowse.data?.meta.total ?? localItems.length);
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

  const showInvoiceFormatStrip =
    family === 'commercial' ||
    contextFilter === 'invoice' ||
    Boolean(invoiceId) ||
    isInvoiceReportFormatCode(selectedCode);

  const showAccountsFormatStrip =
    family === 'finance' ||
    contextFilter === 'gl' ||
    isAccountsFormatCode(selectedCode);

  const isInvoiceSelected = isInvoiceReportFormatCode(selectedCode);
  const isAccountsSelected = isAccountsFormatCode(selectedCode);
  const hasInvoiceLayout = isInvoiceSelected && hasInvoiceFormatUiLayout(selectedCode);
  const hasAccountsLayout = isAccountsSelected && hasAccountsFormatUiLayout(selectedCode);

  return (
    <div className="space-y-4">
      <PageBackLink to="/reports" label="Back to Reports" />

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Report formats</h2>
        <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">
          {metaTotal} reports — open an Invoice or Accounts format to preview its PDF.
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
      />

      <AccountsFormatBrowseStrip
        visible={showAccountsFormatStrip}
        selectedCode={selectedCode || undefined}
        onSelect={selectAccountsFormatCode}
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
      ) : selected && !isInvoiceSelected && !isAccountsSelected ? (
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
