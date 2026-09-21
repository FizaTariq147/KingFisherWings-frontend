import { PageBackLink } from '@/components/ui/PageBackLink';

type ReportsPageBackLinkProps = {
  /** Fallback only when there is no previous history entry. */
  fallbackTo: string;
  fallbackLabel?: string;
};

/**
 * Reports page back control — previous screen in history, not the module hub.
 */
export function ReportsPageBackLink({
  fallbackTo,
  fallbackLabel = 'Back',
}: ReportsPageBackLinkProps) {
  return (
    <PageBackLink
      to={fallbackTo}
      label={fallbackLabel.startsWith('Back to ') ? 'Back' : fallbackLabel}
    />
  );
}
