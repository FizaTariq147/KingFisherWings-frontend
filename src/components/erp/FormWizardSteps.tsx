import { cn } from '@/lib/utils';

export interface FormWizardStep {
  key: string;
  label: string;
}

/** Fresa-style wizard step strip (Port Details → Consignment → Charges → Summary). */
export function FormWizardSteps({
  steps,
  activeKey,
  onSelect,
  className,
}: {
  steps: FormWizardStep[];
  activeKey: string;
  onSelect?: (key: string) => void;
  className?: string;
}) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === activeKey),
  );

  return (
    <ol
      className={cn(
        'flex flex-wrap items-stretch overflow-hidden rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white',
        className,
      )}
    >
      {steps.map((step, index) => {
        const active = step.key === activeKey;
        const done = index < activeIndex;
        return (
          <li key={step.key} className="flex min-w-0 flex-1">
            <button
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(step.key)}
              className={cn(
                'flex w-full items-center gap-2 border-r border-[var(--fresa-border,#C9D3DF)] px-3 py-2 text-left text-[12px] font-medium last:border-r-0',
                active && 'bg-[var(--fresa-action,#0A2942)] text-white',
                done && !active && 'bg-[var(--fresa-action-soft,#E9EEF2)] text-[var(--fresa-action,#0A2942)]',
                !active && !done && 'bg-[var(--fresa-page-bg,#F4F6F9)] text-[#64748b]',
                onSelect && !active && 'hover:bg-[var(--fresa-action-soft,#E9EEF2)]',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                  active && 'bg-white/20 text-white',
                  done && !active && 'bg-[var(--fresa-action,#0A2942)] text-white',
                  !active && !done && 'bg-[#e2e8f0] text-[#475569]',
                )}
              >
                {index + 1}
              </span>
              <span className="truncate">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
