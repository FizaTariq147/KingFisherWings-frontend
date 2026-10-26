/**
 * Shared Favorites chrome — matches /sales/shipments-list Favorites control.
 * Purple fill + white label; use everywhere Favorites appears.
 */
export const FAVOURITES_PURPLE = '#6D28D9'; /* Tailwind purple-700 */
export const FAVOURITES_PURPLE_HOVER = '#5B21B6'; /* purple-800 */

/** Page-level “Favorites” pill (list footers, sales/HR chrome). */
export const FAVOURITES_CHROME_BTN_CLASS =
  'inline-flex items-center gap-1.5 rounded bg-purple-700 px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45';

/** Dashboard Favorites panel surface (same purple + white type). */
export const FAVOURITES_PANEL_SURFACE_CLASS =
  'border-purple-700 bg-purple-700 text-white shadow-[0_10px_30px_rgba(109,40,217,0.25)]';
