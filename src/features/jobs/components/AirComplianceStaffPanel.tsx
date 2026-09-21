import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { axiosInstance } from '@/lib/axios';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { JOB_API } from '../api/job.api';

export function AirComplianceStaffPanel({ jobId }: { jobId: string }) {
  const qc = useQueryClient();
  const form = useQuery({
    queryKey: ['air-compliance', jobId],
    queryFn: async () => {
      const res = await axiosInstance.get(JOB_API.airComplianceForm(jobId));
      const data = res.data && typeof res.data === 'object' && 'data' in res.data ? res.data.data : res.data;
      return (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
    },
  });
  const [reason, setReason] = useState('Staff correction');
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      const current = form.data ?? {};
      await axiosInstance.put(JOB_API.airComplianceForm(jobId), {
        ...current,
        admin_override: true,
        mark_complete: true,
        stage_override_reason: reason.trim() || 'Staff correction',
      });
    },
    onSuccess: () => {
      setError(null);
      void qc.invalidateQueries({ queryKey: ['air-compliance', jobId] });
    },
    onError: (err: unknown) => setError(getErrorMessage(err)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Air compliance form (staff)</CardTitle>
      </CardHeader>
      <div className="space-y-2 px-4 pb-4 text-sm">
        <p className="text-[var(--color-neutral-500)]">
          Reads and saves GET/PUT /jobs/:id/air/compliance-form. Existing air booking form is unchanged.
        </p>
        {form.isError ? (
          <p className="text-[var(--color-neutral-500)]">No compliance form on this job yet.</p>
        ) : (
          <pre className="max-h-48 overflow-auto rounded bg-[var(--color-neutral-50)] p-3 text-xs">
            {JSON.stringify(form.data ?? {}, null, 2)}
          </pre>
        )}
        <label className="block text-xs text-[var(--color-neutral-500)]">
          Override reason
          <input
            className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
          Mark complete (admin override)
        </Button>
        {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      </div>
    </Card>
  );
}
