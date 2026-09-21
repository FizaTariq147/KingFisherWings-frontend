import { PageBackLink } from '@/components/ui/PageBackLink';

type ReportsBackButtonProps = {
  /** Fallback only when there is no previous history entry. */
  fallbackTo: string;
  fallbackLabel?: string;
  className?: string;
};

/**
 * Reports back control — previous screen in history, not the reports/module hub.
 */
export function ReportsBackButton({
  fallbackTo,
  fallbackLabel = 'Back',
  className = 'mb-1',
}: ReportsBackButtonProps) {
  return (
    <PageBackLink
      to={fallbackTo}
      label={fallbackLabel.startsWith('Back') ? 'Back' : fallbackLabel}
      className={className}
    />
  );
}
