/**
 * Navigate helper usable outside React Router trees (e.g. ToastHost in main.tsx).
 * Wired once from a component mounted under RouterProvider.
 */
type NavigateFn = (to: string) => void;

let navigateFn: NavigateFn | null = null;

export function setAppNavigate(fn: NavigateFn | null): void {
  navigateFn = fn;
}

export function appNavigate(to: string): void {
  if (!to || !to.startsWith('/') || to.startsWith('//')) return;
  if (navigateFn) {
    navigateFn(to);
    return;
  }
  /* Fallback before router mounts — full page load. */
  window.location.assign(to);
}
