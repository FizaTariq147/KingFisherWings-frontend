import { JOB_TYPES, type JobType } from '../../constants/quotation.constants';
import {
  JOB_TYPE_CARD_LABELS,
  JOB_TYPE_CARD_STYLES,
} from '../../constants/jobTypeCardStyles';

type JobTypeSelectGridProps = {
  value?: string;
  onChange: (jobType: JobType) => void;
  error?: string;
  heading?: string;
};

export function JobTypeSelectGrid({
  value,
  onChange,
  error,
  heading = 'What type of Quotation would you like to create?',
}: JobTypeSelectGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-center text-base font-semibold text-[var(--color-neutral-800)] sm:text-lg">
        {heading}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {JOB_TYPES.map((jobType) => {
          const style = JOB_TYPE_CARD_STYLES[jobType];
          const Icon = style.icon;
          const selected = value === jobType;
          return (
            <button
              key={jobType}
              type="button"
              onClick={() => onChange(jobType)}
              aria-pressed={selected}
              className={[
                'flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left transition-colors',
                selected
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50,#eff6ff)] ring-1 ring-[var(--color-primary-500)]'
                  : `border-[var(--color-neutral-200)] ${style.hoverClass}`,
              ].join(' ')}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-800)]">
                {JOB_TYPE_CARD_LABELS[jobType]}
              </span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${style.circleClass}`}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-center text-xs text-[var(--color-danger-500)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
