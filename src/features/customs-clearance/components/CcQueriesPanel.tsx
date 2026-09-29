import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  canRunCcStageAction,
  inferCcApiStatusFromTimestamps,
  resolveCcApiStatus,
  statusToCcStage,
} from '../constants/ccWorkflow';
import { useCcJobActions, useCcQueries, useCcStatus } from '../hooks/useCustomsClearance';
import type { CcQuery } from '../types/customsClearance.types';

function isCcQueryOpen(q: CcQuery): boolean {
  if (q.closed_at) return false;
  const s = String(q.status ?? '')
    .trim()
    .toUpperCase();
  if (!s) return true;
  return !(
    s === 'CLOSED' ||
    s === 'RESOLVED' ||
    s === 'ANSWERED' ||
    s === 'DONE' ||
    s.includes('CLOSE')
  );
}

function readResponseInput(queryId: string): string {
  const input = document.getElementById(`cc-q-resp-${queryId}`) as HTMLInputElement | null;
  return input?.value.trim() || '';
}

export function CcQueriesPanel({ jobId }: { jobId: string }) {
  const {
    data: queries = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCcQueries(jobId);
  const statusQuery = useCcStatus(jobId);
  const actions = useCcJobActions(jobId);
  const [queryText, setQueryText] = useState('');
  const [assessedDuty, setAssessedDuty] = useState('');
  const [assessedTax, setAssessedTax] = useState('');
  const [dutyCurrency, setDutyCurrency] = useState('AED');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const openQueries = useMemo(() => queries.filter(isCcQueryOpen), [queries]);
  const closedCount = queries.length - openQueries.length;
  const apiStatus = resolveCcApiStatus(
    statusQuery.data?.stage,
    statusQuery.data?.status,
    inferCcApiStatusFromTimestamps(statusQuery.data),
  );
  const nextRail = statusToCcStage(apiStatus);
  const canAssess = canRunCcStageAction(apiStatus, 'assess') && openQueries.length === 0;
  const canDuty = canRunCcStageAction(apiStatus, 'duty');

  const refreshAll = async () => {
    await Promise.all([refetch(), statusQuery.refetch()]);
  };

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await refreshAll();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const saveAndClose = async (q: CcQuery) => {
    const response =
      readResponseInput(q.id) || q.response_text?.trim() || 'Acknowledged — query closed.';
    await actions.updateQuery.mutateAsync({
      queryId: q.id,
      dto: { response_text: response },
    });
    await actions.closeQuery.mutateAsync({ queryId: q.id });
  };

  const closeAllOpen = async () => {
    for (const q of openQueries) {
      await saveAndClose(q);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Customs queries</CardTitle>
        <Button type="button" variant="secondary" size="sm" onClick={() => void refreshAll()}>
          Refresh
        </Button>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Assess requires all queries closed. Actions follow live API status (
          <strong>{apiStatus || '—'}</strong> → next <strong>{nextRail}</strong>).
        </p>

        <textarea
          className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] bg-white p-2 text-sm"
          placeholder="Query text *"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          disabled={!canRunCcStageAction(apiStatus, 'assess') && apiStatus !== 'QUERY'}
        />
        <Button
          type="button"
          disabled={
            actions.createQuery.isPending ||
            !queryText.trim() ||
            (!canRunCcStageAction(apiStatus, 'assess') && apiStatus !== 'QUERY' && apiStatus !== 'FILED')
          }
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

        {openQueries.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--color-warning-200)] bg-[var(--color-warning-50)] px-3 py-2 text-sm">
            <span>
              <strong>{openQueries.length}</strong> open quer
              {openQueries.length === 1 ? 'y' : 'ies'} — close before assess.
            </span>
            <Button
              type="button"
              size="sm"
              disabled={actions.closeQuery.isPending || actions.updateQuery.isPending}
              onClick={() =>
                void run(
                  closeAllOpen,
                  `Closed ${openQueries.length} quer${openQueries.length === 1 ? 'y' : 'ies'}.`,
                )
              }
            >
              Close all open
            </Button>
          </div>
        ) : queries.length > 0 && canAssess ? (
          <p className="text-xs text-[var(--color-success-700)]">
            All {closedCount} quer{closedCount === 1 ? 'y' : 'ies'} closed — assess is available.
          </p>
        ) : null}

        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : null}

        <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
          {queries.map((q) => {
            const open = isCcQueryOpen(q);
            return (
              <li
                key={q.id}
                className="flex flex-wrap items-start justify-between gap-2 px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium whitespace-pre-wrap">
                    {q.query_text || q.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    {[
                      open ? 'OPEN' : q.status || 'CLOSED',
                      q.raised_at,
                      q.closed_at && `closed ${q.closed_at}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {q.response_text ? (
                    <p className="mt-1 text-xs text-[var(--color-neutral-600)]">
                      Response: {q.response_text}
                    </p>
                  ) : null}
                  {open ? (
                    <Input
                      className="mt-2 max-w-md"
                      placeholder="Response text"
                      id={`cc-q-resp-${q.id}`}
                      defaultValue={q.response_text ?? ''}
                    />
                  ) : null}
                </div>
                {open ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={actions.updateQuery.isPending}
                      onClick={() => {
                        const response = readResponseInput(q.id) || 'Acknowledged';
                        return void run(
                          () =>
                            actions.updateQuery.mutateAsync({
                              queryId: q.id,
                              dto: { response_text: response },
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
                      disabled={actions.closeQuery.isPending || actions.updateQuery.isPending}
                      onClick={() =>
                        void run(() => saveAndClose(q), 'Query saved & closed.')
                      }
                    >
                      Save & close
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-[var(--color-success-700)]">
                    Closed
                  </span>
                )}
              </li>
            );
          })}
          {!isLoading && queries.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--color-neutral-400)]">No queries.</li>
          ) : null}
        </ul>

        {canAssess ? (
          <>
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
              disabled={actions.stageAssess.isPending || openQueries.length > 0}
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
          </>
        ) : null}

        {canDuty ? (
          <div className="flex flex-wrap gap-2 border-t border-[var(--color-neutral-100)] pt-3">
            <Button
              type="button"
              variant="secondary"
              disabled={actions.dutyPaymentRequest.isPending}
              onClick={() =>
                void run(
                  () => actions.dutyPaymentRequest.mutateAsync({}),
                  'Duty payment requested.',
                )
              }
            >
              Duty payment request
            </Button>
            <Button
              type="button"
              disabled={actions.stageDutyPaid.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.stageDutyPaid.mutateAsync({
                      paid_by_client: true,
                    }),
                  'Duty marked paid.',
                )
              }
            >
              Stage: duty paid
            </Button>
          </div>
        ) : null}

        {!canAssess && !canDuty && apiStatus ? (
          <p className="text-xs text-[var(--color-neutral-500)] border-t border-[var(--color-neutral-100)] pt-3">
            No assess/duty action for status <strong>{apiStatus}</strong> — continue from workflow
            next step <strong>{nextRail}</strong>.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
