import { ExternalLink } from 'lucide-react';
import { listHblFormats, type HblFormatKind } from '../../constants/hblFormatCatalog';

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
};

const DEFAULT_TONE = {
  bg: 'bg-[#E8F4FC]',
  border: 'border-[#0F4D96]/25',
  accent: 'bg-[#0F4D96]',
  label: 'text-[#0F4D96]',
};

const KIND_TONES: Partial<
  Record<HblFormatKind, { bg: string; border: string; accent: string; label: string }>
> = {
  fg_hbl_hkg: {
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  hbl_draft_29_html: {
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
};

function matchesSearch(
  row: { name: string; code: string; kind: string },
  rawQuery: string,
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const hay = `${row.name} ${row.code} ${row.kind} hbl bill lading`.toLowerCase();
  return q.split(/\s+/).every((token) => hay.includes(token));
}

export function HblFormatBrowseStrip({ selectedCode, onSelect, visible, searchQuery = '' }: Props) {
  if (!visible) return null;

  const all = listHblFormats();
  const items = all.filter((row) => matchesSearch(row, searchQuery));
  const qActive = Boolean(searchQuery.trim());

  return (
    <div className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#0F4D96]">HBL</h3>
        <p className="text-[10px] text-[var(--color-neutral-400)]">
          {qActive ? `${items.length} of ${all.length} formats` : `${all.length} formats`}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No HBL formats match “{searchQuery.trim()}”.
        </p>
      ) : (
        <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {items.map((row) => {
            const active = selectedCode === row.code;
            const tone = KIND_TONES[row.kind] ?? DEFAULT_TONE;
            return (
              <div
                key={row.code}
                className={[
                  'relative min-w-[9.75rem] max-w-[12rem] shrink-0 overflow-hidden rounded-lg border',
                  tone.bg,
                  tone.border,
                  active ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md' : '',
                ].join(' ')}
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden />
                <button
                  type="button"
                  onClick={() => onSelect(row.code)}
                  title={row.name}
                  className="w-full px-2.5 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <p className={`pl-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
                    #{row.sortOrder}
                  </p>
                  <p className="mt-0.5 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[var(--color-neutral-800)]">
                    {row.name}
                  </p>
                </button>
                <a
                  href={row.samplePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Fresa sample PDF"
                  className="absolute right-1.5 top-1.5 rounded p-1 text-[var(--color-primary-600)] hover:bg-white/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Sample PDF for {row.name}</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
