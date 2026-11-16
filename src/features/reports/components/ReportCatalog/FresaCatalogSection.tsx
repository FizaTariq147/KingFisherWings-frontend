import type { ReactNode } from 'react';
import type { CatalogFormatStatus } from '../../utils/catalogFormatStatus';
import { FormatStatusBadge } from './FormatStatusBadge';

export type FresaCatalogSectionId =
  | 'invoice'
  | 'accounts'
  | 'arrival'
  | 'hbl'
  | 'hawb'
  | 'delivery'
  | 'wms'
  | 'other'
  | 'quotation'
  | 'ops_list'
  | 'commercial_extra'
  | 'sea_extra'
  | 'leftover';

/** Section titles for report-format catalogue families. */
export const FRESA_CATALOG_SECTION_TITLE: Record<FresaCatalogSectionId, string> = {
  invoice: 'Invoice Formats',
  accounts: 'Accounts Formats',
  arrival: 'Arrival Notice',
  hbl: 'HBL',
  hawb: 'HAWB',
  delivery: 'Delivery Order',
  wms: 'WMS – ASN',
  other: 'Other Reports',
  quotation: 'Quotations',
  ops_list: 'Operations Lists',
  commercial_extra: 'Commercial Extras',
  sea_extra: 'Sea Documents (Extra)',
  leftover: 'Additional Formats',
};

/** Freightnest catalogue card tones (enterprise slate/teal — not competitor sky palette). */
export const FRESA_CARD_TONES = [
  {
    bg: 'bg-[var(--color-neutral-50)]',
    border: 'border-[var(--color-neutral-200)]',
    accent: 'bg-[var(--color-primary-600)]',
    label: 'text-[var(--color-primary-800)]',
  },
  {
    bg: 'bg-white',
    border: 'border-[var(--color-neutral-200)]',
    accent: 'bg-[var(--color-neutral-700)]',
    label: 'text-[var(--color-neutral-700)]',
  },
  {
    bg: 'bg-[var(--color-primary-50)]',
    border: 'border-[var(--color-primary-200)]',
    accent: 'bg-[var(--color-primary-700)]',
    label: 'text-[var(--color-primary-900)]',
  },
  {
    bg: 'bg-[var(--color-neutral-50)]',
    border: 'border-[var(--color-neutral-300)]',
    accent: 'bg-[var(--color-neutral-800)]',
    label: 'text-[var(--color-neutral-800)]',
  },
  {
    bg: 'bg-white',
    border: 'border-[var(--color-primary-100)]',
    accent: 'bg-[var(--color-primary-500)]',
    label: 'text-[var(--color-primary-800)]',
  },
] as const;

type FresaCatalogSectionProps = {
  section: FresaCatalogSectionId;
  countLabel: string;
  children: ReactNode;
  empty?: boolean;
  emptyMessage?: string;
};

/**
 * Shared chrome for report-catalogue format strips — Freightnest enterprise styling.
 */
export function FresaCatalogSection({
  section,
  countLabel,
  children,
  empty = false,
  emptyMessage = 'No formats match the current filters.',
}: FresaCatalogSectionProps) {
  const title = FRESA_CATALOG_SECTION_TITLE[section];

  return (
    <section
      className="space-y-2.5 overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white p-3.5 shadow-sm"
      aria-label={title}
    >
      <div className="-mx-3.5 -mt-3.5 mb-1 flex items-baseline justify-between gap-2 border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3.5 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-800)]">
          {title}
        </h3>
        <p className="text-[10px] tabular-nums text-[var(--color-neutral-500)]">{countLabel}</p>
      </div>
      {empty ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">{emptyMessage}</p>
      ) : (
        <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {children}
        </div>
      )}
    </section>
  );
}

type FresaFormatCardProps = {
  active: boolean;
  index: number;
  badge: string;
  name: string;
  title?: string;
  /** Shown when this Format-N reuses another JSON shell (not a unique design). */
  sharedHint?: string | null;
  status?: CatalogFormatStatus | null;
  onClick: () => void;
};

export function FresaFormatCard({
  active,
  index,
  badge,
  name,
  title,
  sharedHint,
  status,
  onClick,
}: FresaFormatCardProps) {
  const n = FRESA_CARD_TONES.length;
  const tone = FRESA_CARD_TONES[((Number(index) % n) + n) % n] ?? FRESA_CARD_TONES[0]!;
  const tip =
    title ||
    (status ? `${name} — ${status.label}: ${status.detail}` : sharedHint ? `${name} — ${sharedHint}` : name);

  return (
    <button
      type="button"
      onClick={onClick}
      title={tip}
      className={[
        'relative min-w-[9.25rem] max-w-[12rem] shrink-0 overflow-hidden rounded-md border px-2.5 py-2.5 text-left transition',
        tone.bg,
        tone.border,
        active
          ? 'shadow-md ring-2 ring-[var(--color-primary-600)] ring-offset-1'
          : 'hover:border-[var(--color-neutral-400)] hover:shadow-sm',
      ].join(' ')}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden />
      <div className="flex items-start justify-between gap-1 pl-1.5">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>{badge}</p>
        {status ? <FormatStatusBadge status={status} /> : null}
      </div>
      <p className="mt-1 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[var(--color-neutral-900)]">
        {name}
      </p>
      {sharedHint || status?.id === 'shared_layout' ? (
        <p className="mt-1 line-clamp-2 pl-1.5 text-[9px] font-medium leading-snug text-amber-800">
          {sharedHint || status?.detail}
        </p>
      ) : null}
    </button>
  );
}
