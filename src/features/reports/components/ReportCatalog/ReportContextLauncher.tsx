import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { REPORT_CATALOG_ROUTE } from '../../api/reportCatalog.api';
import type { ReportContext } from '../../types/reportCatalog.types';

type ReportContextLauncherProps = {
  context: ReportContext;
  /** Entity id passed into generate as context.*_id */
  entityId: string;
  label?: string;
  className?: string;
};

/**
 * Additive launcher — opens FRESA catalog filtered by context.
 * Does not replace existing PDF / Generate PDF buttons.
 */
export function ReportContextLauncher({
  context,
  entityId,
  label = 'Reports',
  className = '',
}: ReportContextLauncherProps) {
  const paramKey =
    context === 'job'
      ? 'job_id'
      : context === 'quotation'
        ? 'quotation_id'
        : context === 'invoice'
          ? 'invoice_id'
          : context === 'party'
            ? 'party_id'
            : 'id';

  const to = `${REPORT_CATALOG_ROUTE}?context=${encodeURIComponent(context)}&${paramKey}=${encodeURIComponent(entityId)}`;

  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <FileText className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Link>
  );
}
