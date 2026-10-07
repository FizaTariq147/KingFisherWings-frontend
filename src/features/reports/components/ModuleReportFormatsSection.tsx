import { Link } from 'react-router-dom';
import { FileStack } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useReportTemplatesBrowse } from '../hooks/useReportCatalog';
import type { ReportFamily } from '../types/reportCatalog.types';
import { reportFamilyLabel } from '../types/reportCatalog.types';
import { filterRegistry } from '../data/fresaReportRegistry';
import { buildCatalogHref } from '../utils/moduleCatalogFamily';
import { reportFamilyAllowed } from '../utils/reportModuleAccess';
import { useAuth } from '@/hooks/useAuth';

type ModuleReportFormatsSectionProps = {
  /** OpenAPI report families for this module hub (from catalogue, not hardcoded codes). */
  families: ReportFamily[];
  title?: string;
  description?: string;
};

/**
 * Lists catalogue format templates for one or more families (GET /reports/templates).
 * Falls back to local FRESA registry when the live catalogue is unavailable.
 * Selecting a row opens the formats catalogue — entity deep-links hydrate live data.
 */
export function ModuleReportFormatsSection({
  families,
  title = 'Report formats from catalogue',
  description = 'These formats come from the report catalogue. Open one to preview or generate; open from a quotation, invoice, or job to fill it with that record’s data.',
}: ModuleReportFormatsSectionProps) {
  const { user } = useAuth();
  const enabledModules = user?.enabledModules;
  const primaryFamily = families[0];
  // Load live catalogue once; filter to this module’s families (OpenAPI enum).
  const browse = useReportTemplatesBrowse({}, Boolean(families.length));

  const items = (() => {
    const live = browse.data?.items ?? [];
    const allowedLive = live.filter(
      (t) =>
        families.includes(t.family as ReportFamily) &&
        reportFamilyAllowed(t.family, enabledModules),
    );
    if (allowedLive.length > 0) return allowedLive;

    // Local taxonomy fallback when API empty / unavailable — still family-filtered, not hardcoded codes.
    return families.flatMap((family) =>
      filterRegistry({ family }).filter((meta) =>
        reportFamilyAllowed(meta.family, enabledModules),
      ),
    );
  })();

  if (!families.length) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-800)] flex items-center gap-2">
            <FileStack className="h-4 w-4 text-[var(--color-primary-600)]" aria-hidden />
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">{description}</p>
          <p className="mt-1 text-[11px] text-[var(--color-neutral-400)]">
            Families:{' '}
            {families.map((f) => reportFamilyLabel(f)).join(' · ')}
          </p>
        </div>
        <Link
          to={buildCatalogHref({ family: primaryFamily })}
          className="text-xs font-medium text-[var(--color-primary-700)] hover:underline"
        >
          Open full catalogue
        </Link>
      </div>

      {browse.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)] py-4">Loading formats…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-400)] py-4">
          No catalogue formats for this module yet. Import the registry from the formats catalogue
          if the backend pack list is empty.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 48).map((item) => {
            const code = 'code' in item ? String(item.code) : '';
            const name = 'name' in item ? String(item.name) : code;
            const family = ('family' in item ? String(item.family) : primaryFamily) as ReportFamily;
            return (
              <li key={code}>
                <Link
                  to={buildCatalogHref({ family, code })}
                  className="block rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 hover:border-[var(--color-primary-400)] hover:bg-[var(--color-neutral-50)]"
                >
                  <p className="text-xs font-medium text-[var(--color-neutral-800)] truncate">
                    {name}
                  </p>
                  <p className="text-[10px] text-[var(--color-neutral-400)] truncate">{code}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > 48 ? (
        <p className="text-xs text-[var(--color-neutral-400)]">
          Showing 48 of {items.length}.{' '}
          <Link
            to={buildCatalogHref({ family: primaryFamily })}
            className="text-[var(--color-primary-700)] hover:underline"
          >
            View all in catalogue
          </Link>
        </p>
      ) : null}
    </Card>
  );
}
