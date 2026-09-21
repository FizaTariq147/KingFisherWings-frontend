import { useCallback, useEffect, useState } from 'react';
import type { SeaExportStageId } from '../constants/seaExportWorkflow';

const STORAGE_PREFIX = 'kfw.nvocc.seaExport.';

export type SeaExportProgressMap = Partial<Record<SeaExportStageId, boolean>>;

function readProgress(scope: string): SeaExportProgressMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + scope);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SeaExportProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgress(scope: string, map: SeaExportProgressMap) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + scope, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

/** Persist completed sea-export stages so the UI can advance across refreshes. */
export function useSeaExportProgress(scope: string) {
  const [done, setDone] = useState<SeaExportProgressMap>(() =>
    scope ? readProgress(scope) : {},
  );

  useEffect(() => {
    if (!scope) return;
    setDone(readProgress(scope));
  }, [scope]);

  const markDone = useCallback(
    (id: SeaExportStageId) => {
      if (!scope) return;
      setDone((prev) => {
        if (prev[id]) return prev; // already done — avoid re-render / effect loops
        const next = { ...prev, [id]: true };
        writeProgress(scope, next);
        return next;
      });
    },
    [scope],
  );

  const isDone = useCallback((id: SeaExportStageId) => Boolean(done[id]), [done]);

  return { done, markDone, isDone };
}

/** First incomplete stage in an ordered list. */
export function firstOpenStage(
  order: readonly SeaExportStageId[],
  isDone: (id: SeaExportStageId) => boolean,
  derived?: SeaExportProgressMap,
): SeaExportStageId {
  for (const id of order) {
    // Explicit false in derived forces the stage open (overrides stale sessionStorage).
    if (derived && Object.prototype.hasOwnProperty.call(derived, id)) {
      if (derived[id]) continue;
      return id;
    }
    if (isDone(id)) continue;
    return id;
  }
  return order[order.length - 1]!;
}
