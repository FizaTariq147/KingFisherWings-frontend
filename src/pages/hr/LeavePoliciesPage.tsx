import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';
import { hrService } from '@/features/hr/services/hr.service';
import { LEAVE_TYPES, STAFF_GRADES, labelEnum } from '@/features/hr/constants/hr.constants';
import {
  leavePolicySchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '@/features/hr/schemas/hr.schema';
import type { LeaveType, StaffGrade } from '@/features/hr/types/hr.types';

export default function LeavePoliciesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [staffGrade, setStaffGrade] = useState<StaffGrade>('STAFF');
  const [entitlementDays, setEntitlementDays] = useState('30');
  const [carryForward, setCarryForward] = useState('5');
  const [encashment, setEncashment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: policies = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'leave-policies'],
    queryFn: () => hrService.listLeavePolicies(),
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['hr', 'leave-policies'] });

  const create = useMutation({
    mutationFn: (payload: {
      leave_type: LeaveType;
      staff_grade: StaffGrade;
      entitlement_days: number;
      carry_forward_max?: number;
      encashment_allowed?: boolean;
    }) => hrService.createLeavePolicy(payload),
    onSuccess: () => {
      setOpen(false);
      setFieldErrors({});
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not save policy.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => hrService.deleteLeavePolicy(id),
    onSuccess: refresh,
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not delete policy.'),
  });

  const submit = () => {
    setActionError(null);
    const parsed = parseWithFieldErrors(leavePolicySchema, {
      leave_type: leaveType,
      staff_grade: staffGrade,
      entitlement_days: Number(entitlementDays),
      carry_forward_max: carryForward ? Number(carryForward) : undefined,
      encashment_allowed: encashment,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    setFieldErrors({});
    create.mutate({
      leave_type: parsed.data.leave_type,
      staff_grade: parsed.data.staff_grade,
      entitlement_days: parsed.data.entitlement_days!,
      carry_forward_max: parsed.data.carry_forward_max,
      encashment_allowed: parsed.data.encashment_allowed,
    });
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-gray-800">Leave Policies</h1>
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus size={14} className="mr-1" />
          New policy
        </Button>
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading policies…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Could not load policies.'}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {['Leave type', 'Staff grade', 'Entitlement', 'Carry forward', 'Encashment', 'Actions'].map((col) => (
                  <th key={col} className="text-left px-4 py-2 font-semibold text-[#0A2942]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-gray-500 text-center">
                    No leave policies configured.
                  </td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">{labelEnum(policy.leave_type)}</td>
                    <td className="px-4 py-2">{labelEnum(policy.staff_grade)}</td>
                    <td className="px-4 py-2">{policy.entitlement_days} days</td>
                    <td className="px-4 py-2">{policy.carry_forward_max}</td>
                    <td className="px-4 py-2">{policy.encashment_allowed ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="text-xs text-red-700 hover:underline"
                        onClick={() => remove.mutate(policy.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New leave policy">
        <div className="space-y-3">
          <label className="text-sm block">
            Leave type
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {labelEnum(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block">
            Staff grade
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={staffGrade}
              onChange={(e) => setStaffGrade(e.target.value as StaffGrade)}
            >
              {STAFF_GRADES.map((g) => (
                <option key={g} value={g}>
                  {labelEnum(g)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block">
            Entitlement days
            <input
              type="number"
              min={0}
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={entitlementDays}
              onChange={(e) => setEntitlementDays(e.target.value)}
            />
            {fieldErrors.entitlement_days && (
              <span className="text-red-600 text-xs">{fieldErrors.entitlement_days}</span>
            )}
          </label>
          <label className="text-sm block">
            Carry forward max
            <input
              type="number"
              min={0}
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={carryForward}
              onChange={(e) => setCarryForward(e.target.value)}
            />
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={encashment} onChange={(e) => setEncashment(e.target.checked)} />
            Encashment allowed
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={create.isPending}>
              {create.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
