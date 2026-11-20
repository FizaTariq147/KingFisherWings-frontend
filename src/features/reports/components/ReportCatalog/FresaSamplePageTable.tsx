import type { ReportTemplate } from '../../types/reportCatalog.types';
import {
  FRESA_PAGE_COLUMNS,
  fresaColumnForFamily,
  type FresaPageColumnId,
} from '../../constants/fresaPageColumns';
import { parseInvoiceFormatNumber } from '../../constants/invoiceFormatCatalogNames';
import { invoiceV2ListRank, invoiceV2ApplicabilityHint, type InvoiceFitInput } from '../../engine/invoiceV2Applicability';
import { FORMAT_NOT_AVAILABLE_YET, invoiceV2HardBlocked } from '../../engine/invoiceV2Gate';
import { reportsCatalogueGate } from '../../engine/reportsEngine';
import { catalogSharedLayoutHint } from '../../utils/catalogSharedLayoutHint';
import { resolveCatalogFormatStatus } from '../../utils/catalogFormatStatus';
import { FormatStatusBadge } from './FormatStatusBadge';
import {
  reportConformanceLabel,
  reportConformanceStatus,
} from '../../utils/reportConformanceStatus';

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
  currency?: InvoiceFitInput,
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
  for (const col of FRESA_PAGE_COLUMNS) {
    map[col.id].sort((a, b) => compareByName(a, b, currency));
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
};

/**
 * Catalogue browse table: Sea Freight | Air Freight | Accounts | My Reports.
 */
export function FresaSamplePageTable({
  items,
  selectedCode,
  onSelect,
  loading,
  emptyHint,
  focusColumn = null,
  invoiceCurrency = null,
}: FresaSamplePageTableProps) {
  const columns = groupByFresaColumn(items, invoiceCurrency);
  const visibleCols = focusColumn
    ? FRESA_PAGE_COLUMNS.filter((c) => c.id === focusColumn)
    : FRESA_PAGE_COLUMNS;

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

  const maxRows = Math.max(1, ...visibleCols.map((c) => columns[c.id].length));

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white shadow-sm">
      <div className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2.5 sm:px-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-800)]">
          Format catalogue
        </h3>
        <p className="mt-0.5 text-[11px] text-[var(--color-neutral-500)]">
          Click a format to preview or generate. Status badges reflect implementation evidence.
        </p>
      </div>

      {/* Mobile: stacked columns */}
      <div className="grid gap-0 md:hidden">
        {visibleCols.map((col) => (
          <div key={col.id} className="border-b border-[var(--color-neutral-100)] last:border-b-0">
            <div className="bg-[var(--color-neutral-800)] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white">
              {col.title}
              <span className="ml-2 font-normal opacity-80">({columns[col.id].length})</span>
            </div>
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {columns[col.id].map((t, index) => (
                <li key={`${t.id}-${t.code}`}>
                  <FormatLink
                    template={t}
                    index={index}
                    active={selectedCode === t.code}
                    onSelect={onSelect}
                    invoiceCurrency={invoiceCurrency}
                  />
                </li>
              ))}
              {columns[col.id].length === 0 ? (
                <li className="px-3 py-3 text-xs text-[var(--color-neutral-400)]">No formats</li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>

      {/* Desktop: 4-column table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="bg-[var(--color-neutral-800)]">
              <th className="w-10 px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white/90">
                S.No
              </th>
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white"
                >
                  {col.title}
                  <span className="ml-1.5 font-normal text-white/70">
                    ({columns[col.id].length})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }, (_, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-[var(--color-neutral-50)]'}
              >
                <td
                  className="border-t border-[var(--color-neutral-100)] px-2 py-1.5 text-center text-[11px] text-[var(--color-neutral-400)]"
                >
                  {rowIndex + 1}.
                </td>
                {visibleCols.map((col) => {
                  const t = columns[col.id][rowIndex];
                  return (
                    <td
                      key={col.id}
                      className="border-t border-[var(--color-neutral-100)] px-2 py-1 align-top"
                    >
                      {t ? (
                        <FormatLink
                          template={t}
                          index={rowIndex}
                          active={selectedCode === t.code}
                          onSelect={onSelect}
                          invoiceCurrency={invoiceCurrency}
                          compact
                        />
                      ) : (
                        <span className="text-[var(--color-neutral-200)]">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormatLink({
  template,
  index,
  active,
  onSelect,
  invoiceCurrency = null,
  compact = false,
}: {
  template: ReportTemplate;
  index: number;
  active: boolean;
  onSelect: (template: ReportTemplate) => void;
  invoiceCurrency?: InvoiceFitInput;
  compact?: boolean;
}) {
  const formatNo = parseInvoiceFormatNumber(template.code);
  const sharedHint = catalogSharedLayoutHint(template.code);
  const applicability = invoiceV2ApplicabilityHint(template.code, invoiceCurrency);
  const hardBlocked = invoiceV2HardBlocked({
    gate: reportsCatalogueGate(),
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
        'w-full text-left transition',
        compact ? 'rounded px-1.5 py-1' : 'px-3 py-2.5',
        active
          ? 'bg-[var(--color-primary-50)] font-semibold text-[var(--color-primary-900)] ring-1 ring-[var(--color-primary-300)]'
          : 'text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)]',
      ].join(' ')}
    >
      <span className="flex flex-wrap items-center gap-1">
        {formatNo != null ? (
          <span className="text-[10px] font-bold text-[var(--color-primary-700)]">#{formatNo}</span>
        ) : (
          <span className="text-[10px] text-[var(--color-neutral-400)]">{index + 1}.</span>
        )}
        <FormatStatusBadge status={status} />
      </span>
      <span className="mt-0.5 line-clamp-2 leading-snug">{template.name}</span>
      <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-amber-800">
        {reportConformanceLabel(reportConformanceStatus(template.code))}
        {reportConformanceStatus(template.code) === 'accepted' ? '' : ' · approximate, not final'}
      </span>
      {hardBlocked ? (
        <span className="mt-0.5 block text-[9px] font-semibold text-amber-800">{FORMAT_NOT_AVAILABLE_YET}</span>
      ) : null}
      {applicability ? (
        <span className="mt-0.5 block text-[9px] font-semibold text-amber-800">{applicability}</span>
      ) : null}
      {sharedHint ? (
        <span className="mt-0.5 block text-[9px] font-medium text-amber-800">{sharedHint}</span>
      ) : null}
    </button>
  );
}
