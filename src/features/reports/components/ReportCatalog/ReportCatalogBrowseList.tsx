import { Star } from 'lucide-react';
import { REPORT_TEMPLATE_FAMILY_ENUM } from '../../api/reportCatalog.api';
import type { ReportTemplate } from '../../types/reportCatalog.types';
import {
  reportFamilyLabel,
  reportRendererStatus,
} from '../../types/reportCatalog.types';

function StatusChips({ template }: { template: ReportTemplate }) {
  const renderer = reportRendererStatus(template);
  return (
    <span className="mt-0.5 flex flex-wrap gap-1">
      {!template.is_active ? (
        <span className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] text-[var(--color-neutral-500)]">
          inactive
        </span>
      ) : (
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-800">
          active
        </span>
      )}
      {renderer === 'pending' ? (
        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-900">
          pending pack
        </span>
      ) : null}
      {renderer === 'ready' ? (
        <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-900">
          pack ready
        </span>
      ) : null}
      {renderer === 'missing' ? (
        <span className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] text-[var(--color-neutral-500)]">
          no pack
        </span>
      ) : null}
    </span>
  );
}

export function groupTemplatesByFamily(
  items: ReportTemplate[],
): Array<{ family: string; items: ReportTemplate[] }> {
  const map = new Map<string, ReportTemplate[]>();
  for (const t of items) {
    const key = t.family || 'other';
    const list = map.get(key) ?? [];
    list.push(t);
    map.set(key, list);
  }
  const order = [...REPORT_TEMPLATE_FAMILY_ENUM];
  const keys = [
    ...order.filter((f) => map.has(f)),
    ...[...map.keys()].filter((k) => !order.includes(k as (typeof order)[number])).sort(),
  ];
  return keys.map((family) => ({
    family,
    items: (map.get(family) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

type ReportCatalogBrowseListProps = {
  items: ReportTemplate[];
  selectedCode?: string;
  isFavorite: (code: string) => boolean;
  onToggleFavorite: (code: string) => void;
  onSelect: (template: ReportTemplate) => void;
  loading?: boolean;
  emptyHint?: string;
};

/**
 * FRESA-like sample formats browse: sectioned by API family, multi-column names.
 * Report names/codes come from API (or local registry fallback) — never scraped HTML.
 */
export function ReportCatalogBrowseList({
  items,
  selectedCode,
  isFavorite,
  onToggleFavorite,
  onSelect,
  loading,
  emptyHint,
}: ReportCatalogBrowseListProps) {
  const sections = groupTemplatesByFamily(items);

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
        {emptyHint || 'No templates match these filters.'}
      </p>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {sections.map((section) => (
        <section key={section.family} className="space-y-3">
          <div className="border-b border-[var(--color-neutral-200)] pb-1">
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
              {reportFamilyLabel(section.family)}
            </h3>
            <p className="text-[11px] text-[var(--color-neutral-400)]">
              {section.items.length} format{section.items.length === 1 ? '' : 's'}
            </p>
          </div>
          <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
            {section.items.map((t) => {
              const active = selectedCode === t.code;
              const fav = isFavorite(t.code);
              return (
                <li key={`${t.id}-${t.code}`} className="flex min-w-0 items-start gap-1">
                  <button
                    type="button"
                    className="mt-1 shrink-0 text-[var(--color-neutral-400)] hover:text-amber-500"
                    aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                    onClick={() => onToggleFavorite(t.code)}
                  >
                    <Star
                      className="h-3.5 w-3.5"
                      fill={fav ? 'currentColor' : 'none'}
                      strokeWidth={1.75}
                    />
                  </button>
                  <button
                    type="button"
                    className={[
                      'min-w-0 flex-1 rounded px-1.5 py-1 text-left transition-colors',
                      active
                        ? 'bg-[var(--color-primary-50,#eff6ff)]'
                        : 'hover:bg-[var(--color-neutral-50)]',
                    ].join(' ')}
                    onClick={() => onSelect(t)}
                  >
                    <span className="block text-sm font-medium text-[var(--color-neutral-900)]">
                      {t.name}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-[var(--color-neutral-400)]">
                      {t.code}
                    </span>
                    <StatusChips template={t} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
