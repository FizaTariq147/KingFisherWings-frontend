import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { axiosInstance } from '@/lib/axios';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { JOB_API } from '../api/job.api';

function rowsOf(data: unknown): Record<string, unknown>[] {
  const value =
    data && typeof data === 'object' && 'data' in (data as object)
      ? (data as { data: unknown }).data
      : data;
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

export function JobSeaScansPanel({ jobId }: { jobId: string }) {
  const qc = useQueryClient();
  const scans = useQuery({
    queryKey: ['sea-scans', jobId],
    queryFn: async () => rowsOf((await axiosInstance.get(JOB_API.seaScans(jobId))).data),
  });
  const [barcode, setBarcode] = useState('');
  const [container, setContainer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(JOB_API.seaScans(jobId), {
        barcode: barcode.trim() || undefined,
        container_number: container.trim() || undefined,
        scanned_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setError(null);
      setBarcode('');
      void qc.invalidateQueries({ queryKey: ['sea-scans', jobId] });
    },
    onError: (err: unknown) => setError(getErrorMessage(err)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sea scans</CardTitle>
      </CardHeader>
      <div className="space-y-2 px-4 pb-4">
        <Input label="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        <Input
          label="Container number"
          value={container}
          onChange={(e) => setContainer(e.target.value)}
        />
        <Button
          type="button"
          disabled={(!barcode.trim() && !container.trim()) || save.isPending}
          onClick={() => save.mutate()}
        >
          Record scan
        </Button>
        {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
        <ul className="text-sm">
          {(scans.data ?? []).map((row, index) => (
            <li key={String(row.id ?? index)}>
              {String(row.barcode ?? row.container_number ?? row.scanned_at ?? index)}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
