import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { erpForm } from '@/lib/erpForm';
import { isUuid } from '@/lib/isUuid';
import { useChangeShipmentDepartment } from '../hooks/useShipments';
import { useShipmentResolvedLabels } from '../hooks/useShipmentResolvedLabels';
import { useShipmentsPermissions } from '../hooks/useShipmentsPermissions';
import type { Shipment } from '../types/shipment.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { rememberShipmentDepartment } from '../utils/shipmentDepartmentMemory';

function optionLabel(row: Record<string, unknown>): string {
  const code = String(row.code ?? '').trim();
  const name = String(row.name ?? row.display_name ?? row.displayName ?? '').trim();
  if (code && name && !isUuid(name)) return `${code} — ${name}`;
  if (name && !isUuid(name)) return name;
  if (code && !isUuid(code)) return code;
  return String(row.id ?? '');
}

function labelForId(
  rows: Array<Record<string, unknown>>,
  id: string | undefined,
): string | undefined {
  if (!id || !isUuid(id)) return undefined;
  const row = rows.find((r) => String(r.id ?? '') === id);
  return row ? optionLabel(row) : undefined;
}

/**
 * Department tab — shows resolved department/branch and PATCH /shipments/:id/department.
 * detail/department often returns UUID-only payloads that FormFieldsFromPayload hides as "No fields".
 */
export function ShipmentDepartmentPanel({
  shipment,
  onChanged,
}: {
  shipment: Shipment;
  onChanged?: () => void;
}) {
  const perms = useShipmentsPermissions();
  const labels = useShipmentResolvedLabels(shipment);
  const changeDepartment = useChangeShipmentDepartment(shipment.id);
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
    true,
  );
  const { data: branches = [] } = useMasterOptions(
    'branches',
    MASTER_PATHS.branches,
    true,
  );

  const [departmentId, setDepartmentId] = useState(shipment.department_id || '');
  const [branchId, setBranchId] = useState(shipment.branch_id || '');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Reset only when opening another shipment — do not clear selects if a sparse
  // refetch briefly omits department_id / branch_id.
  useEffect(() => {
    setDepartmentId(shipment.department_id || '');
    setBranchId(shipment.branch_id || '');
  }, [shipment.id]);

  useEffect(() => {
    if (shipment.department_id) setDepartmentId(shipment.department_id);
    if (shipment.branch_id) setBranchId(shipment.branch_id);
  }, [shipment.department_id, shipment.branch_id]);

  const canEdit =
    perms.canWriteUpdate && shipment.actions?.can_change_department !== false;

  const deptRows = departments as Array<Record<string, unknown>>;
  const branchRows = branches as Array<Record<string, unknown>>;

  const currentDepartmentLabel = useMemo(
    () =>
      labels.departmentLabel ||
      labelForId(deptRows, shipment.department_id) ||
      labelForId(deptRows, departmentId),
    [labels.departmentLabel, deptRows, shipment.department_id, departmentId],
  );

  const currentBranchLabel = useMemo(
    () =>
      labels.branchLabel ||
      labelForId(branchRows, shipment.branch_id) ||
      labelForId(branchRows, branchId),
    [labels.branchLabel, branchRows, shipment.branch_id, branchId],
  );

  const save = async () => {
    setError(null);
    setMsg(null);
    const dept = departmentId.trim();
    if (!isUuid(dept)) {
      setError('Select a valid department.');
      return;
    }
    const branch = branchId.trim();
    const branchUuid = isUuid(branch) ? branch : undefined;
    try {
      rememberShipmentDepartment(shipment.id, {
        department_id: dept,
        branch_id: branchUuid,
        department_name: labelForId(deptRows, dept),
        branch_name: branchUuid ? labelForId(branchRows, branchUuid) : undefined,
      });
      await changeDepartment.mutateAsync({
        department_id: dept,
        ...(branchUuid ? { branch_id: branchUuid } : {}),
      });
      setMsg('Department updated.');
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4 p-3 text-[13px]">
      {error ? <p className="text-[var(--color-danger-700)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <ul className="divide-y divide-[#e8edf2] rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white">
        {[
          { label: 'Department', value: currentDepartmentLabel },
          { label: 'Branch', value: currentBranchLabel },
        ].map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4"
          >
            <span className="text-[12px] font-medium text-[#64748b]">{row.label}</span>
            <span className="break-words text-[13px] font-medium text-[#0f172a]">
              {row.value || '—'}
            </span>
          </li>
        ))}
      </ul>

      {canEdit ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
            Edit
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className={erpForm.label}>Department</span>
              <select
                className={erpForm.input}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={changeDepartment.isPending}
              >
                <option value="">Select…</option>
                {deptRows
                  .filter((d) => isUuid(String(d.id)))
                  .map((d) => (
                    <option key={String(d.id)} value={String(d.id)}>
                      {optionLabel(d)}
                    </option>
                  ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className={erpForm.label}>Branch (optional)</span>
              <select
                className={erpForm.input}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                disabled={changeDepartment.isPending}
              >
                <option value="">Select…</option>
                {branchRows
                  .filter((b) => isUuid(String(b.id)))
                  .map((b) => (
                    <option key={String(b.id)} value={String(b.id)}>
                      {optionLabel(b)}
                    </option>
                  ))}
              </select>
            </label>
            <div className="sm:col-span-2">
              <Button
                type="button"
                size="sm"
                variant="edit"
                leftIcon={<Save />}
                disabled={changeDepartment.isPending || !isUuid(departmentId.trim())}
                onClick={() => void save()}
              >
                {changeDepartment.isPending ? 'Saving…' : 'Save department'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[#64748b]">You do not have permission to change department.</p>
      )}
    </div>
  );
}
