import { useMemo } from 'react';
import { useParties, useParty } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import type { Job } from '../types/job.types';

function partyDisplayLabel(party?: { code?: string; name?: string } | null): string {
  if (!party) return '—';
  return [party.code, party.name].filter(Boolean).join(' — ') || '—';
}

function resolvePartyName(
  id: string | undefined,
  name: string | undefined,
  partyMap: Map<string, string>,
  fetched?: { code?: string; name?: string } | null,
  loading?: boolean,
): string {
  if (name?.trim()) return name.trim();
  if (id && partyMap.has(id)) return partyMap.get(id)!;
  if (fetched) return partyDisplayLabel(fetched);
  if (loading) return 'Loading…';
  return '—';
}

/** Resolve shipper / consignee / agent UUIDs to readable party labels on job detail screens. */
export function useJobResolvedLabels(job: Job) {
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 500,
    order: 'asc',
  });

  const needsShipper = Boolean(job.shipper_id && !job.shipper_name?.trim());
  const needsConsignee = Boolean(job.consignee_id && !job.consignee_name?.trim());
  const needsAgent = Boolean(job.agent_id && !job.agent_name?.trim());

  const { data: shipperParty, isLoading: shipperLoading } = useParty(
    needsShipper ? job.shipper_id : '',
  );
  const { data: consigneeParty, isLoading: consigneeLoading } = useParty(
    needsConsignee ? job.consignee_id! : '',
  );
  const { data: agentParty, isLoading: agentLoading } = useParty(
    needsAgent ? job.agent_id! : '',
  );

  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const party of partiesResult?.parties ?? []) {
      if (!isUuid(party.id)) continue;
      map.set(party.id, partyDisplayLabel(party));
    }
    return map;
  }, [partiesResult?.parties]);

  const shipperLabel = useMemo(
    () =>
      resolvePartyName(
        job.shipper_id,
        job.shipper_name,
        partyMap,
        shipperParty,
        shipperLoading,
      ),
    [job.shipper_id, job.shipper_name, partyMap, shipperParty, shipperLoading],
  );

  const consigneeLabel = useMemo(
    () =>
      resolvePartyName(
        job.consignee_id,
        job.consignee_name,
        partyMap,
        consigneeParty,
        consigneeLoading,
      ),
    [job.consignee_id, job.consignee_name, partyMap, consigneeParty, consigneeLoading],
  );

  const agentLabel = useMemo(
    () =>
      resolvePartyName(job.agent_id, job.agent_name, partyMap, agentParty, agentLoading),
    [job.agent_id, job.agent_name, partyMap, agentParty, agentLoading],
  );

  return { shipperLabel, consigneeLabel, agentLabel };
}
