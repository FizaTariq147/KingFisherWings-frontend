import { useState } from 'react';
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

function optionLabel(row: Record<string, unknown>): string {
  const code = String(row.code ?? '').trim();
  const name = String(row.name ?? row.display_name ?? row.displayName ?? '').trim();
  if (code && name && !isUuid(name)) return `${code} — ${name}`;
  if (name && !isUuid(name)) return name;
  if (code && !isUuid(code)) return code;
  return String(row.id ?? '');
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

  const canEdit =
    perms.canWriteUpdate && shipment.actions?.can_change_department !== false;

  const save = async () => {
    setError(null);
    setMsg(null);
    const dept = departmentId.trim();
    if (!isUuid(dept)) {
      setError('Select a valid department.');
      return;
    }
    try {
      await changeDepartment.mutateAsync({
        department_id: dept,
        ...(isUuid(branchId.trim()) ? { branch_id: branchId.trim() } : {}),
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <div className={erpForm.label}>Current department</div>
          <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[#0f172a]">
            {labels.departmentLabel || '—'}
          </div>
        </div>
        <div className="min-w-0">
          <div className={erpForm.label}>Current branch</div>
          <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[#0f172a]">
            {labels.branchLabel || '—'}
          </div>
        </div>
      </div>

      {canEdit ? (
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
              {departments
                .filter((d) => isUuid(String(d.id)))
                .map((d) => (
                  <option key={String(d.id)} value={String(d.id)}>
                    {optionLabel(d as Record<string, unknown>)}
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
              {branches
                .filter((b) => isUuid(String(b.id)))
                .map((b) => (
                  <option key={String(b.id)} value={String(b.id)}>
                    {optionLabel(b as Record<string, unknown>)}
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
      ) : (
        <p className="text-[#64748b]">You do not have permission to change department.</p>
      )}
    </div>
  );
}
