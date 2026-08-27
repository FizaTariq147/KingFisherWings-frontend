import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface WmsPageHeaderProps {
  backTo: string;
  backLabel?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function WmsPageHeader({
  backTo,
  backLabel = 'Warehouse',
  title,
  description,
  actions,
}: WmsPageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <button
          type="button"
          className="mb-1 text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
          onClick={() => navigate(backTo)}
        >
          ← {backLabel}
        </button>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-[var(--color-neutral-400)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
