import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PortalPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PortalPageHeader({ title, description, actions, className }: PortalPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-[28px] font-semibold tracking-tight text-[#0A2942]">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-[#7A8A98] max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
