import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ContinuumStep } from './buildFclContinuumSteps';

const stepClass = (step: ContinuumStep) => {
  if (step.blocked) {
    return 'bg-[var(--color-danger-100)] text-[var(--color-danger-700)] ring-1 ring-[var(--color-danger-200)]';
  }
  if (step.done) {
    return 'bg-[var(--color-success-100)] text-[var(--color-success-700)]';
  }
  if (step.current) {
    return 'bg-[var(--fresa-action,#0A2942)] text-white shadow-sm';
  }
  return 'text-[var(--color-neutral-500)]';
};

/** Compact Party → … → Job rail driven by known IDs/status (not fake progress). */
export function FclContinuumRail({
  steps,
  className,
}: {
  steps: ContinuumStep[];
  className?: string;
}) {
  return (
    <nav
      aria-label="FCL workflow"
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-xs',
        className,
      )}
    >
      {steps.map((step, index) => (
        <span key={step.key} className="flex items-center gap-1">
          {index > 0 && (
            <span className="mx-0.5 text-[var(--fresa-border,#C9D3DF)]" aria-hidden>
              →
            </span>
          )}
          {step.href && step.done && !step.blocked ? (
            <Link
              to={step.href}
              className={cn(
                'rounded-sm px-2 py-0.5 font-medium underline-offset-2 hover:underline',
                stepClass(step),
              )}
            >
              {step.label}
            </Link>
          ) : (
            <span className={cn('rounded-sm px-2 py-0.5 font-medium', stepClass(step))}>
              {step.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
