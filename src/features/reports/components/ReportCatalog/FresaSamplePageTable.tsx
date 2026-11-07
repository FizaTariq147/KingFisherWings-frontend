import type { ReportTemplate } from '../../types/reportCatalog.types';
import {
  FRESA_PAGE_COLUMNS,
  fresaColumnForFamily,
  type FresaPageColumnId,
} from '../../constants/fresaPageColumns';
import { FRESA_UI } from '../../constants/fresaInvoiceColors';
import { parseInvoiceFormatNumber } from '../../constants/invoiceFormatCatalogNames';

function compareByName(a: ReportTemplate, b: ReportTemplate): number {
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
  for (const col of FRESA_PAGE_COLUMNS) {
    map[col.id].sort(compareByName);
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
};

/**
 * Catalogue browse matching Fresa’s Sample Report Formats table:
 * Sea Freight | Air Freight | Accounts | My Reports.
 */
export function FresaSamplePageTable({
  items,
  selectedCode,
  onSelect,
  loading,
  emptyHint,
  focusColumn = null,
}: FresaSamplePageTableProps) {
  const columns = groupByFresaColumn(items);
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
    <div
      className="overflow-hidden rounded-xl border bg-white shadow-sm"
      style={{ borderColor: `${FRESA_UI.sky}55` }}
    >
      <div
        className="border-b px-3 py-2.5 sm:px-4"
        style={{
          background: `linear-gradient(90deg, ${FRESA_UI.sky}22 0%, #F0F9FF 50%, #FFFFFF 100%)`,
          borderColor: `${FRESA_UI.sky}40`,
        }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: FRESA_UI.navy }}
        >
          Sample report formats
        </h3>
        <p className="mt-0.5 text-[11px] text-[var(--color-neutral-500)]">
          Same four columns as Fresa Gold — click a format to preview / generate
        </p>
      </div>

      {/* Mobile: stacked columns */}
      <div className="grid gap-0 md:hidden">
        {visibleCols.map((col) => (
          <div key={col.id} className="border-b border-[var(--color-neutral-100)] last:border-b-0">
            <div
              className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: FRESA_UI.navy }}
            >
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

      {/* Desktop: Fresa-style 4-column table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-[12px]">
          <thead>
            <tr style={{ backgroundColor: FRESA_UI.navy }}>
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
                className={
                  rowIndex % 2 === 0
                    ? 'bg-white'
                    : 'bg-[#F7FBFE]'
                }
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
  compact = false,
}: {
  template: ReportTemplate;
  index: number;
  active: boolean;
  onSelect: (template: ReportTemplate) => void;
  compact?: boolean;
}) {
  const formatNo = parseInvoiceFormatNumber(template.code);
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      title={template.code}
      className={[
        'w-full text-left transition',
        compact ? 'rounded px-1.5 py-1' : 'px-3 py-2.5',
        active
          ? 'bg-[#E8F4FC] font-semibold text-[#0F4D96] ring-1 ring-[#2286C8]/50'
          : 'text-[#0F4D96] hover:bg-[#F0F9FF] hover:underline',
      ].join(' ')}
    >
      <span className="line-clamp-2 leading-snug">
        {formatNo != null ? (
          <span className="mr-1 text-[10px] font-bold text-[#2286C8]">#{formatNo}</span>
        ) : (
          <span className="mr-1 text-[10px] text-[var(--color-neutral-400)]">{index + 1}.</span>
        )}
        {template.name}
      </span>
    </button>
  );
}
