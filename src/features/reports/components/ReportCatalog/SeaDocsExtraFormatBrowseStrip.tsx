import { listSeaDocsExtraFormats } from '../../constants/seaDocsExtraFormatCatalog';

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
};

function matchesSearch(
  row: { name: string; code: string; kind: string },
  rawQuery: string,
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  if (!tokens.length) return true;
  const hay = `${row.name} ${row.code} ${row.kind}`.toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

export function SeaDocsExtraFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
}: Props) {
  if (!visible) return null;

  const all = listSeaDocsExtraFormats();
  const items = all.filter((row) => matchesSearch(row, searchQuery));
  const qActive = Boolean(searchQuery.trim());

  return (
    <div className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#0F4D96]">
          More sea / air docs
        </h3>
        <p className="text-[10px] text-[var(--color-neutral-400)]">
          {qActive ? `${items.length} of ${all.length} formats` : `${all.length} formats`}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No sea/air docs match “{searchQuery.trim()}”.
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
                  'relative min-w-[8.75rem] max-w-[11rem] shrink-0 overflow-hidden rounded-lg border border-[var(--color-success-500)]/30 bg-[var(--color-success-50)] px-2.5 py-2.5 text-left transition',
                  active
                    ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md'
                    : 'hover:-translate-y-0.5 hover:shadow-sm',
                ].join(' ')}
              >
                <span
                  className="absolute inset-y-0 left-0 w-1 bg-[var(--color-success-500)]"
                  aria-hidden
                />
                <p className="pl-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-success-700)]">
                  {row.family === 'air_docs' ? 'Air' : 'Sea'}
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
