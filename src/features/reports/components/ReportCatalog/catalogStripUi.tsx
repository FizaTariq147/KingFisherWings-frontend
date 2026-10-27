/** Shared browse-strip chrome — Fresa sky-blue system (kept for legacy imports). */

export const CATALOG_STRIP_CARD_TONES = [
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

export function catalogStripTone(index: number) {
  return CATALOG_STRIP_CARD_TONES[index % CATALOG_STRIP_CARD_TONES.length]!;
}

export const CATALOG_STRIP_SHELL =
  'space-y-2.5 overflow-hidden rounded-xl border border-[#2286C8]/25 bg-white p-3.5 shadow-sm';

export const CATALOG_STRIP_TITLE =
  'text-xs font-semibold uppercase tracking-[0.08em] text-[#2286C8]';

export const CATALOG_STRIP_META = 'text-[10px] tabular-nums text-[#64748b]';

export const CATALOG_STRIP_SCROLL =
  '-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]';

export function catalogStripCardClass(active: boolean, tone: { bg: string; border: string }) {
  return [
    'relative min-w-[8.25rem] max-w-[10.5rem] shrink-0 overflow-hidden rounded-lg border px-2.5 py-2.5 text-left transition',
    tone.bg,
    tone.border,
    active
      ? 'ring-2 ring-[#2286C8] ring-offset-1 shadow-md'
      : 'hover:-translate-y-0.5 hover:shadow-sm',
  ].join(' ');
}
