import type { PublicTrackResult } from '../types/publicTrack.types';
import { normalizePublicTrack } from './normalizePublicTrack';

/**
 * Always produce a Track & Trace view-model so the reference UI can render.
 * Prefer normalized API body; otherwise show an empty shell for `fallbackRef`.
 */
export function toTrackResult(
  raw: unknown,
  fallbackRef?: string,
): PublicTrackResult {
  const normalized = normalizePublicTrack(raw, { fallbackRef });
  if (normalized) return normalized;
  const ref = (fallbackRef || '').trim() || '—';
  return {
    reference: ref,
    progressLegs: [],
    milestones: [],
  };
}
