import type { ReportTemplate } from '../../types/reportCatalog.types';
import { reportFamilyLabel } from '../../types/reportCatalog.types';
import { REPORT_TEMPLATE_FAMILY_ENUM } from '../../api/reportCatalog.api';
import { parseInvoiceFormatNumber } from '../../constants/invoiceFormatCatalogNames';

/** Invoice formats by Format-N; everything else A–Z by name. */
function compareCatalogItems(a: ReportTemplate, b: ReportTemplate): number {
  const na = parseInvoiceFormatNumber(a.code);
  const nb = parseInvoiceFormatNumber(b.code);
  if (na != null && nb != null && na !== nb) return na - nb;
  if (na != null && nb == null) return -1;
  if (na == null && nb != null) return 1;
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
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
    items: (map.get(family) ?? []).slice().sort(compareCatalogItems),
  }));
}

const FAMILY_TONES: Record<string, { section: string; card: string; border: string; accent: string }> =
  {
    commercial: {
      section: 'text-[var(--color-primary-600)]',
      card: 'bg-[var(--color-primary-100)]',
      border: 'border-[var(--color-primary-500)]/25',
      accent: 'bg-[var(--color-primary-500)]',
    },
    finance: {
      section: 'text-[var(--color-secondary-700)]',
      card: 'bg-[var(--color-secondary-100)]',
      border: 'border-[var(--color-secondary)]/30',
      accent: 'bg-[var(--color-secondary)]',
    },
    operations: {
      section: 'text-[var(--color-success-500)]',
      card: 'bg-[var(--color-success-50)]',
      border: 'border-[var(--color-success-500)]/25',
      accent: 'bg-[var(--color-success-500)]',
    },
    wms: {
      section: 'text-[var(--color-success-500)]',
      card: 'bg-[var(--color-success-50)]',
      border: 'border-[var(--color-success-500)]/25',
      accent: 'bg-[var(--color-success-500)]',
    },
    management: {
      section: 'text-[var(--color-warning-500)]',
      card: 'bg-[var(--color-warning-50)]',
      border: 'border-[var(--color-warning-500)]/25',
      accent: 'bg-[var(--color-warning-500)]',
    },
    other: {
      section: 'text-[var(--color-neutral-600)]',
      card: 'bg-[var(--color-neutral-100)]',
      border: 'border-[var(--color-neutral-200)]',
      accent: 'bg-[var(--color-neutral-400)]',
    },
  };

function toneForFamily(family: string) {
  return FAMILY_TONES[family] ?? FAMILY_TONES.other!;
}

type ReportCatalogBrowseListProps = {
  items: ReportTemplate[];
  selectedCode?: string;
  onSelect: (template: ReportTemplate) => void;
  loading?: boolean;
  emptyHint?: string;
};

/** Clean name list by family — click opens the report/PDF. */
export function ReportCatalogBrowseList({
  items,
  selectedCode,
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
        {emptyHint || 'No reports match these filters.'}
      </p>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {sections.map((section) => {
        const tone = toneForFamily(section.family);
        return (
          <section key={section.family} className="space-y-3">
            <div className="border-b border-[var(--color-neutral-200)] pb-1.5">
              <h3 className={`text-sm font-semibold ${tone.section}`}>
                {reportFamilyLabel(section.family)}
              </h3>
              <p className="text-[11px] text-[var(--color-neutral-400)]">
                {section.items.length} report{section.items.length === 1 ? '' : 's'}
              </p>
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {section.items.map((t) => {
                const active = selectedCode === t.code;
                return (
                  <li key={`${t.id}-${t.code}`}>
                    <button
                      type="button"
                      className={[
                        'relative w-full min-w-0 overflow-hidden rounded-lg border px-3 py-2.5 text-left transition',
                        tone.card,
                        tone.border,
                        active
                          ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md'
                          : 'hover:-translate-y-0.5 hover:shadow-sm',
                      ].join(' ')}
                      onClick={() => onSelect(t)}
                    >
                      <span
                        className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`}
                        aria-hidden
                      />
                      <span className="block pl-1.5 text-sm font-medium text-[var(--color-neutral-900)]">
                        {t.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
