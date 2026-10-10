import { PageBackLink } from '@/components/ui/PageBackLink';
import { useReportsBackLink } from '../hooks/useReportsBackLink';

type ReportsPageBackLinkProps = {
  /** Module hub when the user did not enter via Reports. */
  fallbackTo: string;
  fallbackLabel?: string;
};

/**
 * Reports-aware back control: returns to `/reports` when `?from=reports`,
 * otherwise uses the explicit module fallback.
 */
export function ReportsPageBackLink({
  fallbackTo,
  fallbackLabel = 'Back',
}: ReportsPageBackLinkProps) {
  const link = useReportsBackLink({ to: fallbackTo, label: fallbackLabel });
  return (
    <PageBackLink
      to={link.to}
      label={link.label.startsWith('Back to ') ? 'Back' : link.label}
    />
  );
}
