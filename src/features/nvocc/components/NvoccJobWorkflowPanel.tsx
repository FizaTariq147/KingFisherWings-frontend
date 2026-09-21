import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { NvoccSeaExportFlowRail } from './NvoccSeaExportFlowRail';
import {
  SEA_EXPORT_JOB_ACTION_ORDER,
  type SeaExportStageId,
} from '../constants/seaExportWorkflow';
import {
  firstOpenStage,
  useSeaExportProgress,
} from '../hooks/useSeaExportProgress';
import {
  useNvoccContainerRequests,
  useNvoccJobActions,
} from '../hooks/useNvoccJobs';

interface NvoccJobWorkflowPanelProps {
  jobId: string;
}

export function NvoccJobWorkflowPanel({ jobId }: NvoccJobWorkflowPanelProps) {
  const { data: requests = [], isLoading, isError, error, refetch } = useNvoccContainerRequests(jobId);
  const actions = useNvoccJobActions(jobId);
  const { done, markDone, isDone } = useSeaExportProgress(`job:${jobId}`);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [containerTypeId, setContainerTypeId] = useState('');
  const [containerCount, setContainerCount] = useState('1');
  const [notes, setNotes] = useState('');

  const hasCro = requests.some((r) => Boolean(r.cro_number));
  const hasContainer = requests.some((r) => Boolean(r.container_number));

  const derived = useMemo(() => {
    const map: Partial<Record<SeaExportStageId, boolean>> = { ...done };
    if (hasCro && hasContainer) map['cro-container'] = true;
    return map;
  }, [done, hasCro, hasContainer]);

  const currentStage = firstOpenStage(SEA_EXPORT_JOB_ACTION_ORDER, isDone, derived);

  const run = async (
    fn: () => Promise<unknown>,
    success: string,
    complete?: SeaExportStageId,
  ) => {
    setActionError(null);
    setMessage(null);
    try {
      await fn();
      if (complete) markDone(complete);
      setMessage(success);
      await refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Stage 3–4 · Pickup, loading & delivery</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <NvoccSeaExportFlowRail current={currentStage} done={derived} band="3-4" />
          <p className="text-sm text-[var(--color-neutral-500)]">
            Staff actions unlock in flowchart order. Portal steps (pick / port token / draft BL
            request) are done by the customer; mark them done here after they complete, then
            continue.
          </p>
          {actionError ? <p className="text-sm text-[var(--color-danger-600)]">{actionError}</p> : null}
          {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
        </div>
      </Card>

      {currentStage === 'cro-container' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: CRO + container number</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Container type ID"
                value={containerTypeId}
                onChange={(e) => setContainerTypeId(e.target.value)}
              />
              <Input
                type="number"
                min={1}
                max={100}
                step={1}
                placeholder="Container count (1–100)"
                value={containerCount}
                onChange={(e) => setContainerCount(e.target.value)}
              />
              <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button
              type="button"
              disabled={actions.createContainerRequest.isPending}
              onClick={() =>
                run(async () => {
                  const n = Number(containerCount);
                  const count = Number.isFinite(n)
                    ? Math.min(100, Math.max(1, Math.trunc(n)))
                    : 1;
                  await actions.createContainerRequest.mutateAsync({
                    ...(containerTypeId.trim()
                      ? { container_type_id: containerTypeId.trim() }
                      : {}),
                    container_count: count,
                    ...(notes.trim() ? { notes: notes.trim() } : {}),
                  });
                  setNotes('');
                }, 'Container request created.')
              }
            >
              Create request
            </Button>

            {isLoading ? (
              <p className="text-sm text-[var(--color-neutral-400)]">Loading requests…</p>
            ) : null}
            {isError ? (
              <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
            ) : null}
            {!isLoading && requests.length === 0 ? (
              <p className="text-sm text-[var(--color-neutral-400)]">No container requests yet.</p>
            ) : null}

            <ul className="space-y-2">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {req.container_type_code || req.container_type_id || 'Container request'}
                      {(req.container_count ?? req.quantity) != null
                        ? ` × ${req.container_count ?? req.quantity}`
                        : ''}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      {[req.status, req.cro_number && `CRO ${req.cro_number}`, req.container_number]
                        .filter(Boolean)
                        .join(' · ') || req.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={actions.issueContainerRequest.isPending}
                      onClick={() =>
                        run(
                          () => actions.issueContainerRequest.mutateAsync({ requestId: req.id }),
                          'CRO issued.',
                        )
                      }
                    >
                      Issue CRO
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={actions.allocateContainerRequest.isPending}
                      onClick={() =>
                        run(async () => {
                          await actions.allocateContainerRequest.mutateAsync({ requestId: req.id });
                          markDone('cro-container');
                        }, 'Container allocated — next: customer pick (portal).')
                      }
                    >
                      Allocate
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            {hasCro && hasContainer ? (
              <Button type="button" variant="secondary" onClick={() => markDone('cro-container')}>
                CRO + container done — continue
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {currentStage === 'pick' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: Customer picks up container</CardTitle>
          </CardHeader>
          <div className="space-y-2 px-4 pb-4">
            <p className="text-sm text-[var(--color-neutral-500)]">
              Portal: confirm pick → tracking status <strong>Picked</strong>.
            </p>
            <Button type="button" onClick={() => markDone('pick')}>
              Mark pick confirmed (portal done)
            </Button>
          </div>
        </Card>
      ) : null}

      {currentStage === 'loading' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: Loading (Operations)</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            <Button
              type="button"
              disabled={actions.stageLoading.isPending}
              onClick={() =>
                run(() => actions.stageLoading.mutateAsync({}), 'Loading recorded.', 'loading')
              }
            >
              Mark loading
            </Button>
          </div>
        </Card>
      ) : null}

      {currentStage === 'port-token' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: Customer at port (token)</CardTitle>
          </CardHeader>
          <div className="space-y-2 px-4 pb-4">
            <p className="text-sm text-[var(--color-neutral-500)]">
              Portal: confirm port token.
            </p>
            <Button type="button" onClick={() => markDone('port-token')}>
              Mark port token confirmed
            </Button>
          </div>
        </Card>
      ) : null}

      {currentStage === 'draft-bl' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: Draft BL (Documents)</CardTitle>
          </CardHeader>
          <div className="space-y-2 px-4 pb-4">
            <p className="text-sm text-[var(--color-neutral-500)]">
              Portal requests draft BL, then Documents → <strong>HBL draft (gated)</strong>.
            </p>
            <Button type="button" onClick={() => markDone('draft-bl')}>
              Mark draft BL issued
            </Button>
          </div>
        </Card>
      ) : null}

      {currentStage === 'payment' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: Payment received (Accounts)</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            <Button
              type="button"
              disabled={actions.confirmPayment.isPending}
              onClick={() =>
                run(
                  () => actions.confirmPayment.mutateAsync({}),
                  'Payment confirmed.',
                  'payment',
                )
              }
            >
              Confirm payment
            </Button>
          </div>
        </Card>
      ) : null}

      {currentStage === 'original-bl' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: Original BL (Documents)</CardTitle>
          </CardHeader>
          <div className="space-y-2 px-4 pb-4">
            <p className="text-sm text-[var(--color-neutral-500)]">
              Documents → <strong>HBL original (gated)</strong>.
            </p>
            <Button type="button" onClick={() => markDone('original-bl')}>
              Mark original BL issued
            </Button>
          </div>
        </Card>
      ) : null}

      {currentStage === 'report' ? (
        <Card>
          <CardHeader>
            <CardTitle>Now: Report generated (Mgmt)</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            <Button
              type="button"
              disabled={actions.closeReport.isPending}
              onClick={() =>
                run(() => actions.closeReport.mutateAsync({}), 'Close report generated.', 'report')
              }
            >
              Close report
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
