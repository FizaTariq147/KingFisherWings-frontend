import type { ReactNode } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { appType } from '@/lib/erpTypography';

interface WmsPageHeaderProps {
  backTo: string;
  backLabel?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** Page chrome aligned with ERP/portal page headers. */
export function WmsPageHeader({
  backTo,
  backLabel = 'Warehouse',
  title,
  description,
  actions,
}: WmsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <PageBackLink to={backTo} label={backLabel} className="mb-0.5" />
        <h1 className={appType.pageTitle}>{title}</h1>
        {description ? <p className={appType.pageSubtitle}>{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
