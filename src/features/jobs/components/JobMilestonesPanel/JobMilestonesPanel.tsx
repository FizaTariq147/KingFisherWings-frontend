
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { useJobMilestoneMutations } from '../../hooks/useJobActions';
import { useJobMilestones } from '../../hooks/useJobs';
import { createJobMilestoneSchema } from '../../schemas/job.schema';
import type { JobMilestone } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { milestoneRouteKey } from '../../utils/normalizeJob';

interface JobMilestonesPanelProps {
  jobId: string;
}

export function JobMilestonesPanel({ jobId }: JobMilestonesPanelProps) {
  const { data: milestones = [], refetch } = useJobMilestones(jobId);
  const mutations = useJobMilestoneMutations(jobId);
  const validation = useInlineValidation();
  const [name, setName] = useState('');
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const updateDescription = async (milestoneKey: string, description: string) => {
    setError(null);
    try {
      await mutations.update.mutateAsync({
        milestoneKey,
        dto: { description },
      });
      await refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const complete = async (milestoneKey: string, description: string) => {
    setError(null);
    const key = String(milestoneKey ?? '').trim();

    if (!key || key === 'undefined' || key === 'null') {
      setError(
        'Milestone code/name is missing. Refresh the list or use the code from GET /jobs/:id/milestones.',
      );
      return;
    }

    try {
      await mutations.update.mutateAsync({
        milestoneKey: key,
        dto: {
          actual_date: new Date().toISOString(),
          description: description.trim() || undefined,
        },
      });
      await refetch();
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
        await refetch();
      },
    );
    if (!ok) setError(null);
  };

  return (
    <div className="space-y-4">
      {(error || validation.formError) && (
        <p className="text-sm text-[var(--color-danger-600)]">
          {error || validation.formError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          {milestones.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No milestones.</p>
          ) : (
            milestones.map((m: JobMilestone) => {
              const key = milestoneRouteKey(m);
              const label = m.milestone || m.milestone_key || key || 'Milestone';
              const done = Boolean(m.actual_date || m.completed_at || m.is_completed);
              const description =
                descriptionDrafts[m.id] ?? m.description ?? m.notes ?? '';

              return (
                <div
                  key={key || m.id}
                  className="space-y-2 border-b border-[var(--color-neutral-100)] py-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-[var(--color-neutral-400)]">
                        {key && key !== label ? `Code: ${key} · ` : ''}
                        Planned: {m.planned_date || '—'} · Actual:{' '}
                        {m.completed_at || m.actual_date || '—'}
                      </p>
                    </div>
                    {!done && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={!key || mutations.update.isPending}
                        onClick={() => void complete(key, description)}
                      >
                        Mark complete
                      </Button>
                    )}
                  </div>

                  <label className="block text-xs font-medium text-[var(--color-neutral-600)]">
                    Milestone description
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescriptionDrafts((current) => ({
                        ...current,
                        [m.id]: event.target.value,
                      }))
                    }
                    maxLength={2000}
                    rows={2}
                    placeholder="Add a customer-facing update..."
                    className="w-full rounded-md border border-[var(--color-neutral-200)] bg-transparent px-3 py-2 text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={!key || mutations.update.isPending}
                      onClick={() => void updateDescription(key, description)}
                    >
                      Save description
                    </Button>
                  </div>
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
        <div className="flex items-start gap-2 px-4 pb-4">
          <Input
            value={name}
            error={validation.fieldError('milestone')}
            onChange={(event) => {
              setName(event.target.value);
              validation.clearField('milestone');
            }}
            placeholder="Milestone code / name (e.g. SI_SUBMITTED)"
          />
          <Button
            type="button"
            disabled={mutations.create.isPending}
            onClick={() => void add()}
          >
            Add
          </Button>
        </div>
      </Card>
    </div>
  );
}
