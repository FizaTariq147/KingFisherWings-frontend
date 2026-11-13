import {
  getSharedLayoutSource,
  sharedLayoutBadgeLabel,
} from '../data/sharedLayoutSource';

/** Catalog card footnote when a code aliases a shared JSON shell. */
export function catalogSharedLayoutHint(code: string): string | null {
  const info = getSharedLayoutSource(code);
  if (!info?.isSharedLayout) return null;
  return sharedLayoutBadgeLabel(info);
}
