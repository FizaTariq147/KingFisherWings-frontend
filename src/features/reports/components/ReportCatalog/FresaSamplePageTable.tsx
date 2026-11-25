import type { ReportTemplate } from '../../types/reportCatalog.types';
import {
  FRESA_PAGE_COLUMNS,
  fresaColumnForFamily,
  type FresaPageColumnId,
} from '../../constants/fresaPageColumns';
import { parseInvoiceFormatNumber } from '../../constants/invoiceFormatCatalogNames';
import {
  invoiceV2ListRank,
  invoiceV2ApplicabilityHint,
  type InvoiceFitInput,
} from '../../engine/invoiceV2Applicability';
import { FORMAT_NOT_AVAILABLE_YET, reportsCodeGenerateBlocked } from '../../engine/invoiceV2Gate';
import { reportsCatalogueGate, reportsEngine } from '../../engine/reportsEngine';
import { catalogSharedLayoutHint } from '../../utils/catalogSharedLayoutHint';
import { resolveCatalogFormatStatus } from '../../utils/catalogFormatStatus';
import { FormatStatusBadge } from './FormatStatusBadge';
import {
  reportConformanceLabel,
  reportConformanceStatus,
} from '../../utils/reportConformanceStatus';
import { groupColumnIntoBands } from '../../utils/fresaCatalogBand';

function compareByName(a: ReportTemplate, b: ReportTemplate, currency?: InvoiceFitInput): number {
  const rank = invoiceV2ListRank(a.code, currency) - invoiceV2ListRank(b.code, currency);
  if (rank !== 0) return rank;
  const na = parseInvoiceFormatNumber(a.code);
  const nb = parseInvoiceFormatNumber(b.code);
  if (na != null && nb != null && na !== nb) return na - nb;
  if (na != null && nb == null) return -1;
  if (na == null && nb != null) return 1;
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

function groupByFresaColumn(
  items: ReportTemplate[],
): Record<FresaPageColumnId, ReportTemplate[]> {
  const map: Record<FresaPageColumnId, ReportTemplate[]> = {
    sea: [],
    air: [],
    accounts: [],
    my_reports: [],
  };
  for (const t of items) {
    map[fresaColumnForFamily(t.family)].push(t);
  }
  return map;
}

type FresaSamplePageTableProps = {
  items: ReportTemplate[];
  selectedCode?: string;
  onSelect: (template: ReportTemplate) => void;
  loading?: boolean;
  emptyHint?: string;
  /** Highlight a single Fresa column (from family filter). */
  focusColumn?: FresaPageColumnId | null;
  invoiceCurrency?: InvoiceFitInput;
  /** `index` is the sample-page list: name only. Catalogue keeps status badges. */
  appearance?: 'catalogue' | 'index';
};

/**
 * Catalogue browse: Sea Freight | Air Freight | Accounts | My Reports,
 * with Fresa-style subsection bands (HBL, Invoice, HAWB, …) inside each column.
 */
export function FresaSamplePageTable({
  items,
  selectedCode,
  onSelect,
  loading,
  emptyHint,
  focusColumn = null,
  invoiceCurrency = null,
  appearance = 'catalogue',
}: FresaSamplePageTableProps) {
  const byColumn = groupByFresaColumn(items);
  const visibleCols = focusColumn
    ? FRESA_PAGE_COLUMNS.filter((c) => c.id === focusColumn)
    : FRESA_PAGE_COLUMNS;
  const compare = (a: ReportTemplate, b: ReportTemplate) =>
    compareByName(a, b, invoiceCurrency ?? undefined);

  if (loading) {
    return (
      <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
        Loading catalog…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
        {emptyHint || 'No reports match these filters.'}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white shadow-sm">
      {appearance === 'catalogue' ? (
        <div className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2.5 sm:px-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-800)]">
            Sample report formats
          </h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-neutral-500)]">
            Categorised like Fresa Gold — Sea · Air · Accounts · My Reports. Click a format to
            preview or generate.
          </p>
        </div>
      ) : null}

      <div
        className={[
          'grid gap-0',
          visibleCols.length === 1
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
        ].join(' ')}
      >
        {visibleCols.map((col) => {
          const bands = groupColumnIntoBands(col.id, byColumn[col.id], compare);
          let serial = 0;
          return (
            <div
              key={col.id}
              className="border-b border-[var(--color-neutral-200)] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <div className="sticky top-0 z-[1] bg-[var(--color-neutral-800)] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white">
                {col.title}
                <span className="ml-1.5 font-normal text-white/70">
                  ({byColumn[col.id].length})
                </span>
              </div>
              {bands.length === 0 ? (
                <p className="px-3 py-3 text-xs text-[var(--color-neutral-400)]">No formats</p>
              ) : (
                bands.map((band) => (
                  <div key={band.id}>
                    <div className="border-y border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-neutral-700)]">
                      {band.title}
                      <span className="ml-1 font-normal text-[var(--color-neutral-500)]">
                        ({band.items.length})
                      </span>
                    </div>
                    <ul className="divide-y divide-[var(--color-neutral-100)]">
                      {band.items.map((t) => {
                        serial += 1;
                        const sno = serial;
                        return (
                          <li key={`${t.id}-${t.code}`}>
                            <FormatLink
                              template={t}
                              index={sno - 1}
                              serial={sno}
                              active={selectedCode === t.code}
                              onSelect={onSelect}
                              invoiceCurrency={invoiceCurrency}
                              appearance={appearance}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormatLink({
  template,
  index,
  serial,
  active,
  onSelect,
  invoiceCurrency = null,
  appearance = 'catalogue',
}: {
  template: ReportTemplate;
  index: number;
  serial: number;
  active: boolean;
  onSelect: (template: ReportTemplate) => void;
  invoiceCurrency?: InvoiceFitInput;
  appearance?: 'catalogue' | 'index';
}) {
  const formatNo = parseInvoiceFormatNumber(template.code);
  const sharedHint = catalogSharedLayoutHint(template.code);
  const applicability = invoiceV2ApplicabilityHint(template.code, invoiceCurrency);
  const hardBlocked = reportsCodeGenerateBlocked({
    gate: reportsCatalogueGate(),
    engine: reportsEngine(),
    code: template.code,
    status: reportConformanceStatus(template.code),
  });
  const status = resolveCatalogFormatStatus(template.code);
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      title={`${template.code} — ${status.label}: ${status.detail}`}
      className={[
        'w-full px-3 py-2 text-left transition',
        active
          ? 'bg-[var(--color-primary-50)] font-semibold text-[var(--color-primary-900)] ring-1 ring-inset ring-[var(--color-primary-300)]'
          : 'text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)]',
      ].join(' ')}
    >
      {appearance === 'index' ? (
        <span className="flex gap-2 text-[12px] leading-snug">
          <span className="shrink-0 text-[11px] text-[var(--color-neutral-400)]">{serial}.</span>
          <span className="whitespace-normal break-words text-[var(--color-primary-800)] underline-offset-2 hover:underline">
            {template.name}
          </span>
        </span>
      ) : (
        <>
          <span className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-[var(--color-neutral-400)]">{serial}.</span>
            {formatNo != null ? (
              <span className="text-[10px] font-bold text-[var(--color-primary-700)]">
                #{formatNo}
              </span>
            ) : null}
            <FormatStatusBadge status={status} />
          </span>
          <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug">{template.name}</span>
          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-amber-800">
            {reportConformanceLabel(reportConformanceStatus(template.code))}
            {reportConformanceStatus(template.code) === 'accepted'
              ? ''
              : ' · approximate, not final'}
          </span>
          {hardBlocked ? (
            <span className="mt-0.5 block text-[9px] font-semibold text-amber-800">
              {FORMAT_NOT_AVAILABLE_YET}
            </span>
          ) : null}
          {applicability ? (
            <span className="mt-0.5 block text-[9px] font-semibold text-amber-800">
              {applicability}
            </span>
          ) : null}
          {sharedHint ? (
            <span className="mt-0.5 block text-[9px] font-medium text-amber-800">{sharedHint}</span>
          ) : null}
          {/* keep index used for a11y title order */}
          <span className="sr-only">item {index + 1}</span>
        </>
      )}
    </button>
  );
}
