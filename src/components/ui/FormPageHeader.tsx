import type { ReactNode } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { appType } from '@/lib/erpTypography';

export interface FormPageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Explicit back target (detail or list). */
  backTo?: string;
  backLabel?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

/** Shared chrome for create/edit form pages — consistent back + title typography. */
export function FormPageHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  onBack,
  actions,
}: FormPageHeaderProps) {
  return (
    <div className="space-y-3">
      <PageBackLink to={backTo} label={backLabel} onClick={onBack} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className={appType.pageTitle}>{title}</h1>
          {subtitle ? <p className={appType.pageSubtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
