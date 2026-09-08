import { Check } from 'lucide-react';
import { QUOTATION_WIZARD_STEPS } from '../../constants/jobTypeCardStyles';

type QuotationWizardStepperProps = {
  /** 0-based active step index */
  currentStep: number;
  className?: string;
};

export function QuotationWizardStepper({ currentStep, className = '' }: QuotationWizardStepperProps) {
  return (
    <nav
      aria-label="Quotation steps"
      className={`w-full overflow-x-auto pb-1 ${className}`.trim()}
    >
      <ol className="relative mx-auto flex min-w-[520px] max-w-3xl items-start justify-between px-2">
        {/* Connector line behind dots */}
        <li
          aria-hidden="true"
          className="pointer-events-none absolute left-[10%] right-[10%] top-3.5 h-px bg-[var(--color-neutral-200)]"
        />
        {QUOTATION_WIZARD_STEPS.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={step.key} className="relative z-[1] flex w-28 flex-col items-center text-center sm:w-36">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  done
                    ? 'border-[var(--color-success-600,#16a34a)] bg-[var(--color-success-600,#16a34a)] text-white'
                    : active
                      ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-600)] text-white'
                      : 'border-[var(--color-neutral-300)] bg-white text-[var(--color-neutral-400)]',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
                {!done && active ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                {!done && !active ? <span className="h-2 w-2 rounded-full bg-[var(--color-neutral-300)]" /> : null}
              </span>
              <span
                className={[
                  'mt-2 text-[11px] font-medium leading-tight sm:text-xs',
                  active || done
                    ? 'text-[var(--color-neutral-800)]'
                    : 'text-[var(--color-neutral-400)]',
                ].join(' ')}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
