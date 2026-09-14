import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

/** Matches Payment Request / Master create form field grid. */
export function WmsFormGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0 ${className}`.trim()}>
      {children}
    </div>
  );
}

export function WmsFormCard({
  title,
  headerAction,
  children,
}: {
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className={headerAction ? 'flex flex-row items-center justify-between gap-2' : undefined}>
        <CardTitle>{title}</CardTitle>
        {headerAction ?? null}
      </CardHeader>
      {children}
    </Card>
  );
}

export function WmsFormAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border px-3 py-2 text-sm"
      style={{
        background: 'var(--color-danger-100)',
        borderColor: '#FECACA',
        color: 'var(--color-danger-700)',
      }}
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
    <div className="flex justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting || disabled}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}

/** Full-width cell inside WmsFormGrid. */
export function WmsFormSpan2({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}
