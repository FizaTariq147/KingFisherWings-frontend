import { useCallback, useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  type Location,
  type NavigateFunction,
  type NavigateOptions,
} from 'react-router-dom';

/** Router location.state used when opening create/edit from list or detail. */
export type LocationReturnState = {
  from?: string;
};

function isSafeAppPath(path: unknown): path is string {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
}

function sameAppPath(a: string, b: string): boolean {
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  return norm(a) === norm(b);
}

/** Current pathname + search for use as `state.from` when opening another route. */
export function buildReturnState(location: {
  pathname: string;
  search?: string;
}): LocationReturnState {
  return { from: `${location.pathname}${location.search ?? ''}` };
}

/** Resolve where “Back” / cancel should go: `state.from` when safe, else fallback. */
export function getReturnPath(
  location: { state?: unknown },
  fallback: string,
): string {
  const from = (location.state as LocationReturnState | null | undefined)?.from;
  if (isSafeAppPath(from)) return from;
  return fallback;
}

/**
 * Navigate to an edit (or other) route while remembering the current screen
 * so cancel/back can return here instead of relying on browser history.
 */
export function navigateWithReturn(
  navigate: ReturnType<typeof useNavigate>,
  to: string,
  location: { pathname: string; search?: string },
  options?: Omit<NavigateOptions, 'state'>,
) {
  navigate(to, { ...options, state: buildReturnState(location) });
}

/**
 * App-wide back navigation:
 * 1) explicit `location.state.from` (when set by navigateWithReturn)
 * 2) browser history (−1) when the user actually came from another in-app screen
 * 3) module fallback path (list / dashboard)
 *
 * Avoids `navigate(fallback)` when history exists — that was stacking the list
 * again so Back from the list reopened the detail page.
 */
export function smartGoBack(
  navigate: NavigateFunction,
  location: Pick<Location, 'pathname' | 'search' | 'state' | 'key'>,
  fallback = '/dashboard',
  opts?: { replace?: boolean },
): void {
  const replace = opts?.replace ?? false;
  const from = getReturnPath(location, '');
  const here = `${location.pathname}${location.search ?? ''}`;

  if (from && !sameAppPath(from, here)) {
    navigate(from, { replace });
    return;
  }

  // React Router sets key to "default" on the first entry in a tab.
  if (location.key !== 'default') {
    navigate(-1);
    return;
  }

  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1);
    return;
  }

  navigate(fallback || '/dashboard', { replace: true });
}

/**
 * Shared back/cancel helper for edit & create forms.
 * Prefer previous screen (state.from / history); fall back to module path.
 */
export function useReturnNavigation(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = useMemo(
    () => getReturnPath(location, fallback),
    [location, fallback],
  );

  const goBack = useCallback(
    (opts?: { replace?: boolean }) => {
      smartGoBack(navigate, location, fallback, {
        replace: opts?.replace ?? true,
      });
    },
    [navigate, location, fallback],
  );

  return { returnPath, goBack, location };
}
