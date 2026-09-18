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

const FAMILY_TONES: Record<
  string,
  { section: string; bg: string; border: string; accent: string; label: string }
> = {
  commercial: {
    section: 'text-[var(--color-primary-600)]',
    bg: 'bg-[var(--color-primary-100)]',
    border: 'border-[var(--color-primary-500)]/30',
    accent: 'bg-[var(--color-primary-500)]',
    label: 'text-[var(--color-primary-600)]',
  },
  finance: {
    section: 'text-[var(--color-secondary-700)]',
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  sea_docs: {
    section: 'text-[#0F4D96]',
    bg: 'bg-[#EEF6FF]',
    border: 'border-[#0F4D96]/25',
    accent: 'bg-[#0F4D96]',
    label: 'text-[#0F4D96]',
  },
  air_docs: {
    section: 'text-[#2286C8]',
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#2286C8]/30',
    accent: 'bg-[#2286C8]',
    label: 'text-[#2286C8]',
  },
  quotation: {
    section: 'text-[var(--color-warning-600)]',
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-600)]',
  },
  ops_list: {
    section: 'text-[var(--color-success-600)]',
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/25',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-600)]',
  },
  operations: {
    section: 'text-[var(--color-success-500)]',
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/25',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-500)]',
  },
  wms: {
    section: 'text-[var(--color-success-500)]',
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/25',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-500)]',
  },
  management: {
    section: 'text-[var(--color-warning-500)]',
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/25',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  other: {
    section: 'text-[var(--color-neutral-600)]',
    bg: 'bg-[var(--color-neutral-100)]',
    border: 'border-[var(--color-neutral-200)]',
    accent: 'bg-[var(--color-neutral-400)]',
    label: 'text-[var(--color-neutral-600)]',
  },
};

function toneForFamily(family: string) {
  return FAMILY_TONES[family] ?? FAMILY_TONES.other!;
}

function cardBadge(template: ReportTemplate, index: number): string {
  const formatNo = parseInvoiceFormatNumber(template.code);
  if (formatNo != null) return `Format-${formatNo}`;
  return `#${index + 1}`;
}

type ReportCatalogBrowseListProps = {
  items: ReportTemplate[];
  selectedCode?: string;
  onSelect: (template: ReportTemplate) => void;
  loading?: boolean;
  emptyHint?: string;
};

/** Section-wise catalogue — same card style as the format browse strips. */
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
    <div className="space-y-3 p-3 sm:p-4">
      {sections.map((section) => {
        const tone = toneForFamily(section.family);
        return (
          <section
            key={section.family}
            className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wide ${tone.section}`}>
                {reportFamilyLabel(section.family)}
              </h3>
              <p className="text-[10px] text-[var(--color-neutral-400)]">
                {section.items.length} format{section.items.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="-mx-0.5 flex flex-wrap gap-2.5 pb-1">
              {section.items.map((t, index) => {
                const active = selectedCode === t.code;
                return (
                  <button
                    key={`${t.id}-${t.code}`}
                    type="button"
                    onClick={() => onSelect(t)}
                    title={t.name}
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
                    <p
                      className={`pl-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.label}`}
                    >
                      {cardBadge(t, index)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[var(--color-neutral-800)]">
                      {t.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
