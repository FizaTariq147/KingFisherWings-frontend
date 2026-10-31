import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
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
import { useNvoccJobActions } from '../hooks/useNvoccJobs';

interface NvoccJobWorkflowPanelProps {
  jobId: string;
}

export function NvoccJobWorkflowPanel({ jobId }: NvoccJobWorkflowPanelProps) {
  const actions = useNvoccJobActions(jobId);
  const { done, markDone, isDone } = useSeaExportProgress(`job:${jobId}`);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const derived = useMemo(() => ({ ...done }), [done]);
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
