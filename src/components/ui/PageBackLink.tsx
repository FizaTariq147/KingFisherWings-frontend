import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BACK_LINK_CLASS =
  'text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors';

export interface PageBackLinkProps {
  /**
   * Fallback path only when there is no in-app history
   * (e.g. user opened the page in a new tab). Prefer history back otherwise.
   */
  to?: string;
  /** Shown after ← ; defaults to "Back". */
  label?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * App-wide text back control.
 * Always returns to the previous screen in history when possible —
 * not a fixed module hub route.
 */
export function PageBackLink({
  to,
  label = 'Back',
  onClick,
  className = '',
  children,
}: PageBackLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const displayLabel =
    !label || label.startsWith('Back to ') || /^Back to /i.test(label) ? 'Back' : label;
  const text = children ?? (displayLabel.startsWith('←') ? displayLabel : `← ${displayLabel}`);

  const goBack = () => {
    if (onClick) {
      onClick();
      return;
    }
    // In-app navigation leaves a non-default location key.
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
    navigate(-1);
  };

  return (
    <button type="button" className={`${BACK_LINK_CLASS} ${className}`.trim()} onClick={goBack}>
      {text}
    </button>
  );
}
