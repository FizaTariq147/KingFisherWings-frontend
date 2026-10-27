import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { smartGoBack } from '@/lib/navigation/returnNavigation';

const BACK_LINK_CLASS =
  'text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] transition-colors';

export interface PageBackLinkProps {
  /**
   * Fallback destination when there is no previous in-app screen
   * (e.g. deep link / refresh). History / `state.from` always win first.
   */
  to?: string;
  /** Shown after ← ; defaults to "Back". */
  label?: string;
  /**
   * Optional override. Prefer omitting this so Back follows history
   * (Dashboard → Jobs → Back → Dashboard).
   */
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * App-wide text back control.
 * Order: previous screen (state.from / history) → fallback `to` → onClick → /dashboard.
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
    // When only onClick is provided (e.g. FormPageHeader + useReturnNavigation.goBack),
    // delegate — goBack already prefers history / return-state.
    if (onClick && !to) {
      onClick();
      return;
    }
    // When `to` is a module fallback, prefer history so Dashboard → list → Back
    // returns to Dashboard instead of a hardcoded sibling route.
    smartGoBack(navigate, location, to || '/dashboard');
  };

  return (
    <button type="button" className={`${BACK_LINK_CLASS} ${className}`.trim()} onClick={goBack}>
      {text}
    </button>
  );
}
