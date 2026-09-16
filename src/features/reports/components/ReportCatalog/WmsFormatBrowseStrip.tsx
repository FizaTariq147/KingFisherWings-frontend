import { listWmsFormats } from '../../constants/wmsFormatCatalog';
import type { WmsFormatKind } from '../../constants/wmsFormatCatalog';

type WmsFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
};

const KIND_TONES: Record<
  WmsFormatKind,
  { bg: string; border: string; accent: string; label: string }
> = {
  asn_format_1: {
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/30',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-500)]',
  },
  asn_standard: {
    bg: 'bg-[var(--color-primary-100)]',
    border: 'border-[var(--color-primary-500)]/30',
    accent: 'bg-[var(--color-primary-500)]',
    label: 'text-[var(--color-primary-600)]',
  },
  asn_location_wise: {
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  asn_location_wise_2: {
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  asn_summary: {
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#2286C8]/35',
    accent: 'bg-[#2286C8]',
    label: 'text-[#0F4D96]',
  },
};

/** Compact strip for WMS Advance Shipping Note formats. */
export function WmsFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
}: WmsFormatBrowseStripProps) {
  if (!visible) return null;

  const all = listWmsFormats();
  const q = searchQuery.trim().toLowerCase();
  const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
  const items = !tokens.length
    ? all
    : all.filter((row) => {
        const hay = `${row.name} ${row.code} ${row.kind}`.toLowerCase();
        return tokens.every((token) => hay.includes(token));
      });
  const qActive = Boolean(tokens.length);

  return (
    <div className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-success-500)]">
          WMS — Advance Shipping Note
        </h3>
        <p className="text-[10px] text-[var(--color-neutral-400)]">
          {qActive ? `${items.length} of ${all.length} formats` : `${all.length} formats`}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No WMS formats match “{searchQuery.trim()}”.
        </p>
      ) : (
        <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {items.map((row) => {
            const active = selectedCode === row.code;
            const tone = KIND_TONES[row.kind];
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
