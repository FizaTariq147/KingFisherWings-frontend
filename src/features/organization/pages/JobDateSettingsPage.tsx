import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { organizationService } from '../services/organization.service';
import type { JobDateSource } from '../types/organization.types';
import { getErrorMessage } from '../utils/getErrorMessage';

const OPTIONS: { value: JobDateSource; label: string; help: string }[] = [
  {
    value: 'ETD_ATD',
    label: 'ETD / ATD',
    help: 'Use estimated or actual departure date as job_date on create / generate-job.',
  },
  {
    value: 'ETA_ATA',
    label: 'ETA / ATA',
    help: 'Use estimated or actual arrival date as job_date.',
  },
  {
    value: 'SYSTEM_DATE',
    label: 'System date',
    help: 'Use the server calendar date when the job is created.',
  },
];

export default function JobDateSettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['organization', 'job-date-settings'],
    queryFn: () => organizationService.getJobDateSettings(),
  });
  const [source, setSource] = useState<JobDateSource>('SYSTEM_DATE');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = query.data?.job_date_source;
    if (next === 'ETD_ATD' || next === 'ETA_ATA' || next === 'SYSTEM_DATE') {
      setSource(next);
    }
  }, [query.data?.job_date_source]);

  const save = useMutation({
    mutationFn: () =>
      organizationService.updateJobDateSettings({ job_date_source: source }),
    onSuccess: () => {
      setError(null);
      setMessage('Job date settings saved.');
      void queryClient.invalidateQueries({ queryKey: ['organization', 'job-date-settings'] });
    },
    onError: (err) => {
      setMessage(null);
      setError(getErrorMessage(err));
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">Job date</h2>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Controls how <code className="text-[12px]">job_date</code> is set on{' '}
          <code className="text-[12px]">POST /jobs</code> and{' '}
          <code className="text-[12px]">POST /shipments/:id/generate-job</code>.
        </p>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}

      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer gap-3 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2.5"
          >
            <input
              type="radio"
              name="job_date_source"
              className="mt-1"
              checked={source === opt.value}
              onChange={() => setSource(opt.value)}
            />
            <span>
              <span className="block text-sm font-medium text-[var(--color-neutral-900)]">
                {opt.label}
              </span>
              <span className="block text-[12px] text-[var(--color-neutral-500)]">{opt.help}</span>
            </span>
          </label>
        ))}
      </div>

      <Button
        type="button"
        size="sm"
        variant="success"
        disabled={save.isPending || query.isLoading}
        onClick={() => save.mutate()}
      >
        {save.isPending ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}
