import { useMemo } from 'react';
import { portLabelFromRecord } from '@/features/customers/utils/customerMasterLookup';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterDetail } from '@/features/masters/hooks/useMasterResource';
import { useParty } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import type { Shipment } from '../types/shipment.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readable(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isUuid(trimmed)) return undefined;
  return trimmed;
}

function masterLabel(row?: Record<string, unknown> | null): string | undefined {
  if (!row) return undefined;
  const code = readable(String(row.code ?? row.un_locode ?? row.unLocode ?? ''));
  const name = readable(
    String(row.name ?? row.display_name ?? row.displayName ?? row.city ?? ''),
  );
  if (code && name) return `${code} — ${name}`;
  return name || code;
}

function partyLabel(party?: { code?: string; name?: string } | null): string | undefined {
  if (!party) return undefined;
  const code = readable(party.code);
  const name = readable(party.name);
  if (code && name) return `${code} — ${name}`;
  return name || code;
}

/**
 * Resolve shipment UUID fields to human-readable labels for the detail chrome.
 */
export function useShipmentResolvedLabels(shipment: Shipment | null | undefined) {
  const customerId = shipment?.customer_id || shipment?.party_id;
  const needsCustomer =
    Boolean(customerId && isUuid(customerId)) &&
    !readable(shipment?.customer_name) &&
    !readable(shipment?.party_name);
  const needsOrigin =
    Boolean(shipment?.origin_port_id && isUuid(shipment.origin_port_id)) &&
    !readable(shipment?.origin_port_name) &&
    !readable(shipment?.pol);
  const needsDest =
    Boolean(shipment?.dest_port_id && isUuid(shipment.dest_port_id)) &&
    !readable(shipment?.dest_port_name) &&
    !readable(shipment?.pod);
  const needsDepartment =
    Boolean(shipment?.department_id && isUuid(shipment.department_id)) &&
    !readable(shipment?.department_name);
  const needsBranch =
    Boolean(shipment?.branch_id && isUuid(shipment.branch_id)) &&
    !readable(shipment?.branch_name);
  const needsContainerType =
    Boolean(shipment?.container_type_id && isUuid(shipment.container_type_id)) &&
    !readable(String(shipment?.container_type_name ?? ''));

  const { data: party, isLoading: partyLoading } = useParty(needsCustomer ? customerId! : '');
  const { data: originPort, isLoading: originLoading } = useMasterDetail(
    'ports',
    MASTER_PATHS.ports,
    needsOrigin ? shipment!.origin_port_id! : '',
  );
  const { data: destPort, isLoading: destLoading } = useMasterDetail(
    'ports',
    MASTER_PATHS.ports,
    needsDest ? shipment!.dest_port_id! : '',
  );
  const { data: department, isLoading: deptLoading } = useMasterDetail(
    'departments',
    MASTER_PATHS.departments,
    needsDepartment ? shipment!.department_id! : '',
  );
  const { data: branch, isLoading: branchLoading } = useMasterDetail(
    'branches',
    MASTER_PATHS.branches,
    needsBranch ? shipment!.branch_id! : '',
  );
  const { data: containerType, isLoading: containerLoading } = useMasterDetail(
    'container-types',
    MASTER_PATHS['container-types'],
    needsContainerType ? shipment!.container_type_id! : '',
  );

  return useMemo(() => {
    const customerLabel =
      readable(shipment?.party_name) ||
      readable(shipment?.customer_name) ||
      partyLabel(party) ||
      (partyLoading ? 'Loading…' : undefined);

    const originFromMaster = originPort
      ? portLabelFromRecord(originPort) || masterLabel(asRecord(originPort))
      : undefined;
    const originLabel =
      readable(shipment?.pol) ||
      readable(shipment?.origin_port_name) ||
      originFromMaster ||
      (originLoading ? 'Loading…' : undefined);

    const destFromMaster = destPort
      ? portLabelFromRecord(destPort) || masterLabel(asRecord(destPort))
      : undefined;
    const destLabel =
      readable(shipment?.pod) ||
      readable(shipment?.dest_port_name) ||
      destFromMaster ||
      (destLoading ? 'Loading…' : undefined);

    const departmentLabel =
      readable(shipment?.department_name) ||
      masterLabel(asRecord(department)) ||
      (deptLoading ? 'Loading…' : undefined);

    const branchLabel =
      readable(shipment?.branch_name) ||
      masterLabel(asRecord(branch)) ||
      (branchLoading ? 'Loading…' : undefined);

    const containerTypeLabel =
      readable(String(shipment?.container_type_name ?? '')) ||
      masterLabel(asRecord(containerType)) ||
      (containerLoading ? 'Loading…' : undefined);

    return {
      customerLabel,
      originLabel,
      destLabel,
      departmentLabel,
      branchLabel,
      containerTypeLabel,
    };
  }, [
    shipment,
    party,
    partyLoading,
    originPort,
    originLoading,
    destPort,
    destLoading,
    department,
    deptLoading,
    branch,
    branchLoading,
    containerType,
    containerLoading,
  ]);
}
