import { useNavigate } from 'react-router-dom';
import { useReportsBackLink } from '../hooks/useReportsBackLink';

type ReportsBackButtonProps = {
  fallbackTo: string;
  fallbackLabel: string;
  className?: string;
};

export function ReportsBackButton({
  fallbackTo,
  fallbackLabel,
  className = 'text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1',
}: ReportsBackButtonProps) {
  const navigate = useNavigate();
  const back = useReportsBackLink({ to: fallbackTo, label: fallbackLabel });
  const shortLabel = back.label.replace(/^Back to /, '');

  return (
    <button type="button" className={className} onClick={() => navigate(back.to)}>
      ← {shortLabel}
    </button>
  );
}
