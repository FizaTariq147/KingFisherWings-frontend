import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getReturnPath } from '@/lib/navigation/returnNavigation';

const BACK_LINK_CLASS =
  'text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors';

export interface PageBackLinkProps {
  /**
   * Explicit destination (module list / detail). Used when provided so Back
   * matches the labeled route instead of an arbitrary history entry.
   * If omitted, uses `location.state.from` then history (`-1`).
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
 * Order: onClick → explicit `to` → `state.from` → history (-1).
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
    if (to) {
      navigate(to);
      return;
    }
    const from = getReturnPath(location, '');
    if (from) {
      navigate(from);
      return;
    }
    if (location.key !== 'default') {
      navigate(-1);
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
