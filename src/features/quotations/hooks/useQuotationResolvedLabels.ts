import { useMemo } from 'react';
import { portLabelFromRecord } from '@/features/customers/utils/customerMasterLookup';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterDetail, useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties, useParty } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import type { Quotation } from '../types/quotation.types';
import {
  buildPortLabelMap,
  formatQuotationPortSide,
  parseCustomerRouteFromNotes,
  quotationCustomerLabel,
} from '../utils/quotationDisplay';

function partyDisplayLabel(party?: { code?: string; name?: string; id?: string } | null): string {
  if (!party) return '—';
  return [party.code, party.name].filter(Boolean).join(' — ') || '—';
}

function portDisplayLabel(
  q: Quotation,
  which: 'origin' | 'destination',
  portMap: Map<string, string>,
  fetched?: { un_locode?: unknown; code?: unknown; name?: unknown; city?: unknown } | null,
): string {
  const code = which === 'origin' ? q.origin_port_code : q.dest_port_code;
  const name = which === 'origin' ? q.origin_port_name : q.dest_port_name;
  const id = which === 'origin' ? q.origin_port_id : q.dest_port_id;

  const fromFields = formatQuotationPortSide(code, name, id, portMap);
  if (fromFields) return fromFields;

  if (fetched) {
    const label = portLabelFromRecord(fetched);
    if (label) return label;
  }

  const fromNotes = parseCustomerRouteFromNotes(q.special_requirements);
  const noteSide = which === 'origin' ? fromNotes.origin : fromNotes.dest;
  if (noteSide) return noteSide;

  return '—';
}

/** Resolve customer / port UUIDs to readable labels on quotation detail screens. */
export function useQuotationResolvedLabels(q: Quotation) {
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: customersResult } = useParties({
    page: 1,
    limit: 500,
    party_type: 'CUSTOMER',
    order: 'asc',
  });

  const needsCustomerLookup = Boolean(q.customer_id && !q.customer_name);
  const needsOriginLookup = Boolean(
    q.origin_port_id && !q.origin_port_code && !q.origin_port_name,
  );
  const needsDestLookup = Boolean(q.dest_port_id && !q.dest_port_code && !q.dest_port_name);

  const { data: customerParty, isLoading: customerLoading } = useParty(
    needsCustomerLookup ? q.customer_id : '',
  );
  const { data: originPort, isLoading: originLoading } = useMasterDetail(
    'ports',
    MASTER_PATHS.ports,
    needsOriginLookup ? q.origin_port_id! : '',
  );
  const { data: destPort, isLoading: destLoading } = useMasterDetail(
    'ports',
    MASTER_PATHS.ports,
    needsDestLookup ? q.dest_port_id! : '',
  );

  const portMap = useMemo(() => buildPortLabelMap(ports), [ports]);

  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const party of customersResult?.parties ?? []) {
      if (!isUuid(party.id)) continue;
      map.set(party.id, partyDisplayLabel(party));
    }
    return map;
  }, [customersResult?.parties]);

  const customerLabel = useMemo(() => {
    if (q.customer_name) return q.customer_name;
    const fromList = quotationCustomerLabel(q, partyMap);
    if (fromList !== q.customer_id?.slice(0, 8)) return fromList;
    if (customerParty) return partyDisplayLabel(customerParty);
    if (customerLoading) return 'Loading…';
    return '—';
  }, [q, partyMap, customerParty, customerLoading]);

  const originLabel = useMemo(
    () => portDisplayLabel(q, 'origin', portMap, originPort),
    [q, portMap, originPort],
  );

  const destinationLabel = useMemo(
    () => portDisplayLabel(q, 'destination', portMap, destPort),
    [q, portMap, destPort],
  );

  const portsLoading =
    (needsOriginLookup && originLoading && originLabel === '—') ||
    (needsDestLookup && destLoading && destinationLabel === '—');

  return {
    customerLabel,
    originLabel,
    destinationLabel,
    portsLoading,
  };
}
