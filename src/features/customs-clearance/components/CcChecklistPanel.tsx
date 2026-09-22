import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcChecklist, useCcJobActions } from '../hooks/useCustomsClearance';

export function CcChecklistPanel({ jobId }: { jobId: string }) {
  const { data: items = [], isLoading, isError, error, refetch } = useCcChecklist(jobId);
  const actions = useCcJobActions(jobId);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await refetch();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Docs checklist</CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={actions.seedChecklist.isPending}
            onClick={() =>
              void run(() => actions.seedChecklist.mutateAsync({}), 'Checklist seeded.')
            }
          >
            Seed checklist
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : null}
        <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {item.label || item.code || item.id.slice(0, 8)}
                  {item.required ? (
                    <span className="ml-1 text-xs text-amber-700">required</span>
                  ) : null}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {item.status || (item.completed ? 'done' : 'pending')}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={actions.updateChecklistItem.isPending || item.completed}
                onClick={() =>
                  void run(
                    () =>
                      actions.updateChecklistItem.mutateAsync({
                        itemId: item.id,
                        dto: { completed: true, status: 'COMPLETE' },
                      }),
                    'Item marked complete.',
                  )
                }
              >
                Mark done
              </Button>
            </li>
          ))}
          {!isLoading && items.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--color-neutral-400)]">
              No checklist items — seed to generate.
            </li>
          ) : null}
        </ul>
        <Button
          type="button"
          disabled={actions.stageDocsComplete.isPending}
          onClick={() =>
            void run(
              () => actions.stageDocsComplete.mutateAsync({}),
              'Docs stage complete.',
            )
          }
        >
          Stage: docs complete
        </Button>
      </div>
    </Card>
  );
}
