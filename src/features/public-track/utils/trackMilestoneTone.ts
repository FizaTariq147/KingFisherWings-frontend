import type { PublicTrackMilestone } from '../types/publicTrack.types';

export type TrackMilestoneTone = 'complete' | 'hold' | 'pending';

function textBlob(m: Pick<PublicTrackMilestone, 'status' | 'eventType' | 'move' | 'label'>): string {
  return [m.status, m.eventType, m.move, m.label]
    .map((v) => String(v ?? '').trim().toUpperCase())
    .filter(Boolean)
    .join(' ');
}

/** completed=green, hold=red, pending=hidden/muted. */
export function trackMilestoneTone(
  m: Pick<PublicTrackMilestone, 'pending' | 'status' | 'eventType' | 'move' | 'label' | 'completedAt' | 'occurredAt'>,
): TrackMilestoneTone {
  const blob = textBlob(m);
  if (
    blob.includes('HOLD') ||
    blob.includes('ON HOLD') ||
    m.eventType?.toUpperCase() === 'HOLD'
  ) {
    return 'hold';
  }
  if (m.pending === false) return 'complete';
  if (m.completedAt || m.occurredAt) return 'complete';
  const status = String(m.status ?? '').toUpperCase();
  if (status === 'COMPLETED' || status === 'DONE' || status === 'COMPLETE') return 'complete';
  if (m.pending === true) return 'pending';
  return 'pending';
}

export const TRACK_TONE_COLORS = {
  complete: '#16A34A',
  hold: '#E31B23',
  pending: '#94A3B8',
  /** Header / move pill when status is active but not hold/complete. */
  active: '#1E7AB8',
} as const;
