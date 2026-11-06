import { jobCreateDraftService } from '../services/jobCreateDraft.service';
import type {
  JobCreateDraftLocalBackup,
  UpsertJobCreateDraftDto,
} from '../types/jobCreateDraft.types';
import { clearJobCreateDraftLocal, writeJobCreateDraftLocal } from './jobCreateDraftStorage';

type PendingJobCreateDraft = {
  userId: string;
  dto: UpsertJobCreateDraftDto;
  backup: Omit<JobCreateDraftLocalBackup, 'version' | 'updatedAt'>;
};

/** In-memory draft awaiting debounced PUT — also used by idle logout flush. */
let pending: PendingJobCreateDraft | null = null;

export function rememberPendingJobCreateDraft(
  userId: string,
  dto: UpsertJobCreateDraftDto,
  backup: Omit<JobCreateDraftLocalBackup, 'version' | 'updatedAt'>,
): void {
  const uid = userId.trim();
  if (!uid) return;
  pending = { userId: uid, dto, backup };
}

export function clearPendingJobCreateDraft(): void {
  pending = null;
}

export function getPendingJobCreateDraft(): PendingJobCreateDraft | null {
  return pending;
}

/**
 * Sync-write localStorage from any in-memory pending draft, then best-effort
 * PUT /jobs/create-drafts/current. Auth idle logout awaits this before soft redirect.
 */
export async function flushJobCreateDraftBeforeIdleLogout(): Promise<void> {
  if (!pending) return;
  const { userId, dto, backup } = pending;
  writeJobCreateDraftLocal(userId, backup);
  try {
    await jobCreateDraftService.upsertCurrent(dto);
  } catch {
    // best effort — local backup already written
  }
}

/** Clear in-memory + local backup (server delete is caller's responsibility). */
export function discardJobCreateDraftLocalState(userId: string): void {
  clearPendingJobCreateDraft();
  clearJobCreateDraftLocal(userId);
}
