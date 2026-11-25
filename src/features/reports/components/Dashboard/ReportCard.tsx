import { Button } from '@/components/ui/Button';
import { FRESA_CARD_TONES } from '../ReportCatalog/FresaCatalogSection';
import type { DashboardReportCardModel } from '../../utils/dashboardFilters';

type ReportCardProps = {
  report: DashboardReportCardModel;
  index?: number;
  onGenerate: (code: string) => void;
};

function typeLabel(type: DashboardReportCardModel['reportType']): string {
  if (type === 'list') return 'List';
  if (type === 'financial') return 'Financial';
  return 'Transaction';
}

/** Catalogue-style card tones + generate action (dashboard only). */
export function ReportCard({ report, index = 0, onGenerate }: ReportCardProps) {
  const n = FRESA_CARD_TONES.length;
  const tone = FRESA_CARD_TONES[((Number(index) % n) + n) % n] ?? FRESA_CARD_TONES[0]!;

  return (
    <article
      className={[
        'relative flex flex-col overflow-hidden rounded-md border px-3 py-3 text-left shadow-sm transition',
        tone.bg,
        tone.border,
        'hover:border-[var(--color-neutral-400)] hover:shadow-sm',
      ].join(' ')}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden />
      <div className="pl-2 space-y-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
          {report.categoryLabel}
        </p>
        <h3 className="text-[12px] font-semibold leading-snug text-[var(--color-neutral-900)] line-clamp-2">
          {report.name}
        </h3>
        <p className="text-[10px] font-mono text-[var(--color-neutral-500)] truncate">
          {report.code}
        </p>
        <p className="text-[11px] text-[var(--color-neutral-600)] line-clamp-2 min-h-[2rem]">
          {report.description || 'No description in catalogue metadata.'}
        </p>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-1">
          <div>
            <dt className="text-[var(--color-neutral-400)]">Module</dt>
            <dd className="font-medium text-[var(--color-neutral-800)] truncate">
              {report.moduleLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-neutral-400)]">Type</dt>
            <dd className="font-medium text-[var(--color-neutral-800)]">
              {typeLabel(report.reportType)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-neutral-400)]">Formats</dt>
            <dd className="font-medium text-[var(--color-neutral-800)]">
              {report.formats.join(', ')}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-neutral-400)]">Status</dt>
            <dd
              className={
                report.availability === 'available'
                  ? 'font-semibold text-emerald-800'
                  : report.availability === 'partial'
                    ? 'font-semibold text-amber-800'
                    : 'font-semibold text-[var(--color-neutral-600)]'
              }
            >
              {report.availabilityLabel}
            </dd>
          </div>
        </dl>
      </div>
      <div className="mt-3 pl-2 border-t border-[var(--color-neutral-200)]/80 pt-2">
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={report.availability === 'unavailable'}
          onClick={() => onGenerate(report.code)}
        >
          Generate Report
        </Button>
      </div>
    </article>
  );
}
