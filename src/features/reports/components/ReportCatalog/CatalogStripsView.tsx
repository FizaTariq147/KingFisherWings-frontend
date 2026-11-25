import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { ReportTemplate } from '../../types/reportCatalog.types';
import { reportFamilyLabel } from '../../types/reportCatalog.types';
import type { InvoiceFitInput } from '../../engine/invoiceV2Applicability';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  filterCatalogStripsByFamily,
  filterCatalogStripsPartition,
  partitionCatalogStrips,
  type CatalogStripRow,
} from '../../utils/partitionCatalogStrips';
import { CatalogFormatRow } from './CatalogFormatRow';

const FAMILY_FILTER_KEY = 'kfg-catalog-strips-family';
const SEARCH_FILTER_KEY = 'kfg-catalog-strips-q';

type VirtualItem =
  | { kind: 'section'; id: string; title: string; count: number; collapsible: boolean; collapsed: boolean }
  | { kind: 'row'; id: string; row: CatalogStripRow; showUnsuitableReason: boolean }
  | { kind: 'empty'; id: string; message: string };

type CatalogStripsViewProps = {
  items: ReportTemplate[];
  selectedCode?: string;
  context?: ReportContextIds | null;
  invoiceCurrency?: InvoiceFitInput;
  loading?: boolean;
  /** Controlled search (page may own URL q). */
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  familyFilter?: string;
  onFamilyFilterChange?: (family: string) => void;
  familyOptions?: string[];
  recordLabel?: string | null;
  onPreview: (template: ReportTemplate) => void;
  onGenerate: (template: ReportTemplate) => void;
  onBrowseReference?: (template: ReportTemplate) => void;
};

/**
 * Redesigned strips catalogue: Recommended + other families (collapsed) + Not suitable.
 * Single-column, virtualized, searchable; thumbnails are OUR output only.
 */
export function CatalogStripsView({
  items,
  selectedCode,
  context,
  invoiceCurrency = null,
  loading = false,
  searchQuery: searchQueryProp,
  onSearchChange,
  familyFilter: familyFilterProp,
  onFamilyFilterChange,
  familyOptions,
  recordLabel,
  onPreview,
  onGenerate,
  onBrowseReference,
}: CatalogStripsViewProps) {
  const [localSearch, setLocalSearch] = useState(() => {
    if (searchQueryProp != null) return searchQueryProp;
    try {
      return localStorage.getItem(SEARCH_FILTER_KEY) || '';
    } catch {
      return '';
    }
  });
  const [localFamily, setLocalFamily] = useState(() => {
    if (familyFilterProp != null) return familyFilterProp;
    try {
      return localStorage.getItem(FAMILY_FILTER_KEY) || 'all';
    } catch {
      return 'all';
    }
  });
  // Invoice deep-links need the full list visible (not buried under a collapsed "More").
  const [moreFormatsCollapsed, setMoreFormatsCollapsed] = useState(
    () => context?.invoice_id == null,
  );
  const [notSuitableCollapsed, setNotSuitableCollapsed] = useState(true);

  const searchQuery = searchQueryProp ?? localSearch;
  const familyFilter = familyFilterProp ?? localFamily;

  const setSearch = (q: string) => {
    if (onSearchChange) onSearchChange(q);
    else setLocalSearch(q);
    try {
      localStorage.setItem(SEARCH_FILTER_KEY, q);
    } catch {
      /* ignore */
    }
  };

  const setFamily = (f: string) => {
    if (onFamilyFilterChange) onFamilyFilterChange(f);
    else setLocalFamily(f);
    try {
      localStorage.setItem(FAMILY_FILTER_KEY, f);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (searchQueryProp != null) setLocalSearch(searchQueryProp);
  }, [searchQueryProp]);

  useEffect(() => {
    if (familyFilterProp != null) setLocalFamily(familyFilterProp);
  }, [familyFilterProp]);

  const basePartition = useMemo(
    () => partitionCatalogStrips(items, { invoiceCurrency }),
    [items, invoiceCurrency],
  );

  const filtered = useMemo(() => {
    const byFamily = filterCatalogStripsByFamily(basePartition, familyFilter);
    return filterCatalogStripsPartition(byFamily, searchQuery);
  }, [basePartition, familyFilter, searchQuery]);

  const derivedFamilies = useMemo(() => {
    if (familyOptions?.length) return familyOptions;
    const set = new Set<string>();
    for (const t of items) if (t.family) set.add(t.family);
    return ['all', ...[...set].sort()];
  }, [familyOptions, items]);

  const virtualItems = useMemo((): VirtualItem[] => {
    const out: VirtualItem[] = [];
    const rec = filtered.recommended;
    out.push({
      kind: 'section',
      id: 'sec-recommended',
      title: 'Recommended',
      count: rec.length,
      collapsible: false,
      collapsed: false,
    });
    if (rec.length === 0) {
      out.push({
        kind: 'empty',
        id: 'empty-recommended',
        message: 'No recommended formats for this record yet.',
      });
    } else {
      for (const row of rec) {
        out.push({
          kind: 'row',
          id: `rec-${row.template.code}`,
          row,
          showUnsuitableReason: false,
        });
      }
    }

    const moreItems = filtered.otherByFamily.flatMap((g) => g.items);
    if (moreItems.length > 0) {
      out.push({
        kind: 'section',
        id: 'sec-more-formats',
        title: 'More formats',
        count: moreItems.length,
        collapsible: true,
        collapsed: moreFormatsCollapsed,
      });
      if (!moreFormatsCollapsed) {
        for (const row of moreItems) {
          out.push({
            kind: 'row',
            id: `other-${row.template.code}`,
            row,
            showUnsuitableReason: false,
          });
        }
      }
    }

    if (filtered.notSuitable.length > 0) {
      out.push({
        kind: 'section',
        id: 'sec-not-suitable',
        title: 'Not suitable',
        count: filtered.notSuitable.length,
        collapsible: true,
        collapsed: notSuitableCollapsed,
      });
      if (!notSuitableCollapsed) {
        for (const row of filtered.notSuitable) {
          out.push({
            kind: 'row',
            id: `unsuit-${row.template.code}`,
            row,
            showUnsuitableReason: true,
          });
        }
      }
    }

    return out;
  }, [filtered, moreFormatsCollapsed, notSuitableCollapsed]);

  const totalVisible =
    filtered.recommended.length +
    filtered.otherByFamily.reduce((n, g) => n + g.items.length, 0) +
    filtered.notSuitable.length;

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (!item) return 72;
      if (item.kind === 'section') return 44;
      if (item.kind === 'empty') return 48;
      return 148;
    },
    overscan: 6,
  });

  const toggleSection = (sectionKey: string) => {
    if (sectionKey === 'not-suitable') {
      setNotSuitableCollapsed((v) => !v);
      return;
    }
    if (sectionKey === 'more-formats') {
      setMoreFormatsCollapsed((v) => !v);
    }
  };

  if (loading) {
    return (
      <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
        Loading catalog…
      </p>
    );
  }

  return (
    <div
      data-testid="catalog-strips-view"
      className="overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white shadow-sm"
    >
      <div className="space-y-3 border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-3 sm:px-4">
        {recordLabel ? (
          <p className="text-[13px] text-[var(--color-neutral-700)]">
            Formats for <span className="font-semibold">{recordLabel}</span>
          </p>
        ) : (
          <p className="text-[13px] text-[var(--color-neutral-600)]">
            Open a job, shipment, invoice, or quotation to see formats for that module.
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="relative min-w-0 flex-1">
            <label className="sr-only" htmlFor="catalog-strips-search">
              Search formats
            </label>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]"
              aria-hidden
            />
            <Input
              id="catalog-strips-search"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code"
              className="h-10 pl-9 pr-9"
              data-testid="catalog-strips-search"
            />
            {searchQuery ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)]"
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="w-full sm:w-48">
            <label
              className="mb-1 block text-xs font-medium text-[var(--color-neutral-500)]"
              htmlFor="catalog-strips-family"
            >
              Family
            </label>
            <select
              id="catalog-strips-family"
              data-testid="catalog-strips-family"
              className="h-10 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm shadow-sm outline-none focus:border-[var(--color-secondary)]"
              value={familyFilter}
              onChange={(e) => setFamily(e.target.value)}
            >
              {derivedFamilies.map((f) => (
                <option key={f} value={f}>
                  {f === 'all' ? 'All families' : reportFamilyLabel(f)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {items.length === 0 || totalVisible === 0 ? (
        <div
          data-testid="catalog-strips-empty"
          className="px-4 py-10 text-center text-sm text-[var(--color-neutral-500)]"
        >
          {items.length === 0
            ? 'No formats are available for this module with the current record.'
            : 'No formats match this search or family filter. Clear the filters to see all formats for this module.'}
        </div>
      ) : (
        <div
          ref={parentRef}
          className="max-h-[min(70vh,720px)] overflow-auto"
          data-testid="catalog-strips-list"
        >
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
          >
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const item = virtualItems[vRow.index];
              if (!item) return null;
              return (
                <div
                  key={item.id}
                  data-index={vRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vRow.start}px)`,
                  }}
                >
                  {item.kind === 'section' ? (
                    <SectionHeader
                      title={item.title}
                      count={item.count}
                      collapsible={item.collapsible}
                      collapsed={item.collapsed}
                      onToggle={() => {
                        if (item.id === 'sec-not-suitable') toggleSection('not-suitable');
                        else if (item.id === 'sec-more-formats') toggleSection('more-formats');
                      }}
                    />
                  ) : null}
                  {item.kind === 'empty' ? (
                    <p className="px-4 py-3 text-xs text-[var(--color-neutral-400)]">{item.message}</p>
                  ) : null}
                  {item.kind === 'row' ? (
                    <CatalogFormatRow
                      row={item.row}
                      selected={selectedCode === item.row.template.code}
                      context={context}
                      thumbActive
                      onPreview={onPreview}
                      onGenerate={onGenerate}
                      onBrowseReference={onBrowseReference}
                      showUnsuitableReason={item.showUnsuitableReason}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  count,
  collapsible,
  collapsed,
  onToggle,
}: {
  title: string;
  count: number;
  collapsible: boolean;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const content = (
    <>
      <span className="flex items-center gap-1.5">
        {collapsible ? (
          collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          )
        ) : null}
        {title}
      </span>
      <span className="font-normal tabular-nums text-[var(--color-neutral-500)]">({count})</span>
    </>
  );

  if (collapsible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-800)] sm:px-4"
        aria-expanded={!collapsed}
        data-testid={`catalog-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="flex w-full items-center justify-between gap-2 border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-800)] sm:px-4"
      data-testid={`catalog-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {content}
    </div>
  );
}
