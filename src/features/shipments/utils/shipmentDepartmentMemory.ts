/**
 * Remember department/branch after PATCH /shipments/:id/department when detail GET
 * omits those fields (refetch would otherwise wipe the UI).
 * Prefer API values whenever the server returns them.
 */

const STORAGE_KEY = 'kfw.shipmentDepartment.v1';

export type ShipmentDepartmentMemory = {
  department_id: string;
  branch_id?: string;
  department_name?: string;
  branch_name?: string;
  at: number;
};

function readMap(): Record<string, ShipmentDepartmentMemory> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ShipmentDepartmentMemory>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, ShipmentDepartmentMemory>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function rememberShipmentDepartment(
  shipmentId: string,
  patch: Omit<ShipmentDepartmentMemory, 'at'> & { at?: number },
) {
  if (!shipmentId || !patch.department_id) return;
  const map = readMap();
  map[shipmentId] = {
    department_id: patch.department_id,
    branch_id: patch.branch_id || undefined,
    department_name: patch.department_name || undefined,
    branch_name: patch.branch_name || undefined,
    at: patch.at ?? Date.now(),
  };
  writeMap(map);
}

export function getRememberedShipmentDepartment(
  shipmentId: string,
): ShipmentDepartmentMemory | null {
  if (!shipmentId) return null;
  return readMap()[shipmentId] ?? null;
}

export function clearRememberedShipmentDepartment(shipmentId: string) {
  if (!shipmentId) return;
  const map = readMap();
  if (!(shipmentId in map)) return;
  delete map[shipmentId];
  writeMap(map);
}

/** Fill missing department/branch from last successful save; never override API values. */
export function applyRememberedShipmentDepartment<
  T extends {
    id?: string;
    department_id?: string;
    branch_id?: string;
    department_name?: string;
    branch_name?: string;
  },
>(shipment: T): T {
  const id = String(shipment.id ?? '').trim();
  if (!id) return shipment;
  const remembered = getRememberedShipmentDepartment(id);
  if (!remembered) return shipment;

  const department_id = shipment.department_id || remembered.department_id;
  const branch_id = shipment.branch_id || remembered.branch_id;
  const department_name = shipment.department_name || remembered.department_name;
  const branch_name = shipment.branch_name || remembered.branch_name;

  if (
    department_id === shipment.department_id &&
    branch_id === shipment.branch_id &&
    department_name === shipment.department_name &&
    branch_name === shipment.branch_name
  ) {
    return shipment;
  }

  return {
    ...shipment,
    department_id,
    branch_id,
    department_name,
    branch_name,
  };
}
