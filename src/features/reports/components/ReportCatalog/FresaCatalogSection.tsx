import type { ReactNode } from 'react';
import { FRESA_UI } from '../../constants/fresaInvoiceColors';

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

/** Titles match https://fresatechnologies.com/sample-report-formats/ section naming. */
export const FRESA_CATALOG_SECTION_TITLE: Record<FresaCatalogSectionId, string> = {
  invoice: 'Invoice Formats',
  accounts: 'Accounts other Formats',
  arrival: 'Arrival Notice',
  hbl: 'HBL',
  hawb: 'HAWB',
  delivery: 'Delivery order',
  wms: 'WMS – ASN',
  other: 'Other Reports',
  quotation: 'Quotations',
  ops_list: 'Operations lists',
  commercial_extra: 'Commercial extras',
  sea_extra: 'Sea documents (extra)',
  leftover: 'Additional formats',
};

const SECTION_ACCENT: Record<FresaCatalogSectionId, string> = {
  invoice: FRESA_UI.sky,
  accounts: FRESA_UI.navy,
  arrival: FRESA_UI.skySoft,
  hbl: FRESA_UI.navy,
  hawb: FRESA_UI.sky,
  delivery: FRESA_UI.skySoft,
  wms: FRESA_UI.navy,
  other: FRESA_UI.sky,
  quotation: FRESA_UI.sky,
  ops_list: FRESA_UI.navy,
  commercial_extra: FRESA_UI.skySoft,
  sea_extra: FRESA_UI.navy,
  leftover: FRESA_UI.sky,
};

/** Sky-blue card tones cycling within Fresa palette (not random brand colors). */
export const FRESA_CARD_TONES = [
  {
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#2286C8]/35',
    accent: 'bg-[#2286C8]',
    label: 'text-[#0F4D96]',
  },
  {
    bg: 'bg-[#EEF6FF]',
    border: 'border-[#0F4D96]/30',
    accent: 'bg-[#0F4D96]',
    label: 'text-[#0F4D96]',
  },
  {
    bg: 'bg-[#F0F9FF]',
    border: 'border-[#38BDF8]/40',
    accent: 'bg-[#2788C9]',
    label: 'text-[#0C4A6E]',
  },
  {
    bg: 'bg-[#EBF0F4]',
    border: 'border-[#0F4D96]/25',
    accent: 'bg-[#0F4D96]',
    label: 'text-[#0F4D96]',
  },
  {
    bg: 'bg-[#D6EEFB]',
    border: 'border-[#2286C8]/40',
    accent: 'bg-[#2286C8]',
    label: 'text-[#0F4D96]',
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
 * Shared chrome for report-catalogue format strips — Fresa sky-blue section bar.
 */
export function FresaCatalogSection({
  section,
  countLabel,
  children,
  empty = false,
  emptyMessage = 'No formats match the current filters.',
}: FresaCatalogSectionProps) {
  const title = FRESA_CATALOG_SECTION_TITLE[section];
  const accent = SECTION_ACCENT[section];

  return (
    <div
      className="space-y-2.5 overflow-hidden rounded-xl border bg-white p-3.5 shadow-sm"
      style={{ borderColor: `${accent}40` }}
    >
      <div
        className="-mx-3.5 -mt-3.5 mb-1 flex items-baseline justify-between gap-2 border-b px-3.5 py-2.5"
        style={{
          background: `linear-gradient(90deg, ${accent}18 0%, #F0F9FF 55%, #FFFFFF 100%)`,
          borderColor: `${accent}33`,
        }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-[0.08em]"
          style={{ color: accent }}
        >
          {title}
        </h3>
        <p className="text-[10px] tabular-nums text-[#64748b]">{countLabel}</p>
      </div>
      {empty ? (
        <p className="px-1 py-2 text-xs text-[#64748b]">{emptyMessage}</p>
      ) : (
        <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {children}
        </div>
      )}
    </div>
  );
}

type FresaFormatCardProps = {
  active: boolean;
  index: number;
  badge: string;
  name: string;
  title?: string;
  onClick: () => void;
};

export function FresaFormatCard({
  active,
  index,
  badge,
  name,
  title,
  onClick,
}: FresaFormatCardProps) {
  const n = FRESA_CARD_TONES.length;
  // JS `%` can be negative when sortOrder-1 is -1 — clamp to a valid tone.
  const tone = FRESA_CARD_TONES[((Number(index) % n) + n) % n] ?? FRESA_CARD_TONES[0]!;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || name}
      className={[
        'relative min-w-[8.75rem] max-w-[11rem] shrink-0 overflow-hidden rounded-lg border px-2.5 py-2.5 text-left transition',
        tone.bg,
        tone.border,
        active
          ? 'shadow-md ring-2 ring-[#2286C8] ring-offset-1'
          : 'hover:-translate-y-0.5 hover:shadow-sm',
      ].join(' ')}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden />
      <p className={`pl-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
        {badge}
      </p>
      <p className="mt-0.5 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[#0F172A]">
        {name}
      </p>
    </button>
  );
}
