import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useJobSubresourceMutations } from '@/features/jobs/hooks/useJobSubresources';
import { useJobCustomsExaminations } from '@/features/jobs/hooks/useJobs';
import { CcFlowRail } from './CcFlowRail';
import {
  CC_STAGE_ACTION_ORDER,
  firstOpenCcStage,
  statusToCcStage,
  type CcStageId,
} from '../constants/ccWorkflow';
import { useCcJobActions, useCcStatus } from '../hooks/useCustomsClearance';

interface CcJobWorkflowPanelProps {
  jobId: string;
}

export function CcJobWorkflowPanel({ jobId }: CcJobWorkflowPanelProps) {
  const statusQuery = useCcStatus(jobId);
  const actions = useCcJobActions(jobId);
  const exams = useJobCustomsExaminations(jobId, true);
  const jobMutations = useJobSubresourceMutations(jobId);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [examNotes, setExamNotes] = useState('');
  const [freightJobId, setFreightJobId] = useState('');

  const derived = useMemo(() => {
    const map: Partial<Record<CcStageId, boolean>> = {};
    const st = statusQuery.data;
    if (!st) return map;
    if (st.opened_at) map.open = true;
    if (st.docs_complete_at) {
      map.open = true;
      map.docs = true;
    }
    if (st.classified_at) {
      map.open = true;
      map.docs = true;
      map.classify = true;
    }
    if (st.filed_at) {
      map.open = true;
      map.docs = true;
      map.classify = true;
      map.file = true;
    }
    if (st.assessed_at) {
      map.open = true;
      map.docs = true;
      map.classify = true;
      map.file = true;
      map.assess = true;
    }
    if (st.duty_paid_at) {
      map.open = true;
      map.docs = true;
      map.classify = true;
      map.file = true;
      map.assess = true;
      map.duty = true;
      map.exam = true;
    }
    if (st.cleared_at) {
      map.open = true;
      map.docs = true;
      map.classify = true;
      map.file = true;
      map.assess = true;
      map.duty = true;
      map.exam = true;
      map.clear = true;
    }
    if (st.released_at) {
      Object.assign(map, {
        open: true,
        docs: true,
        classify: true,
        file: true,
        assess: true,
        duty: true,
        exam: true,
        clear: true,
        release: true,
      });
    }
    if (st.invoice_ready_at) {
      Object.assign(map, {
        open: true,
        docs: true,
        classify: true,
        file: true,
        assess: true,
        duty: true,
        exam: true,
        clear: true,
        release: true,
        invoice: true,
      });
    }
    if (st.closed_at) {
      for (const id of CC_STAGE_ACTION_ORDER) map[id] = true;
    }
    if ((exams.data?.length ?? 0) > 0) map.exam = true;
    return map;
  }, [statusQuery.data, exams.data]);

  const currentStage = firstOpenCcStage(CC_STAGE_ACTION_ORDER, (id) => Boolean(derived[id]), {
    ...derived,
    [statusToCcStage(statusQuery.data?.stage ?? statusQuery.data?.status)]:
      derived[statusToCcStage(statusQuery.data?.stage ?? statusQuery.data?.status)],
  });

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customs Clearance workflow</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <CcFlowRail current={currentStage} done={derived} />
          <p className="text-sm text-[var(--color-neutral-500)]">
            Happy path: open → docs → classify → file → assess → duty → exam (optional) → clear →
            release → invoice → close. Use the CC tabs for lines, checklist, declaration, and
            queries.
          </p>
          {statusQuery.isLoading ? (
            <p className="text-xs text-[var(--color-neutral-400)]">Loading CC status…</p>
          ) : null}
          {statusQuery.data?.stage || statusQuery.data?.status ? (
            <p className="text-xs text-[var(--color-neutral-500)]">
              API stage/status:{' '}
              <strong>{statusQuery.data.stage || statusQuery.data.status}</strong>
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
          {currentStage === 'open' ? (
            <Button
              type="button"
              disabled={actions.open.isPending}
              onClick={() => void run(() => actions.open.mutateAsync({}), 'CC opened.')}
            >
              Open CC
            </Button>
          ) : null}
          {currentStage === 'docs' ? (
            <Button
              type="button"
              disabled={actions.stageDocsComplete.isPending}
              onClick={() =>
                void run(
                  () => actions.stageDocsComplete.mutateAsync({}),
                  'Docs marked complete.',
                )
              }
            >
              Stage: docs complete
            </Button>
          ) : null}
          {currentStage === 'classify' ? (
            <Button
              type="button"
              disabled={actions.stageClassify.isPending}
              onClick={() =>
                void run(() => actions.stageClassify.mutateAsync({}), 'Classify stage done.')
              }
            >
              Stage: classify
            </Button>
          ) : null}
          {currentStage === 'file' ? (
            <Button
              type="button"
              disabled={actions.stageFile.isPending}
              onClick={() => void run(() => actions.stageFile.mutateAsync({}), 'Filed.')}
            >
              Stage: file
            </Button>
          ) : null}
          {currentStage === 'assess' ? (
            <Button
              type="button"
              disabled={actions.stageAssess.isPending}
              onClick={() =>
                void run(() => actions.stageAssess.mutateAsync({}), 'Assessment recorded.')
              }
            >
              Stage: assess
            </Button>
          ) : null}
          {currentStage === 'duty' ? (
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
                  void run(() => actions.stageDutyPaid.mutateAsync({}), 'Duty marked paid.')
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
              <Button
                type="button"
                disabled={actions.stageClear.isPending}
                onClick={() =>
                  void run(
                    () => actions.stageClear.mutateAsync({}),
                    'Cleared (exam skipped).',
                  )
                }
              >
                Skip exam → Clear
              </Button>
            </>
          ) : null}
          {currentStage === 'clear' ? (
            <Button
              type="button"
              disabled={actions.stageClear.isPending}
              onClick={() => void run(() => actions.stageClear.mutateAsync({}), 'Cleared.')}
            >
              Stage: clear
            </Button>
          ) : null}
          {currentStage === 'release' ? (
            <Button
              type="button"
              disabled={actions.stageRelease.isPending}
              onClick={() => void run(() => actions.stageRelease.mutateAsync({}), 'Released.')}
            >
              Stage: release
            </Button>
          ) : null}
          {currentStage === 'invoice' ? (
            <Button
              type="button"
              disabled={actions.stageInvoiceReady.isPending}
              onClick={() =>
                void run(
                  () => actions.stageInvoiceReady.mutateAsync({}),
                  'Invoice ready — use Invoices tab to create from job.',
                )
              }
            >
              Stage: invoice ready
            </Button>
          ) : null}
          {currentStage === 'close' ? (
            <Button
              type="button"
              disabled={actions.stageClose.isPending}
              onClick={() => void run(() => actions.stageClose.mutateAsync({}), 'CC closed.')}
            >
              Stage: close
            </Button>
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link freight job</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2 px-4 pb-4">
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
              )
            }
          >
            Link freight
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={actions.unlinkFreight.isPending}
            onClick={() =>
              void run(() => actions.unlinkFreight.mutateAsync(), 'Freight link removed.')
            }
          >
            Unlink
          </Button>
        </div>
      </Card>
    </div>
  );
}
