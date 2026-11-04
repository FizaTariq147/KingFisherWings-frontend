import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { useJobMilestoneMutations } from '../../hooks/useJobActions';
import { jobKeys, useJobMilestones } from '../../hooks/useJobs';
import { createJobMilestoneSchema } from '../../schemas/job.schema';
import type { JobMilestone } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { formatMilestoneHeading, milestoneRouteKey } from '../../utils/normalizeJob';

interface JobMilestonesPanelProps {
  jobId: string;
}

function milestoneIsDone(m: JobMilestone): boolean {
  if (m.is_completed === true) return true;
  if (String(m.actual_date || '').trim()) return true;
  if (String(m.completed_at || '').trim()) return true;
  return false;
}

/** PATCH path key — prefer non-UUID code/name. */
function milestoneActionKey(m: JobMilestone): string {
  return (
    milestoneRouteKey(m) ||
    String(m.milestone_key || m.milestone || '').trim()
  );
}

export function JobMilestonesPanel({ jobId }: JobMilestonesPanelProps) {
  const queryClient = useQueryClient();
  const { data: milestones = [], refetch, isFetching } = useJobMilestones(jobId);
  const mutations = useJobMilestoneMutations(jobId);
  const validation = useInlineValidation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateDescription = async (milestoneKey: string, nextDescription: string) => {
    setError(null);
    setSuccess(null);
    if (!milestoneKey) {
      setError('Milestone code/name is missing — cannot save description.');
      return;
    }
    try {
      await mutations.update.mutateAsync({
        milestoneKey,
        dto: { description: nextDescription },
      });
      await refetch();
      setSuccess('Description saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const complete = async (milestoneKey: string, nextDescription: string) => {
    setError(null);
    setSuccess(null);
    const key = String(milestoneKey ?? '').trim();

    if (!key || key === 'undefined' || key === 'null') {
      setError(
        'Milestone code/name is missing. Refresh the list or re-add the custom milestone.',
      );
      return;
    }

    try {
      await mutations.update.mutateAsync({
        milestoneKey: key,
        dto: {
          actual_date: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          description: nextDescription.trim() || undefined,
        },
      });
      await refetch();
      setSuccess('Milestone marked complete.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const add = async () => {
    setError(null);
    setSuccess(null);
    const ok = await validation.runValidated(
      createJobMilestoneSchema,
      {
        milestone: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
      },
      async (dto) => {
        const created = await mutations.create.mutateAsync(dto);
        setName('');
        setDescription('');
        // Keep the created row even if GET temporarily omits it.
        queryClient.setQueryData<JobMilestone[]>(jobKeys.milestones(jobId), (prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const key = String(created.milestone_key || created.milestone || created.id)
            .trim()
            .toUpperCase();
          if (
            key &&
            list.some(
              (m) =>
                String(m.milestone_key || m.milestone || m.id)
                  .trim()
                  .toUpperCase() === key,
            )
          ) {
            return list;
          }
          return [created, ...list];
        });
      },
    );
    if (ok) {
      setSuccess('Custom milestone added.');
      // Soft refresh — seeded cache already shows the new row.
      void refetch().then((result) => {
        const list = result.data;
        if (!Array.isArray(list)) return;
        queryClient.setQueryData<JobMilestone[]>(jobKeys.milestones(jobId), (prev) => {
          const seeded = Array.isArray(prev) ? prev : [];
          const byKey = new Map<string, JobMilestone>();
          for (const m of [...list, ...seeded]) {
            const key = String(m.milestone_key || m.milestone || m.id)
              .trim()
              .toUpperCase();
            if (!key || byKey.has(key)) continue;
            byKey.set(key, m);
          }
          return [...byKey.values()];
        });
      });
    }
  };

  return (
    <div className="space-y-4">
      {(error || validation.formError) && (
        <p role="alert" className="text-sm text-[var(--color-danger-600)]">
          {error || validation.formError}
        </p>
      )}
      {success ? (
        <p role="status" className="text-sm text-[var(--color-success-700,#15803d)]">
          {success}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            Milestones
            {isFetching ? (
              <span className="ml-2 text-xs font-normal text-[var(--color-neutral-400)]">
                Refreshing…
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          {milestones.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No milestones.</p>
          ) : (
            milestones.map((m: JobMilestone) => {
              const key = milestoneActionKey(m);
              const heading = formatMilestoneHeading(
                m.milestone || m.milestone_key || key || 'Milestone',
              );
              const done = milestoneIsDone(m);
              const rowDescription =
                descriptionDrafts[m.id] ?? m.description ?? m.notes ?? '';

              return (
                <div
                  key={key || m.id}
                  className="space-y-2 border-b border-[var(--color-neutral-100)] py-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{heading}</p>
                      <p className="text-xs text-[var(--color-neutral-400)]">
                        {key && formatMilestoneHeading(key) !== heading
                          ? `Code: ${key} · `
                          : ''}
                        Planned: {m.planned_date || '—'} · Actual:{' '}
                        {m.completed_at || m.actual_date || '—'}
                        {done ? ' · Completed' : ''}
                      </p>
                    </div>
                    {!done ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={!key || mutations.update.isPending}
                        onClick={() => void complete(key, rowDescription)}
                      >
                        Mark complete
                      </Button>
                    ) : null}
                  </div>

                  <label className="block text-xs font-medium text-[var(--color-neutral-600)]">
                    Milestone description
                  </label>
                  <textarea
                    value={rowDescription}
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
                      onClick={() => void updateDescription(key, rowDescription)}
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
        <form
          className="space-y-3 px-4 pb-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void add();
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Milestone name / code
            </label>
            <Input
              value={name}
              error={validation.fieldError('milestone')}
              onChange={(event) => {
                setName(event.target.value);
                validation.clearField('milestone');
                setSuccess(null);
              }}
              placeholder="e.g. CUSTOMS_QUERY_RAISED or Customs query raised"
              disabled={mutations.create.isPending}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={2}
              placeholder="Customer-visible note for this milestone"
              disabled={mutations.create.isPending}
              className="w-full rounded-md border border-[var(--color-neutral-200)] bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutations.create.isPending || !name.trim()}>
              {mutations.create.isPending ? 'Adding…' : 'Add custom milestone'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
