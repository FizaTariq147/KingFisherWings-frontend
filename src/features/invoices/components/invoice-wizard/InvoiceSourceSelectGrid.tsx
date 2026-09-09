import { BriefcaseBusiness, FilePlus2 } from 'lucide-react';
import type { InvoiceCreateMode } from '../../constants/invoiceWizard.constants';
import { INVOICE_CREATE_MODE_LABELS } from '../../constants/invoiceWizard.constants';

type InvoiceSourceSelectGridProps = {
  value?: InvoiceCreateMode;
  onChange: (mode: InvoiceCreateMode) => void;
  error?: string;
  heading?: string;
};

const MODE_STYLES: Record<
  InvoiceCreateMode,
  { icon: typeof FilePlus2; circleClass: string; hoverClass: string }
> = {
  MANUAL: {
    icon: FilePlus2,
    circleClass: 'bg-sky-600',
    hoverClass: 'hover:bg-sky-50 hover:border-sky-300',
  },
  FROM_JOB: {
    icon: BriefcaseBusiness,
    circleClass: 'bg-amber-600',
    hoverClass: 'hover:bg-amber-50 hover:border-amber-300',
  },
};

export function InvoiceSourceSelectGrid({
  value,
  onChange,
  error,
  heading = 'How would you like to create this invoice?',
}: InvoiceSourceSelectGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-center text-base font-semibold text-[var(--color-neutral-800)] sm:text-lg">
        {heading}
      </h3>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(MODE_STYLES) as InvoiceCreateMode[]).map((mode) => {
          const style = MODE_STYLES[mode];
          const Icon = style.icon;
          const selected = value === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode)}
              aria-pressed={selected}
              className={[
                'flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-4 text-left transition-colors',
                selected
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50,#eff6ff)] ring-1 ring-[var(--color-primary-500)]'
                  : `border-[var(--color-neutral-200)] ${style.hoverClass}`,
              ].join(' ')}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-800)]">
                {INVOICE_CREATE_MODE_LABELS[mode]}
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
