import { useCallback, useEffect, useState } from 'react';
import type { AirWorkflowStageId } from '../constants/airWorkflow';

const STORAGE_PREFIX = 'kfw.air.workflow.';

export type AirProgressMap = Partial<Record<AirWorkflowStageId, boolean>>;

function readProgress(scope: string): AirProgressMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + scope);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AirProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgress(scope: string, map: AirProgressMap) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + scope, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function useAirWorkflowProgress(scope: string) {
  const [done, setDone] = useState<AirProgressMap>(() => (scope ? readProgress(scope) : {}));

  useEffect(() => {
    if (!scope) return;
    setDone(readProgress(scope));
  }, [scope]);

  const markDone = useCallback(
    (id: AirWorkflowStageId) => {
      if (!scope) return;
      setDone((prev) => {
        const next = { ...prev, [id]: true };
        writeProgress(scope, next);
        return next;
      });
    },
    [scope],
  );

  const isDone = useCallback((id: AirWorkflowStageId) => Boolean(done[id]), [done]);

  return { done, markDone, isDone };
}

/** First incomplete stage; parallelGroup peers can both be open. */
export function firstOpenAirStage(
  order: readonly AirWorkflowStageId[],
  isDone: (id: AirWorkflowStageId) => boolean,
  opts?: {
    /** Stages that may complete in any order within the group before advancing past the group. */
    parallelGroups?: Record<string, readonly AirWorkflowStageId[]>;
  },
): AirWorkflowStageId {
  const parallelGroups = opts?.parallelGroups ?? {};
  const groupDone = (ids: readonly AirWorkflowStageId[]) => ids.every((id) => isDone(id));

  for (const id of order) {
    if (isDone(id)) continue;
    // If this id is in a parallel group and some peers are incomplete, still return this id
    // (UI shows all incomplete peers in the group).
    for (const members of Object.values(parallelGroups)) {
      if (members.includes(id) && !groupDone(members)) {
        return id;
      }
    }
    return id;
  }
  return order[order.length - 1]!;
}

export function parallelPeersOpen(
  current: AirWorkflowStageId,
  groups: Record<string, readonly AirWorkflowStageId[]>,
  isDone: (id: AirWorkflowStageId) => boolean,
): AirWorkflowStageId[] {
  for (const members of Object.values(groups)) {
    if (!members.includes(current)) continue;
    return members.filter((id) => !isDone(id));
  }
  return [current];
}
