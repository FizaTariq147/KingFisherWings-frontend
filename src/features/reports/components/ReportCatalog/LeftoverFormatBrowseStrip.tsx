import { listLeftoverFormats } from '../../constants/leftoverFormatCatalog';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

/** Catalogue strip for leftover sample-page formats stored as JSON layouts. */
export function LeftoverFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
}: Props) {
  if (!visible) return null;

  const all = listLeftoverFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
  });

  return (
    <div className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#0F4D96]">
          Leftover sample formats
        </h3>
        <p className="text-[10px] text-[var(--color-neutral-400)]">
          {filterActive ? `${items.length} of ${scopedTotal} formats` : `${all.length} formats`}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No formats match the current filters.
        </p>
      ) : (
        <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {items.map((row) => {
            const active = selectedCode === row.code;
            return (
              <button
                key={row.code}
                type="button"
                onClick={() => onSelect(row.code)}
                title={row.name}
                className={[
                  'relative min-w-[8.75rem] max-w-[11rem] shrink-0 overflow-hidden rounded-lg border border-[#0F4D96]/25 bg-[#EEF6FF] px-2.5 py-2.5 text-left transition',
                  active
                    ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md'
                    : 'hover:-translate-y-0.5 hover:shadow-sm',
                ].join(' ')}
              >
                <span className="absolute inset-y-0 left-0 w-1 bg-[#0F4D96]" aria-hidden />
                <p className="pl-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0F4D96]">
                  #{row.sortOrder}
                </p>
                <p className="mt-0.5 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[var(--color-neutral-800)]">
                  {row.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
