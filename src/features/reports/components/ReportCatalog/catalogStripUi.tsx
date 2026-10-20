/** Shared browse-strip chrome so every family section matches Invoice / HBL cards. */

export const CATALOG_STRIP_CARD_TONES = [
  {
    bg: 'bg-[var(--color-primary-100)]',
    border: 'border-[var(--color-primary-500)]/30',
    accent: 'bg-[var(--color-primary-500)]',
    label: 'text-[var(--color-primary-600)]',
  },
  {
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  {
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/30',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-500)]',
  },
  {
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  {
    bg: 'bg-[var(--color-danger-50)]',
    border: 'border-[var(--color-danger-500)]/25',
    accent: 'bg-[var(--color-danger-500)]',
    label: 'text-[var(--color-danger-600)]',
  },
  {
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#2286C8]/35',
    accent: 'bg-[#2286C8]',
    label: 'text-[#0F4D96]',
  },
] as const;

export function catalogStripTone(index: number) {
  return CATALOG_STRIP_CARD_TONES[index % CATALOG_STRIP_CARD_TONES.length]!;
}

export const CATALOG_STRIP_SHELL =
  'space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm';

export const CATALOG_STRIP_TITLE =
  'text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-600)]';

export const CATALOG_STRIP_META = 'text-[10px] text-[var(--color-neutral-400)]';

export const CATALOG_STRIP_SCROLL =
  '-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]';

export function catalogStripCardClass(active: boolean, tone: { bg: string; border: string }) {
  return [
    'relative min-w-[8.25rem] max-w-[10.5rem] shrink-0 overflow-hidden rounded-lg border px-2.5 py-2.5 text-left transition',
    tone.bg,
    tone.border,
    active
      ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md'
      : 'hover:-translate-y-0.5 hover:shadow-sm',
  ].join(' ');
}
