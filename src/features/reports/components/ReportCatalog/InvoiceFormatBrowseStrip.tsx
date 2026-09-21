import { listInvoiceFormatPreviews } from '../../data/invoiceFormatPreviews';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';

type InvoiceFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  /** When true, strip is shown (commercial + invoice context filters). */
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

const CARD_TONES = [
  {
    bg: 'bg-[var(--color-primary-100)]',
    border: 'border-[var(--color-primary-500)]/30',
    accent: 'bg-[var(--color-primary-500)]',
    label: 'text-[var(--color-primary-600)]',
  },
  {
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  {
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/30',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-500)]',
  },
  {
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  {
    bg: 'bg-[var(--color-danger-50)]',
    border: 'border-[var(--color-danger-500)]/25',
    accent: 'bg-[var(--color-danger-500)]',
    label: 'text-[var(--color-danger-600)]',
  },
] as const;

/**
 * Compact card strip for Invoice Report Format catalog (fully laid-out formats only).
 * Selection still goes through the main catalog URL `code` param.
 */
export function InvoiceFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
}: InvoiceFormatBrowseStripProps) {
  if (!visible) return null;

  const all = listInvoiceFormatPreviews()
    .slice()
    .sort((a, b) => a.formatNumber - b.formatNumber);
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
    toSearchable: (row) => ({
      name: row.name,
      code: row.code,
      formatNumber: row.formatNumber,
      kind: 'invoice',
    }),
  });

  return (
    <div className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-600)]">
          Invoice report formats
        </h3>
        <p className="text-[10px] text-[var(--color-neutral-400)]">
          {filterActive
            ? `${items.length} of ${scopedTotal} formats`
            : `${all.length} distinct layout styles`}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No Invoice formats match the current filters.
        </p>
      ) : (
        <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {items.map((row) => {
            const active = selectedCode === row.code;
            const tone = CARD_TONES[(row.formatNumber - 1) % CARD_TONES.length]!;
            return (
              <button
                key={row.code}
                type="button"
                onClick={() => onSelect(row.code)}
                title={row.name}
                className={[
                  'relative min-w-[8.25rem] max-w-[10rem] shrink-0 overflow-hidden rounded-lg border px-2.5 py-2.5 text-left transition',
                  tone.bg,
                  tone.border,
                  active
                    ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md'
                    : 'hover:-translate-y-0.5 hover:shadow-sm',
                ].join(' ')}
              >
                <span
                  className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`}
                  aria-hidden
                />
                <p className={`pl-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
                  Format-{row.formatNumber}
                </p>
                <p className="mt-0.5 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[var(--color-neutral-800)]">
                  {row.name.replace(/^Invoice Report Format-\d+\s*/i, '') || row.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
