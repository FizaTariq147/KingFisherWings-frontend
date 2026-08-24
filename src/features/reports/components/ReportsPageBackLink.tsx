import { PageBackLink } from '@/components/ui/PageBackLink';
import { useReportsBackLink } from '../hooks/useReportsBackLink';

type ReportsPageBackLinkProps = {
  fallbackTo: string;
  fallbackLabel: string;
};

export function ReportsPageBackLink({ fallbackTo, fallbackLabel }: ReportsPageBackLinkProps) {
  const back = useReportsBackLink({ to: fallbackTo, label: fallbackLabel });
  return <PageBackLink to={back.to} label={back.label} />;
}
