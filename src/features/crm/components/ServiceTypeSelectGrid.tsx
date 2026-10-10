import {
  JOB_TYPE_CARD_LABELS,
  JOB_TYPE_CARD_STYLES,
} from '@/features/quotations/constants/jobTypeCardStyles';
import { SERVICE_TYPES, type ServiceType } from '../constants/crm.constants';

type ServiceTypeSelectGridProps = {
  value?: string;
  onChange: (serviceType: ServiceType) => void;
  error?: string;
  heading?: string;
};

export function ServiceTypeSelectGrid({
  value,
  onChange,
  error,
  heading = 'Select the required Department',
}: ServiceTypeSelectGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-center text-base font-semibold text-[var(--color-neutral-800)] sm:text-lg">
        {heading}
      </h3>
      <p className="text-center text-xs text-[var(--color-neutral-500)]">
        Choose the department / service for this Enquiry Sheet, then continue to Port Details.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SERVICE_TYPES.map((serviceType) => {
          const style = JOB_TYPE_CARD_STYLES[serviceType as keyof typeof JOB_TYPE_CARD_STYLES];
          const Icon = style?.icon;
          const selected = value === serviceType;
          const label =
            JOB_TYPE_CARD_LABELS[serviceType as keyof typeof JOB_TYPE_CARD_LABELS] ??
            serviceType.replaceAll('_', ' ');
          return (
            <button
              key={serviceType}
              type="button"
              onClick={() => onChange(serviceType)}
              aria-pressed={selected}
              className={[
                'flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left transition-colors',
                selected
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50,#eff6ff)] ring-1 ring-[var(--color-primary-500)]'
                  : `border-[var(--color-neutral-200)] ${style?.hoverClass ?? 'hover:bg-[var(--color-neutral-50)]'}`,
              ].join(' ')}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-800)]">
                {label}
              </span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${style?.circleClass ?? 'bg-[var(--color-primary)]'}`}
                aria-hidden
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
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
