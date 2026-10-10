import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { listShell } from '@/lib/erpTypography';

export function EmptyState({
  title = 'No records found',
  description,
  action,
}: {
  title?: string;
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className={listShell.empty}>
      <p className="font-medium text-[var(--color-neutral-600)]">{title}</p>
      {description ? (
        <p className="mt-1 text-[var(--color-neutral-400)]">{description}</p>
      ) : null}
      {action ? (
        <Button type="button" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
