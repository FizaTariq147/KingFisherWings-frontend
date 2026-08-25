import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { useJobMilestoneMutations } from '../../hooks/useJobActions';
import { useJobMilestones } from '../../hooks/useJobs';
import { createJobMilestoneSchema } from '../../schemas/job.schema';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobMilestonesPanelProps {
  jobId: string;
}

export function JobMilestonesPanel({ jobId }: JobMilestonesPanelProps) {
  const { data: milestones = [], refetch } = useJobMilestones(jobId);
  const mutations = useJobMilestoneMutations(jobId);
  const validation = useInlineValidation();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const complete = async (id: string) => {
    setError(null);
    try {
      await mutations.update.mutateAsync({
        milestoneId: id,
        dto: { actual_date: new Date().toISOString().slice(0, 10) },
      });
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const add = async () => {
    const ok = await validation.runValidated(
      createJobMilestoneSchema,
      { milestone: name.trim() },
      async (dto) => {
        await mutations.create.mutateAsync(dto);
        setName('');
        refetch();
      },
    );
    if (!ok) setError(null);
  };

  return (
    <div className="space-y-4">
      {(error || validation.formError) && (
        <p className="text-sm text-[var(--color-danger-600)]">{error || validation.formError}</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2">
          {milestones.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No milestones.</p>
          ) : (
            milestones.map((raw) => {
              const m = raw as {
                id: string;
                milestone?: string;
                name?: string;
                planned_date?: string;
                actual_date?: string;
              };
              const done = Boolean(m.actual_date);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-[var(--color-neutral-100)] text-sm"
                >
                  <div>
                    <p className="font-medium">{m.milestone ?? m.name}</p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Planned: {m.planned_date || '—'} · Actual: {m.actual_date || '—'}
                    </p>
                  </div>
                  {!done && (
                    <Button type="button" size="sm" onClick={() => complete(m.id)}>
                      Mark complete
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add custom milestone</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 flex gap-2 items-start">
          <Input
            value={name}
            error={validation.fieldError('milestone')}
            onChange={(e) => {
              setName(e.target.value);
              validation.clearField('milestone');
            }}
            placeholder="Milestone name"
          />
          <Button type="button" disabled={mutations.create.isPending} onClick={() => void add()}>
            Add
          </Button>
        </div>
      </Card>
    </div>
  );
}
