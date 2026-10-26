import { asRecord, pickString } from '@/features/portal-shared/normalize';

/**
 * Resolve a human actor label from enriched history / audit payloads.
 * Prefer `performed_by_name` / `changed_by_name`, then `actor.name`, then string actor.
 */
export function pickActorName(...candidates: unknown[]): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    const rec = asRecord(candidate);
    if (!rec) continue;
    const nested = pickString(
      rec.name,
      rec.full_name,
      rec.fullName,
      rec.display_name,
      rec.displayName,
      rec.email,
    );
    if (nested) return nested;
  }
  return undefined;
}

/** Flatten common actor fields from a history/event row. */
export function actorNameFromRow(row: Record<string, unknown> | null | undefined): string | undefined {
  if (!row) return undefined;
  return pickActorName(
    row.performed_by_name,
    row.performedByName,
    row.changed_by_name,
    row.changedByName,
    row.actor_name,
    row.actorName,
    row.user_name,
    row.userName,
    row.created_by_name,
    row.createdByName,
    row.actor_user,
    row.actorUser,
    row.actor,
    row.performed_by,
    row.changed_by,
    row.created_by,
  );
}
