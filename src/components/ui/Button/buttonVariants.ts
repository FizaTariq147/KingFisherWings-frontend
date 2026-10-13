import type { CSSProperties } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Shared Freightnest button styles — Fresa-inspired professional ERP chrome.
 * Primary = sidebar navy (#0A2942).
 * Chrome Create/Edit/Report/Back use `.kf-btn-*` classes (index.css) so hex
 * swatches always paint even if Tailwind purges arbitrary classes.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)] disabled:saturate-50',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--btn-primary-bg,#0A2942)] text-[var(--btn-primary-text,#FFFFFF)]',
          'hover:bg-[var(--btn-primary-hover,#163E60)] active:bg-[var(--btn-primary-active,#0A2942)]',
          'focus-visible:ring-[var(--btn-primary-ring,#0A2942)]',
        ].join(' '),
        secondary: [
          'bg-[var(--btn-secondary-bg,#FFFFFF)] text-[var(--btn-secondary-text,#1E293B)]',
          'border border-[var(--btn-secondary-border,#C9D3DF)]',
          'hover:bg-[var(--btn-secondary-hover,#F4F6F9)]',
          'focus-visible:ring-[var(--btn-secondary-ring,#0A2942)]',
        ].join(' '),
        /** Header chrome — Back (slate) */
        back: 'kf-btn-back focus-visible:ring-[#99A5A4]',
        /** Header chrome — Report (violet) */
        report: 'kf-btn-report focus-visible:ring-[#7C3AED]',
        /** Header chrome — Edit (sky) */
        edit: 'kf-btn-edit focus-visible:ring-[#0284C7]',
        /** Create / Add — same navy as sidebar (`--color-sidebar-bg` / #0A2942) */
        create: 'kf-btn-create focus-visible:ring-[var(--color-sidebar-bg,#0A2942)]',
        success: 'kf-btn-success focus-visible:ring-[#22C55E]',
        warning: 'kf-btn-warning focus-visible:ring-[#F59E0B]',
        danger: 'kf-btn-danger focus-visible:ring-[#EF4444]',
        ghost: [
          'bg-transparent text-[var(--btn-ghost-text)]',
          'hover:bg-[var(--btn-ghost-hover)]',
          'focus-visible:ring-[var(--btn-ghost-ring)]',
        ].join(' '),
      },
      size: {
        sm: 'h-7 px-2.5 text-[12px]',
        md: 'h-8 px-3 text-[13px]',
        lg: 'h-9 px-4 text-sm',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/**
 * Inline hex fallbacks — cream swatches (#FFFEFB / #FAF9F8 / #FFF9FE) read as
 * “uncolored” on white pages, so chrome uses solid fills that stay visible.
 */
export const COLORED_BUTTON_STYLE: Record<
  'create' | 'edit' | 'report' | 'back' | 'success' | 'warning' | 'danger' | 'primary',
  CSSProperties
> = {
  /** Create / Add — sidebar navy (`--color-sidebar-bg` / #0A2942). */
  create: {
    backgroundColor: '#0A2942',
    color: '#FFFFFF',
    borderColor: '#061B2C',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  edit: {
    backgroundColor: '#0EA5E9',
    color: '#FFFFFF',
    borderColor: '#0284C7',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  report: {
    backgroundColor: '#A855F7',
    color: '#FFFFFF',
    borderColor: '#7C3AED',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  back: {
    backgroundColor: '#99A5A4',
    color: '#FFFFFF',
    borderColor: '#879391',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  success: {
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    borderColor: '#16A34A',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  warning: {
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    borderColor: '#D97706',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  danger: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    borderColor: '#DC2626',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  primary: {
    backgroundColor: '#0A2942',
    color: '#FFFFFF',
    borderColor: '#061B2C',
    borderWidth: 1,
    borderStyle: 'solid',
  },
};

/** @deprecated Use COLORED_BUTTON_STYLE */
export const CHROME_BUTTON_STYLE = COLORED_BUTTON_STYLE;

export function isColoredButtonVariant(
  variant: ButtonVariantProps['variant'] | undefined,
): variant is keyof typeof COLORED_BUTTON_STYLE {
  return (
    variant === 'create' ||
    variant === 'edit' ||
    variant === 'report' ||
    variant === 'back' ||
    variant === 'success' ||
    variant === 'warning' ||
    variant === 'danger' ||
    variant === 'primary'
  );
}

export function isChromeButtonVariant(
  variant: ButtonVariantProps['variant'] | undefined,
): variant is 'create' | 'edit' | 'report' | 'back' {
  return variant === 'create' || variant === 'edit' || variant === 'report' || variant === 'back';
}
