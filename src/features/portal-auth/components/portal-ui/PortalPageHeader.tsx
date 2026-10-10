import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { appType } from '@/lib/erpTypography';

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
        <h1 className={appType.pageTitle}>{title}</h1>
        {description ? <p className={appType.pageSubtitle}>{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
