import { useMemo } from 'react';
import type { OpsContinuumTab, OpsEntityType } from '../types/opsActivity.types';
import {
  useOpsAttachments,
  useOpsComments,
  useOpsComplaints,
  useOpsFollowUps,
  useOpsHistory,
  useOpsLikes,
  useOpsLinks,
  useOpsReferences,
  useOpsTags,
} from './useOpsActivity';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function listLength(data: unknown): number | null {
  if (data == null) return null;
  if (Array.isArray(data)) return data.length;
  const rec = asRecord(data);
  if (!rec) return null;
  if (typeof rec.total === 'number' && Number.isFinite(rec.total)) {
    return Math.max(0, Math.floor(rec.total));
  }
  if (typeof rec.count === 'number' && Number.isFinite(rec.count)) {
    return Math.max(0, Math.floor(rec.count));
  }
  for (const key of ['items', 'data', 'results', 'rows']) {
    if (Array.isArray(rec[key])) return (rec[key] as unknown[]).length;
  }
  return null;
}

/** Read optional counts from detail `ops_continuum` payload when present. */
function countsFromOpsContinuum(
  opsContinuum?: Record<string, unknown> | null,
): Partial<Record<OpsContinuumTab, number>> {
  if (!opsContinuum) return {};
  const out: Partial<Record<OpsContinuumTab, number>> = {};

  const tabKeys: { tab: OpsContinuumTab; aliases: string[] }[] = [
    { tab: 'comments', aliases: ['comments', 'comment'] },
    { tab: 'follow-ups', aliases: ['follow_ups', 'follow-ups', 'followups'] },
    { tab: 'attachments', aliases: ['attachments', 'attachment'] },
    { tab: 'references', aliases: ['references', 'reference'] },
    { tab: 'tags', aliases: ['tags', 'tag'] },
    { tab: 'links', aliases: ['links', 'link'] },
    { tab: 'likes', aliases: ['likes', 'like'] },
    { tab: 'complaints', aliases: ['complaints', 'complaint'] },
    { tab: 'history', aliases: ['history', 'events'] },
  ];

  for (const { tab, aliases } of tabKeys) {
    for (const alias of aliases) {
      const countKey = `${alias}_count`;
      const direct = opsContinuum[countKey] ?? opsContinuum[`${alias}Count`];
      if (typeof direct === 'number' && Number.isFinite(direct)) {
        out[tab] = Math.max(0, Math.floor(direct));
        break;
      }
      const node = opsContinuum[alias];
      if (typeof node === 'number' && Number.isFinite(node)) {
        out[tab] = Math.max(0, Math.floor(node));
        break;
      }
      const rec = asRecord(node);
      if (rec) {
        const n =
          typeof rec.count === 'number'
            ? rec.count
            : typeof rec.total === 'number'
              ? rec.total
              : Array.isArray(rec.items)
                ? rec.items.length
                : null;
        if (n != null && Number.isFinite(n)) {
          out[tab] = Math.max(0, Math.floor(n));
          break;
        }
      }
      if (Array.isArray(node)) {
        out[tab] = node.length;
        break;
      }
    }
  }

  return out;
}

/**
 * Counts for continuum rail badges — prefers live GET /ops/... list lengths,
 * falls back to detail `ops_continuum` count fields when present.
 */
export function useOpsContinuumCounts(
  entityType: OpsEntityType,
  entityId: string,
  opts?: {
    enabled?: boolean;
    opsContinuum?: Record<string, unknown> | null;
    tabs?: OpsContinuumTab[];
  },
): Record<OpsContinuumTab, number | null> {
  const enabled = opts?.enabled !== false && Boolean(entityId);
  const tabs = opts?.tabs;
  const want = (tab: OpsContinuumTab) =>
    enabled && (!tabs || tabs.length === 0 || tabs.includes(tab));

  const hintCounts = useMemo(
    () => countsFromOpsContinuum(opts?.opsContinuum),
    [opts?.opsContinuum],
  );

  const comments = useOpsComments(entityType, entityId, want('comments'));
  const followUps = useOpsFollowUps(entityType, entityId, want('follow-ups'));
  const attachments = useOpsAttachments(
    entityType,
    entityId,
    want('attachments'),
  );
  const references = useOpsReferences(entityType, entityId, want('references'));
  const tags = useOpsTags(entityType, entityId, want('tags'));
  const links = useOpsLinks(entityType, entityId, want('links'));
  const likes = useOpsLikes(entityType, entityId, want('likes'));
  const complaints = useOpsComplaints(entityType, entityId, want('complaints'));
  const history = useOpsHistory(entityType, entityId, want('history'));

  return useMemo(() => {
    const pick = (
      tab: OpsContinuumTab,
      data: unknown,
      isFetched: boolean,
    ): number | null => {
      const live = listLength(data);
      if (live != null) return live;
      if (hintCounts[tab] != null) return hintCounts[tab] ?? null;
      return isFetched ? 0 : null;
    };

    return {
      comments: pick('comments', comments.data, comments.isFetched),
      'follow-ups': pick('follow-ups', followUps.data, followUps.isFetched),
      attachments: pick(
        'attachments',
        attachments.data,
        attachments.isFetched,
      ),
      references: pick('references', references.data, references.isFetched),
      tags: pick('tags', tags.data, tags.isFetched),
      links: pick('links', links.data, links.isFetched),
      likes: pick('likes', likes.data, likes.isFetched),
      complaints: pick('complaints', complaints.data, complaints.isFetched),
      history: pick('history', history.data, history.isFetched),
    };
  }, [
    hintCounts,
    comments.data,
    comments.isFetched,
    followUps.data,
    followUps.isFetched,
    attachments.data,
    attachments.isFetched,
    references.data,
    references.isFetched,
    tags.data,
    tags.isFetched,
    links.data,
    links.isFetched,
    likes.data,
    likes.isFetched,
    complaints.data,
    complaints.isFetched,
    history.data,
    history.isFetched,
  ]);
}
