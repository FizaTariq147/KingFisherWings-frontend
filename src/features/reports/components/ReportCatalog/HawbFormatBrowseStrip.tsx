import { listHawbFormats, type HawbFormatKind } from '../../constants/hawbFormatCatalog';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

const DEFAULT_TONE = {
  bg: 'bg-[var(--color-success-50)]',
  border: 'border-[var(--color-success-500)]/30',
  accent: 'bg-[var(--color-success-500)]',
  label: 'text-[var(--color-success-500)]',
};

const KIND_TONES: Partial<
  Record<HawbFormatKind, { bg: string; border: string; accent: string; label: string }>
> = {
  hawb_original_pre_printed_1: {
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  hawb_original_pre_printed_2: {
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  hawb_draft_format_1: {
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#2286C8]/35',
    accent: 'bg-[#2286C8]',
    label: 'text-[#0F4D96]',
  },
};

export function HawbFormatBrowseStrip({ selectedCode, onSelect, visible, searchQuery = '', allowedCodes = null }: Props) {
  if (!visible) return null;

  const all = listHawbFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
  });

  return (
    <div className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-success-500)]">
          HAWB
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
            const tone = KIND_TONES[row.kind] ?? DEFAULT_TONE;
            return (
              <button
                key={row.code}
                type="button"
                onClick={() => onSelect(row.code)}
                title={row.name}
                className={[
                  'relative min-w-[8.75rem] max-w-[11rem] shrink-0 overflow-hidden rounded-lg border px-2.5 py-2.5 text-left transition',
                  tone.bg,
                  tone.border,
                  active
                    ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md'
                    : 'hover:-translate-y-0.5 hover:shadow-sm',
                ].join(' ')}
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden />
                <p className={`pl-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
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
