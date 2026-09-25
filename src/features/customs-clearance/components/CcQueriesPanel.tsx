import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcJobActions, useCcQueries } from '../hooks/useCustomsClearance';

export function CcQueriesPanel({ jobId }: { jobId: string }) {
  const { data: queries = [], isLoading, isError, error, refetch } = useCcQueries(jobId);
  const actions = useCcJobActions(jobId);
  const [queryText, setQueryText] = useState('');
  const [assessedDuty, setAssessedDuty] = useState('');
  const [assessedTax, setAssessedTax] = useState('');
  const [dutyCurrency, setDutyCurrency] = useState('AED');
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
        <textarea
          className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] bg-white p-2 text-sm"
          placeholder="Query text *"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
        <Button
          type="button"
          disabled={actions.createQuery.isPending || !queryText.trim()}
          onClick={() =>
            void run(
              () =>
                actions.createQuery.mutateAsync({
                  query_text: queryText.trim(),
                }),
              'Query raised.',
            ).then(() => setQueryText(''))
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
              className="flex flex-wrap items-start justify-between gap-2 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium whitespace-pre-wrap">
                  {q.query_text || q.id.slice(0, 8)}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {[q.status, q.raised_at, q.closed_at && `closed ${q.closed_at}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {q.response_text ? (
                  <p className="mt-1 text-xs text-[var(--color-neutral-600)]">
                    Response: {q.response_text}
                  </p>
                ) : null}
                <Input
                  className="mt-2 max-w-md"
                  placeholder="Response text"
                  id={`cc-q-resp-${q.id}`}
                  defaultValue={q.response_text ?? ''}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={actions.updateQuery.isPending}
                  onClick={() => {
                    const input = document.getElementById(
                      `cc-q-resp-${q.id}`,
                    ) as HTMLInputElement | null;
                    return void run(
                      () =>
                        actions.updateQuery.mutateAsync({
                          queryId: q.id,
                          dto: {
                            response_text: input?.value.trim() || 'Acknowledged',
                          },
                        }),
                      'Query updated.',
                    );
                  }}
                >
                  Save response
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
              </div>
            </li>
          ))}
          {!isLoading && queries.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--color-neutral-400)]">No queries.</li>
          ) : null}
        </ul>

        <div className="grid gap-2 border-t border-[var(--color-neutral-100)] pt-3 sm:grid-cols-3">
          <Input
            type="number"
            min={0}
            placeholder="Assessed duty"
            value={assessedDuty}
            onChange={(e) => setAssessedDuty(e.target.value)}
          />
          <Input
            type="number"
            min={0}
            placeholder="Assessed tax"
            value={assessedTax}
            onChange={(e) => setAssessedTax(e.target.value)}
          />
          <Input
            placeholder="Duty currency"
            value={dutyCurrency}
            onChange={(e) => setDutyCurrency(e.target.value.toUpperCase())}
            maxLength={3}
          />
        </div>
        <Button
          type="button"
          disabled={actions.stageAssess.isPending}
          onClick={() =>
            void run(
              () =>
                actions.stageAssess.mutateAsync({
                  assessed_duty: assessedDuty ? Number(assessedDuty) : undefined,
                  assessed_tax: assessedTax ? Number(assessedTax) : undefined,
                  duty_currency: dutyCurrency.trim() || undefined,
                }),
              'Assess stage complete.',
            )
          }
        >
          Stage: assess
        </Button>
      </div>
    </Card>
  );
}
