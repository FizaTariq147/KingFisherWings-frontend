import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const BACK_LINK_CLASS =
  'text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors';

export interface PageBackLinkProps {
  /** Destination path. Prefer this over history.back for stable navigation. */
  to?: string;
  /** Shown after ← ; e.g. "Back to jobs" or "Air Export jobs". */
  label?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * Job-style text back control used across list/detail/create pages.
 * Renders: ← {label}
 */
export function PageBackLink({
  to,
  label = 'Back',
  onClick,
  className = '',
  children,
}: PageBackLinkProps) {
  const navigate = useNavigate();
  const text = children ?? (label.startsWith('←') ? label : `← ${label}`);

  return (
    <button
      type="button"
      className={`${BACK_LINK_CLASS} ${className}`.trim()}
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        if (to) {
          navigate(to);
          return;
        }
        navigate(-1);
      }}
    >
      {text}
    </button>
  );
}
