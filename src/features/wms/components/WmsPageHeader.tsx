import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface WmsPageHeaderProps {
  backTo: string;
  backLabel?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** Page chrome aligned with portal page headers (visual only). */
export function WmsPageHeader({
  backTo,
  backLabel = 'Warehouse',
  title,
  description,
  actions,
}: WmsPageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <button
          type="button"
          className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-secondary)] hover:opacity-80"
          onClick={() => navigate(backTo)}
        >
          ← {backLabel}
        </button>
        <h2 className="text-[28px] font-semibold tracking-tight text-[#0A2942]">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-sm text-[#7A8A98]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
