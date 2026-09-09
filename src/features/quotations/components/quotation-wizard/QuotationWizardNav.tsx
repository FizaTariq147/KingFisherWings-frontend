import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QUOTATION_WIZARD_STEP_COUNT } from '../../constants/jobTypeCardStyles';

type QuotationWizardNavProps = {
  currentStep: number;
  /** Defaults to staff create wizard length from QUOTATION_WIZARD_STEPS. */
  totalSteps?: number;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  nextLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  disableNext?: boolean;
};

export function QuotationWizardNav({
  currentStep,
  totalSteps = QUOTATION_WIZARD_STEP_COUNT,
  onPrevious,
  onNext,
  onCancel,
  nextLabel,
  submitLabel = 'Submit',
  isSubmitting,
  disableNext,
}: QuotationWizardNavProps) {
  const isLast = currentStep >= totalSteps - 1;
  const label = nextLabel ?? (isLast ? submitLabel : 'Next');

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-neutral-100)] pt-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={currentStep <= 0 || isSubmitting}
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Button>
        <Button type="button" variant="danger" disabled={isSubmitting} onClick={onCancel}>
          <X className="h-4 w-4" aria-hidden />
          Cancel
        </Button>
      </div>
      <Button type="button" disabled={isSubmitting || disableNext} onClick={onNext}>
        {isSubmitting ? 'Saving…' : label}
        {!isLast && !isSubmitting ? <ChevronRight className="h-4 w-4" aria-hidden /> : null}
      </Button>
    </div>
  );
}
