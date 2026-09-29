import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useJobSubresourceMutations } from '@/features/jobs/hooks/useJobSubresources';
import { useJobCustomsExaminations } from '@/features/jobs/hooks/useJobs';
import { CcFlowRail } from './CcFlowRail';
import {
  canRunCcStageAction,
  CC_STAGE_RESULT_STATUS,
  inferCcApiStatusFromTimestamps,
  railDoneFromApiStatus,
  resolveCcApiStatus,
  statusToCcStage,
  type CcStageId,
} from '../constants/ccWorkflow';
import { useCcJobActions, useCcLinkFreight, useCcStatus } from '../hooks/useCustomsClearance';
import type { CcStatus } from '../types/customsClearance.types';

interface CcJobWorkflowPanelProps {
  jobId: string;
}

function isCcStatus(value: unknown): value is CcStatus {
  return Boolean(value && typeof value === 'object' && 'job_id' in (value as object));
}

export function CcJobWorkflowPanel({ jobId }: CcJobWorkflowPanelProps) {
  const statusQuery = useCcStatus(jobId);
  const linkFreight = useCcLinkFreight(jobId);
  const actions = useCcJobActions(jobId);
  const exams = useJobCustomsExaminations(jobId, true);
  const jobMutations = useJobSubresourceMutations(jobId);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [examNotes, setExamNotes] = useState('');
  const [freightJobId, setFreightJobId] = useState('');
  /** Optimistic override from last successful stage response until refetch settles. */
  const [statusOverride, setStatusOverride] = useState<CcStatus | null>(null);

  const live = statusOverride ?? statusQuery.data;
  const apiStatus = resolveCcApiStatus(
    live?.stage,
    live?.status,
    inferCcApiStatusFromTimestamps(live),
  );
  const currentStage: CcStageId = statusToCcStage(apiStatus);
  const derived = useMemo(() => {
    const map = railDoneFromApiStatus(apiStatus);
    if ((exams.data?.length ?? 0) > 0) map.exam = true;
    return map;
  }, [apiStatus, exams.data]);

  const runStage = async (
    stageId: CcStageId,
    fn: () => Promise<unknown>,
    success: string,
  ) => {
    setActionError(null);
    setMessage(null);
    try {
      // Re-read latest status so we never POST a stage the API has already passed.
      const fresh = await statusQuery.refetch();
      const freshStatus = resolveCcApiStatus(
        fresh.data?.stage,
        fresh.data?.status,
        inferCcApiStatusFromTimestamps(fresh.data),
      );
      setStatusOverride(null);
      if (!canRunCcStageAction(freshStatus, stageId)) {
        const next = statusToCcStage(freshStatus);
        setMessage(
          `Already at ${freshStatus || 'current status'} — next step is ${next}.`,
        );
        return;
      }
      const result = await fn();
      if (isCcStatus(result)) {
        setStatusOverride(result);
      }
      setMessage(success);
      await statusQuery.refetch();
      setStatusOverride(null);
    } catch (err) {
      const detail = getErrorMessage(err);
      if (/not forward/i.test(detail)) {
        const fresh = await statusQuery.refetch();
        const resolved = resolveCcApiStatus(
          fresh.data?.stage,
          fresh.data?.status,
          inferCcApiStatusFromTimestamps(fresh.data),
        );
        setStatusOverride(null);
        setActionError(
          `${detail} Current API status: ${resolved || 'unknown'}. Next: ${statusToCcStage(resolved)}.`,
        );
        return;
      }
      setActionError(detail);
    }
  };

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setActionError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      await statusQuery.refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const stageLabel = CC_STAGE_RESULT_STATUS[currentStage]
    ? `${currentStage} → ${CC_STAGE_RESULT_STATUS[currentStage]}`
    : currentStage;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customs Clearance workflow</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <CcFlowRail current={currentStage} done={derived} />
          <p className="text-sm text-[var(--color-neutral-500)]">
            Driven by live <code className="text-[10px]">GET /jobs/:id/cc/status</code>. Stages
            only move forward; completed actions are not re-posted.
          </p>
          {statusQuery.isLoading ? (
            <p className="text-xs text-[var(--color-neutral-400)]">Loading CC status…</p>
          ) : null}
          {apiStatus ? (
            <p className="text-xs text-[var(--color-neutral-500)]">
              API status: <strong>{apiStatus}</strong> · next action:{' '}
              <strong>{stageLabel}</strong>
            </p>
          ) : (
            <p className="text-xs text-[var(--color-neutral-500)]">
              No status yet · next action: <strong>{currentStage}</strong>
            </p>
          )}
          {apiStatus === 'QUERY' ? (
            <p className="rounded-md border border-[var(--color-warning-200)] bg-[var(--color-warning-50)] px-3 py-2 text-sm text-[var(--color-neutral-800)]">
              Status is <strong>QUERY</strong>. Close all open queries (Queries tab), then run
              assess.
            </p>
          ) : null}
          {actionError ? (
            <p className="text-sm text-[var(--color-danger-600)]">{actionError}</p>
          ) : null}
          {message ? (
            <p className="text-sm text-[var(--color-success-700)]">{message}</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Now: {currentStage}</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {currentStage === 'open' && canRunCcStageAction(apiStatus, 'open') ? (
            <Button
              type="button"
              disabled={actions.open.isPending}
              onClick={() =>
                void runStage('open', () => actions.open.mutateAsync({}), 'CC opened.')
              }
            >
              Open CC
            </Button>
          ) : null}

          {currentStage === 'docs' && canRunCcStageAction(apiStatus, 'docs') ? (
            <Button
              type="button"
              disabled={actions.stageDocsComplete.isPending}
              onClick={() =>
                void runStage(
                  'docs',
                  () => actions.stageDocsComplete.mutateAsync({}),
                  'Docs marked complete.',
                )
              }
            >
              Stage: docs complete
            </Button>
          ) : null}

          {currentStage === 'classify' && canRunCcStageAction(apiStatus, 'classify') ? (
            <Button
              type="button"
              disabled={actions.stageClassify.isPending}
              onClick={() =>
                void runStage(
                  'classify',
                  () => actions.stageClassify.mutateAsync({}),
                  'Classify stage done.',
                )
              }
            >
              Stage: classify
            </Button>
          ) : null}

          {currentStage === 'file' && canRunCcStageAction(apiStatus, 'file') ? (
            <Button
              type="button"
              disabled={actions.stageFile.isPending}
              onClick={() =>
                void runStage('file', () => actions.stageFile.mutateAsync({}), 'Filed.')
              }
            >
              Stage: file
            </Button>
          ) : null}

          {currentStage === 'assess' && canRunCcStageAction(apiStatus, 'assess') ? (
            <Button
              type="button"
              disabled={actions.stageAssess.isPending}
              onClick={() =>
                void runStage(
                  'assess',
                  () => actions.stageAssess.mutateAsync({}),
                  'Assessment recorded.',
                )
              }
            >
              Stage: assess
            </Button>
          ) : null}

          {currentStage === 'duty' && canRunCcStageAction(apiStatus, 'duty') ? (
            <>
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
                  void runStage(
                    'duty',
                    () => actions.stageDutyPaid.mutateAsync({ paid_by_client: false }),
                    'Duty marked paid.',
                  )
                }
              >
                Stage: duty paid
              </Button>
            </>
          ) : null}

          {currentStage === 'exam' ? (
            <>
              <Input
                className="max-w-xs"
                placeholder="Exam notes (optional)"
                value={examNotes}
                onChange={(e) => setExamNotes(e.target.value)}
              />
              <Button
                type="button"
                disabled={jobMutations.createCustomsExamination.isPending}
                onClick={() =>
                  void run(async () => {
                    await jobMutations.createCustomsExamination.mutateAsync({
                      examination_date: new Date().toISOString().slice(0, 10),
                      result: 'RELEASED',
                      remarks: examNotes.trim() || undefined,
                    });
                    await exams.refetch();
                  }, 'Examination recorded.')
                }
              >
                Record exam (optional)
              </Button>
              {canRunCcStageAction(apiStatus, 'clear') ? (
                <Button
                  type="button"
                  disabled={actions.stageClear.isPending}
                  onClick={() =>
                    void runStage(
                      'clear',
                      () => actions.stageClear.mutateAsync({}),
                      'Cleared (exam skipped).',
                    )
                  }
                >
                  Skip exam → Clear
                </Button>
              ) : null}
            </>
          ) : null}

          {currentStage === 'clear' && canRunCcStageAction(apiStatus, 'clear') ? (
            <Button
              type="button"
              disabled={actions.stageClear.isPending}
              onClick={() =>
                void runStage('clear', () => actions.stageClear.mutateAsync({}), 'Cleared.')
              }
            >
              Stage: clear
            </Button>
          ) : null}

          {currentStage === 'release' && canRunCcStageAction(apiStatus, 'release') ? (
            <Button
              type="button"
              disabled={actions.stageRelease.isPending}
              onClick={() =>
                void runStage(
                  'release',
                  () => actions.stageRelease.mutateAsync({}),
                  'Released.',
                )
              }
            >
              Stage: release
            </Button>
          ) : null}

          {currentStage === 'invoice' && canRunCcStageAction(apiStatus, 'invoice') ? (
            <Button
              type="button"
              disabled={actions.stageInvoiceReady.isPending}
              onClick={() =>
                void runStage(
                  'invoice',
                  () => actions.stageInvoiceReady.mutateAsync({}),
                  'Invoice ready — use Invoices tab to create from job.',
                )
              }
            >
              Stage: invoice ready
            </Button>
          ) : null}

          {currentStage === 'close' && canRunCcStageAction(apiStatus, 'close') ? (
            <Button
              type="button"
              disabled={actions.stageClose.isPending}
              onClick={() =>
                void runStage('close', () => actions.stageClose.mutateAsync({}), 'CC closed.')
              }
            >
              Stage: close
            </Button>
          ) : null}

          {currentStage === 'close' && !canRunCcStageAction(apiStatus, 'close') ? (
            <p className="text-sm text-[var(--color-success-700)]">CC workflow complete.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link freight job</CardTitle>
        </CardHeader>
        <div className="space-y-2 px-4 pb-4">
          {linkFreight.data?.freight_job_id ? (
            <p className="text-sm text-[var(--color-neutral-600)]">
              Linked: <span className="font-mono">{linkFreight.data.freight_job_id}</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--color-neutral-400)]">No freight job linked.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[220px] flex-1"
              placeholder="Freight job UUID"
              value={freightJobId}
              onChange={(e) => setFreightJobId(e.target.value)}
            />
            <Button
              type="button"
              disabled={actions.linkFreight.isPending || !freightJobId.trim()}
              onClick={() =>
                void run(
                  () =>
                    actions.linkFreight.mutateAsync({ freight_job_id: freightJobId.trim() }),
                  'Freight job linked.',
                ).then(() => {
                  void linkFreight.refetch();
                  setFreightJobId('');
                })
              }
            >
              Link freight
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.unlinkFreight.isPending || !linkFreight.data?.freight_job_id}
              onClick={() =>
                void run(() => actions.unlinkFreight.mutateAsync(), 'Freight link removed.').then(
                  () => void linkFreight.refetch(),
                )
              }
            >
              Unlink
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
