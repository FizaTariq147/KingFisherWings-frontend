import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcJobActions, useCcQueries } from '../hooks/useCustomsClearance';

export function CcQueriesPanel({ jobId }: { jobId: string }) {
  const { data: queries = [], isLoading, isError, error, refetch } = useCcQueries(jobId);
  const actions = useCcJobActions(jobId);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Customs queries</CardTitle>
        <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Input placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <Button
          type="button"
          disabled={actions.createQuery.isPending || !subject.trim()}
          onClick={() =>
            void run(
              () =>
                actions.createQuery.mutateAsync({
                  subject: subject.trim(),
                  body: body.trim() || undefined,
                }),
              'Query raised.',
            ).then(() => {
              setSubject('');
              setBody('');
            })
          }
        >
          Raise query
        </Button>
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : null}
        <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
          {queries.map((q) => (
            <li
              key={q.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{q.subject || q.id.slice(0, 8)}</p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {[q.status, q.raised_at, q.closed_at && `closed ${q.closed_at}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {q.body ? <p className="mt-1 text-xs">{q.body}</p> : null}
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={actions.updateQuery.isPending}
                onClick={() =>
                  void run(
                    () =>
                      actions.updateQuery.mutateAsync({
                        queryId: q.id,
                        dto: { response: 'Acknowledged' },
                      }),
                    'Query updated.',
                  )
                }
              >
                Update
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={actions.closeQuery.isPending || Boolean(q.closed_at)}
                onClick={() =>
                  void run(
                    () => actions.closeQuery.mutateAsync({ queryId: q.id }),
                    'Query closed.',
                  )
                }
              >
                Close
              </Button>
            </li>
          ))}
          {!isLoading && queries.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--color-neutral-400)]">No queries.</li>
          ) : null}
        </ul>
        <Button
          type="button"
          disabled={actions.stageAssess.isPending}
          onClick={() =>
            void run(() => actions.stageAssess.mutateAsync({}), 'Assess stage complete.')
          }
        >
          Stage: assess
        </Button>
      </div>
    </Card>
  );
}
