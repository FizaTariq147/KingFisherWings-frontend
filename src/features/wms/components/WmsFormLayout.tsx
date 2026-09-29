import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/** Portal-aligned field grid (same rhythm as portal booking forms). */
export function WmsFormGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3', className)}>
      {children}
    </div>
  );
}

/**
 * Section surface matching portal booking form panels —
 * soft radius, light shadow, accent bar. No field/logic changes.
 */
export function WmsFormCard({
  title,
  eyebrow,
  description,
  headerAction,
  children,
}: {
  title: string;
  /** Optional uppercase eyebrow (portal step style). */
  eyebrow?: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--color-neutral-100)] bg-white shadow-[0_10px_30px_rgba(10,41,66,0.05)]">
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-secondary)] to-[var(--color-primary)]" />
      <div className="space-y-4 p-5 sm:p-6">
        <div
          className={cn(
            'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
            headerAction ? '' : '',
          )}
        >
          <div className="min-w-0 space-y-1">
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="text-base font-semibold tracking-tight text-[var(--color-neutral-900)] sm:text-lg">
              {title}
            </h3>
            {description ? (
              <p className="text-sm text-[var(--color-neutral-500)]">{description}</p>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function WmsFormAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      {message}
    </div>
  );
}

export function WmsFormFooter({
  onCancel,
  submitLabel,
  isSubmitting,
  disabled,
}: {
  onCancel: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting || disabled}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}

/** Full-width cell inside WmsFormGrid. */
export function WmsFormSpan2({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}
