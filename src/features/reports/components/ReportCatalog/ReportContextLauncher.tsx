import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { ReportContext, ReportFamily } from '../../types/reportCatalog.types';
import {
  buildCatalogHref,
  catalogFamiliesForJobType,
  catalogFamilyForContext,
} from '../../utils/moduleCatalogFamily';

type ReportContextLauncherProps = {
  context: ReportContext;
  /** Entity id passed into generate as context.*_id */
  entityId: string;
  label?: string;
  className?: string;
  /** Job / shipment mode — expands multi-family filter for relevant formats. */
  jobType?: string | null;
  /** Extra linked ids (e.g. shipment page with job + quotation). */
  linked?: {
    job_id?: string | null;
    quotation_id?: string | null;
    invoice_id?: string | null;
    party_id?: string | null;
    shipment_id?: string | null;
  };
  /** Override family allow-list (otherwise derived from context / jobType). */
  families?: ReportFamily[];
};

/**
 * Additive launcher — opens formats catalogue filtered by context + entity id.
 * Live quotation / invoice / job / party / shipment data hydrates every selected format.
 * Does not replace existing PDF / Generate PDF buttons.
 */
export function ReportContextLauncher({
  context,
  entityId,
  label = 'Reports',
  className = '',
  jobType,
  linked,
  families: familiesProp,
}: ReportContextLauncherProps) {
  const family = catalogFamilyForContext(context);
  const families =
    familiesProp?.length
      ? familiesProp
      : jobType
        ? catalogFamiliesForJobType(jobType)
        : undefined;

  const to = buildCatalogHref({
    context,
    family: families?.length ? undefined : family,
    families,
    quotation_id:
      context === 'quotation' ? entityId : linked?.quotation_id || undefined,
    invoice_id: context === 'invoice' ? entityId : linked?.invoice_id || undefined,
    job_id: context === 'job' ? entityId : linked?.job_id || undefined,
    party_id: context === 'party' ? entityId : linked?.party_id || undefined,
    shipment_id: linked?.shipment_id || undefined,
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
