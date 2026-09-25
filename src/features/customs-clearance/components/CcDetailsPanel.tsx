import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcDetails, useCcJobActions } from '../hooks/useCustomsClearance';
import type { CcDirection } from '../types/customsClearance.types';

const DIRECTIONS: CcDirection[] = ['IMPORT', 'EXPORT', 'TRANSIT'];

export function CcDetailsPanel({ jobId }: { jobId: string }) {
  const { data, isLoading, isError, error, refetch } = useCcDetails(jobId);
  const actions = useCcJobActions(jobId);
  const [form, setForm] = useState({
    direction: '' as string,
    cha_party_id: '',
    border_or_port: '',
    remarks: '',
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setForm({
      direction: data.direction ?? '',
      cha_party_id: data.cha_party_id ?? '',
      border_or_port: data.border_or_port ?? '',
      remarks: data.remarks ?? '',
    });
  }, [data]);

  const save = async () => {
    setErr(null);
    setMsg(null);
    try {
      await actions.updateDetails.mutateAsync({
        direction: form.direction || undefined,
        cha_party_id: form.cha_party_id || undefined,
        border_or_port: form.border_or_port || undefined,
        remarks: form.remarks || undefined,
      });
      setMsg('CC details saved.');
      await refetch();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CC details</CardTitle>
        <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs text-[var(--color-neutral-500)]">
            Direction
            <select
              className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
              value={form.direction}
              onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
            >
              <option value="">Select…</option>
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--color-neutral-500)]">
            CHA party id
            <Input
              className="mt-1"
              value={form.cha_party_id}
              onChange={(e) => setForm((f) => ({ ...f, cha_party_id: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-[var(--color-neutral-500)] sm:col-span-2">
            Border / port
            <Input
              className="mt-1"
              value={form.border_or_port}
              onChange={(e) => setForm((f) => ({ ...f, border_or_port: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-[var(--color-neutral-500)] sm:col-span-2">
            Remarks
            <Input
              className="mt-1"
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
            />
          </label>
        </div>
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        <Button type="button" disabled={actions.updateDetails.isPending} onClick={() => void save()}>
          Save details
        </Button>
      </div>
    </Card>
  );
}
