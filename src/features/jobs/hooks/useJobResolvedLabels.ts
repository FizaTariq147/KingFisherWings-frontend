import { useMemo } from 'react';
import { portLabelFromRecord } from '@/features/customers/utils/customerMasterLookup';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterDetail, useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import type { MasterRecord } from '@/features/masters/types/master.types';
import { useParties, useParty } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import type { Job } from '../types/job.types';

function partyDisplayLabel(party?: { code?: string; name?: string } | null): string {
  if (!party) return '—';
  return [party.code, party.name].filter(Boolean).join(' — ') || '—';
}

function masterDisplayLabel(record?: MasterRecord | null): string {
  if (!record) return '';
  const code = String(
    record.code ??
      record.un_locode ??
      record.iata_code ??
      record.icao_code ??
      record.scac ??
      record.imo_number ??
      '',
  ).trim();
  const name = String(record.name ?? record.label ?? record.city ?? '').trim();
  if (code && name && code !== name) return `${code} — ${name}`;
  return name || code || '';
}

function buildMasterLabelMap(items: MasterRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of items) {
    const id = String(item.id ?? '').trim();
    if (!isUuid(id)) continue;
    const label = masterDisplayLabel(item) || portLabelFromRecord(item);
    if (label) map.set(id, label);
  }
  return map;
}

function resolveIdLabel(
  id: string | undefined,
  knownName: string | undefined,
  map: Map<string, string>,
  fetched?: MasterRecord | null,
  loading?: boolean,
): string {
  if (knownName?.trim() && !isUuid(knownName.trim())) return knownName.trim();
  if (id && map.has(id)) return map.get(id)!;
  const fromFetched = masterDisplayLabel(fetched) || (fetched ? portLabelFromRecord(fetched) : '');
  if (fromFetched) return fromFetched;
  if (loading) return 'Loading…';
  // Never show raw UUID as the primary label.
  if (id && isUuid(id)) return '—';
  return knownName?.trim() || '—';
}

function resolvePartyName(
  id: string | undefined,
  name: string | undefined,
  partyMap: Map<string, string>,
  fetched?: { code?: string; name?: string } | null,
  loading?: boolean,
): string {
  if (name?.trim() && !isUuid(name.trim())) return name.trim();
  if (id && partyMap.has(id)) return partyMap.get(id)!;
  if (fetched) return partyDisplayLabel(fetched);
  if (loading) return 'Loading…';
  if (id && isUuid(id)) return '—';
  return '—';
}

/** Resolve shipper / ports / masters UUIDs to readable labels on job detail screens. */
export function useJobResolvedLabels(job: Job) {
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 500,
    order: 'asc',
  });

  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: airports = [] } = useMasterOptions('airports', MASTER_PATHS.airports, true);
  const { data: containerTypes = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const { data: shippingLines = [] } = useMasterOptions(
    'shipping-lines',
    MASTER_PATHS['shipping-lines'],
    true,
  );
  const { data: vessels = [] } = useMasterOptions('vessels', MASTER_PATHS.vessels, true);
  const { data: airlines = [] } = useMasterOptions('airlines', MASTER_PATHS.airlines, true);
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: truckers = [] } = useMasterOptions('truckers', MASTER_PATHS.truckers, true);
  const { data: courierVendors = [] } = useMasterOptions(
    'courier-vendors',
    MASTER_PATHS['courier-vendors'],
    true,
  );

  const needsShipper = Boolean(job.shipper_id && !job.shipper_name?.trim());
  const needsConsignee = Boolean(job.consignee_id && !job.consignee_name?.trim());
  const needsAgent = Boolean(job.agent_id && !job.agent_name?.trim());
  const needsBilling = Boolean(job.billing_party_id);

  const originPortId =
    job.origin_port_id ||
    job.sea_fcl_details?.port_of_loading_id ||
    job.sea_lcl_details?.port_of_loading_id;
  const destPortId =
    job.dest_port_id ||
    job.sea_fcl_details?.port_of_discharge_id ||
    job.sea_lcl_details?.port_of_discharge_id;
  const originAirportId = job.air_details?.origin_airport_id;
  const destAirportId = job.air_details?.dest_airport_id;
  const airlineId = job.air_details?.airline_id;
  const shippingLineId =
    job.sea_fcl_details?.shipping_line_id || job.sea_lcl_details?.shipping_line_id;
  const vesselId = job.sea_fcl_details?.vessel_id || job.sea_lcl_details?.vessel_id;
  const containerTypeId = job.container_type_id;
  const branchId = job.branch_id;
  const truckerId = job.land_details?.trucker_id;
  const courierVendorId = job.courier_details?.courier_vendor_id;

  const { data: shipperParty, isLoading: shipperLoading } = useParty(
    needsShipper ? job.shipper_id : '',
  );
  const { data: consigneeParty, isLoading: consigneeLoading } = useParty(
    needsConsignee ? job.consignee_id! : '',
  );
  const { data: agentParty, isLoading: agentLoading } = useParty(
    needsAgent ? job.agent_id! : '',
  );
  const { data: billingParty, isLoading: billingLoading } = useParty(
    needsBilling ? job.billing_party_id! : '',
  );

  const needsOriginPort = Boolean(
    originPortId && !job.origin_port_code?.trim(),
  );
  const needsDestPort = Boolean(destPortId && !job.dest_port_code?.trim());

  const { data: originPort, isLoading: originPortLoading } = useMasterDetail(
    'ports',
    MASTER_PATHS.ports,
    needsOriginPort ? originPortId! : '',
  );
  const { data: destPort, isLoading: destPortLoading } = useMasterDetail(
    'ports',
    MASTER_PATHS.ports,
    needsDestPort ? destPortId! : '',
  );
  const { data: originAirport, isLoading: originAirportLoading } = useMasterDetail(
    'airports',
    MASTER_PATHS.airports,
    originAirportId && isUuid(originAirportId) ? originAirportId : '',
  );
  const { data: destAirport, isLoading: destAirportLoading } = useMasterDetail(
    'airports',
    MASTER_PATHS.airports,
    destAirportId && isUuid(destAirportId) ? destAirportId : '',
  );
  const { data: airline, isLoading: airlineLoading } = useMasterDetail(
    'airlines',
    MASTER_PATHS.airlines,
    airlineId && isUuid(airlineId) ? airlineId : '',
  );
  const { data: shippingLine, isLoading: shippingLineLoading } = useMasterDetail(
    'shipping-lines',
    MASTER_PATHS['shipping-lines'],
    shippingLineId && isUuid(shippingLineId) ? shippingLineId : '',
  );
  const { data: vessel, isLoading: vesselLoading } = useMasterDetail(
    'vessels',
    MASTER_PATHS.vessels,
    vesselId && isUuid(vesselId) ? vesselId : '',
  );
  const { data: containerType, isLoading: containerTypeLoading } = useMasterDetail(
    'container-types',
    MASTER_PATHS['container-types'],
    containerTypeId && isUuid(containerTypeId) ? containerTypeId : '',
  );
  const { data: branch, isLoading: branchLoading } = useMasterDetail(
    'branches',
    MASTER_PATHS.branches,
    branchId && isUuid(branchId) && !job.branch_name?.trim() ? branchId : '',
  );
  const { data: trucker, isLoading: truckerLoading } = useMasterDetail(
    'truckers',
    MASTER_PATHS.truckers,
    truckerId && isUuid(truckerId) ? truckerId : '',
  );
  const { data: courierVendor, isLoading: courierVendorLoading } = useMasterDetail(
    'courier-vendors',
    MASTER_PATHS['courier-vendors'],
    courierVendorId && isUuid(courierVendorId) ? courierVendorId : '',
  );

  const partyMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const party of partiesResult?.parties ?? []) {
      if (!isUuid(party.id)) continue;
      map.set(party.id, partyDisplayLabel(party));
    }
    return map;
  }, [partiesResult?.parties]);

  const portMap = useMemo(() => buildMasterLabelMap(ports), [ports]);
  const airportMap = useMemo(() => buildMasterLabelMap(airports), [airports]);
  const containerTypeMap = useMemo(() => buildMasterLabelMap(containerTypes), [containerTypes]);
  const shippingLineMap = useMemo(() => buildMasterLabelMap(shippingLines), [shippingLines]);
  const vesselMap = useMemo(() => buildMasterLabelMap(vessels), [vessels]);
  const airlineMap = useMemo(() => buildMasterLabelMap(airlines), [airlines]);
  const branchMap = useMemo(() => buildMasterLabelMap(branches), [branches]);
  const truckerMap = useMemo(() => buildMasterLabelMap(truckers), [truckers]);
  const courierVendorMap = useMemo(() => buildMasterLabelMap(courierVendors), [courierVendors]);

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

  const billingPartyLabel = useMemo(
    () =>
      resolvePartyName(
        job.billing_party_id,
        undefined,
        partyMap,
        billingParty,
        billingLoading,
      ),
    [job.billing_party_id, partyMap, billingParty, billingLoading],
  );

  const originLabel = useMemo(() => {
    if (job.origin_port_code?.trim()) {
      return job.origin_port_code.trim();
    }
    return resolveIdLabel(
      originPortId,
      undefined,
      portMap,
      originPort,
      originPortLoading,
    );
  }, [job.origin_port_code, originPortId, portMap, originPort, originPortLoading]);

  const destinationLabel = useMemo(() => {
    if (job.dest_port_code?.trim()) {
      return job.dest_port_code.trim();
    }
    return resolveIdLabel(destPortId, undefined, portMap, destPort, destPortLoading);
  }, [job.dest_port_code, destPortId, portMap, destPort, destPortLoading]);

  const originAirportLabel = useMemo(
    () =>
      resolveIdLabel(
        originAirportId,
        undefined,
        airportMap,
        originAirport,
        originAirportLoading,
      ),
    [originAirportId, airportMap, originAirport, originAirportLoading],
  );

  const destAirportLabel = useMemo(
    () =>
      resolveIdLabel(destAirportId, undefined, airportMap, destAirport, destAirportLoading),
    [destAirportId, airportMap, destAirport, destAirportLoading],
  );

  const airlineLabel = useMemo(
    () => resolveIdLabel(airlineId, undefined, airlineMap, airline, airlineLoading),
    [airlineId, airlineMap, airline, airlineLoading],
  );

  const shippingLineLabel = useMemo(
    () =>
      resolveIdLabel(
        shippingLineId,
        job.sea_fcl_details?.shipping_line_name,
        shippingLineMap,
        shippingLine,
        shippingLineLoading,
      ),
    [
      shippingLineId,
      job.sea_fcl_details?.shipping_line_name,
      shippingLineMap,
      shippingLine,
      shippingLineLoading,
    ],
  );

  const vesselLabel = useMemo(
    () =>
      resolveIdLabel(
        vesselId,
        job.sea_fcl_details?.vessel_name || job.sea_lcl_details?.vessel_name,
        vesselMap,
        vessel,
        vesselLoading,
      ),
    [
      vesselId,
      job.sea_fcl_details?.vessel_name,
      job.sea_lcl_details?.vessel_name,
      vesselMap,
      vessel,
      vesselLoading,
    ],
  );

  const containerTypeLabel = useMemo(
    () =>
      resolveIdLabel(
        containerTypeId,
        undefined,
        containerTypeMap,
        containerType,
        containerTypeLoading,
      ),
    [containerTypeId, containerTypeMap, containerType, containerTypeLoading],
  );

  const branchLabel = useMemo(
    () =>
      resolveIdLabel(branchId, job.branch_name, branchMap, branch, branchLoading),
    [branchId, job.branch_name, branchMap, branch, branchLoading],
  );

  const truckerLabel = useMemo(
    () => resolveIdLabel(truckerId, undefined, truckerMap, trucker, truckerLoading),
    [truckerId, truckerMap, trucker, truckerLoading],
  );

  const courierVendorLabel = useMemo(
    () =>
      resolveIdLabel(
        courierVendorId,
        undefined,
        courierVendorMap,
        courierVendor,
        courierVendorLoading,
      ),
    [courierVendorId, courierVendorMap, courierVendor, courierVendorLoading],
  );

  const salespersonLabel = useMemo(() => {
    const name = job.salesperson_name?.trim();
    if (name && !isUuid(name)) return name;
    return '—';
  }, [job.salesperson_name]);

  return {
    shipperLabel,
    consigneeLabel,
    agentLabel,
    billingPartyLabel,
    originLabel,
    destinationLabel,
    originAirportLabel,
    destAirportLabel,
    airlineLabel,
    shippingLineLabel,
    vesselLabel,
    containerTypeLabel,
    branchLabel,
    truckerLabel,
    courierVendorLabel,
    salespersonLabel,
  };
}
