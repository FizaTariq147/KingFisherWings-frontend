import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';

/** Router location.state used when opening create/edit from list or detail. */
export type LocationReturnState = {
  from?: string;
};

function isSafeAppPath(path: unknown): path is string {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
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
 * Shared back/cancel helper for edit & create forms.
 * Prefer `location.state.from`; fall back to an explicit module path (usually detail).
 * Default `replace: true` so Back on the destination does not reopen the form.
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
      navigate(returnPath, { replace: opts?.replace ?? true });
    },
    [navigate, returnPath],
  );

  return { returnPath, goBack, location };
}
