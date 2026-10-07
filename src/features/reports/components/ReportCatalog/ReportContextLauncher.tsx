import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { ReportContext } from '../../types/reportCatalog.types';
import {
  buildCatalogHref,
  catalogFamilyForContext,
} from '../../utils/moduleCatalogFamily';

type ReportContextLauncherProps = {
  context: ReportContext;
  /** Entity id passed into generate as context.*_id */
  entityId: string;
  label?: string;
  className?: string;
};

/**
 * Additive launcher — opens formats catalogue filtered by context + entity id.
 * Live quotation / invoice / job / party data hydrates every selected format.
 * Does not replace existing PDF / Generate PDF buttons.
 */
export function ReportContextLauncher({
  context,
  entityId,
  label = 'Reports',
  className = '',
}: ReportContextLauncherProps) {
  const family = catalogFamilyForContext(context);
  const to = buildCatalogHref({
    context,
    family,
    quotation_id: context === 'quotation' ? entityId : undefined,
    invoice_id: context === 'invoice' ? entityId : undefined,
    job_id: context === 'job' ? entityId : undefined,
    party_id: context === 'party' ? entityId : undefined,
  });

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
