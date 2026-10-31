import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SectionAttachmentsPanel } from '@/features/shared/section-attachments';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { ApiDataView } from '../ApiDataView';
import { jobService } from '../../services/job.service';
import { jobKeys } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { DeliveryAcknowledgement } from '../../types/job.types';

function statusVariant(
  status: string,
): 'neutral' | 'warning' | 'info' | 'success' {
  const s = status.toUpperCase();
  if (s === 'RECEIVED_BY_ADMIN') return 'success';
  if (s === 'SUBMITTED') return 'info';
  if (s === 'DRAFT') return 'warning';
  return 'neutral';
}

interface JobAcknowledgementPanelProps {
  jobId: string;
}

/** Admin delivery acknowledgement — GET detail/acknowledgement + receive + optional PDF. */
export function JobAcknowledgementPanel({ jobId }: JobAcknowledgementPanelProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [...jobKeys.all, 'acknowledgement', jobId] as const,
    queryFn: () => jobService.getAcknowledgement(jobId),
    enabled: Boolean(accessToken) && isUuid(jobId),
  });

  const receive = useMutation({
    mutationFn: () => jobService.receiveAcknowledgement(jobId),
    onSuccess: (data) => {
      qc.setQueryData([...jobKeys.all, 'acknowledgement', jobId], data);
      void qc.invalidateQueries({ queryKey: [...jobKeys.all, 'acknowledgement', jobId] });
    },
  });

  const generatePdf = useMutation({
    mutationFn: () => jobService.generateAcknowledgementPdf(jobId),
  });

  const ack: DeliveryAcknowledgement | undefined = query.data;
  const status = (ack?.status || 'DRAFT').toUpperCase();
  const canReceive = status === 'SUBMITTED';

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Delivery acknowledgement
          {ack ? (
            <Badge variant={statusVariant(status)}>{status.replaceAll('_', ' ')}</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <div className="px-4 pb-4 space-y-3 text-sm">
        {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
        {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
        {query.isLoading ? (
          <p className="text-[var(--color-neutral-400)]">Loading acknowledgement…</p>
        ) : null}
        {query.isError ? (
          <p className="text-[var(--color-neutral-500)]">
            No acknowledgement yet — customer submits from the portal when goods are delivered.
          </p>
        ) : null}
        {ack ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Receiver" value={ack.receiver_name} />
            <Field label="Title" value={ack.receiver_title} />
            <Field label="Goods condition" value={ack.goods_condition} />
            <Field label="Acknowledged at" value={ack.acknowledged_at} />
            <Field label="Delivery date" value={ack.actual_delivery_date} />
            <Field label="Received at" value={ack.received_at} />
            {ack.remarks ? (
              <div className="sm:col-span-2">
                <Field label="Remarks" value={ack.remarks} />
              </div>
            ) : null}
            {ack.signature_url || ack.signature_s3_key ? (
              <p className="sm:col-span-2 text-xs text-[var(--color-neutral-500)]">
                Signature on file
                {ack.signature_url ? (
                  <>
                    {' '}
                    ·{' '}
                    <a
                      className="text-[var(--color-primary)] underline"
                      href={ack.signature_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
            {ack.template_snapshot ? (
              <div className="sm:col-span-2 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                  Template
                </p>
                <ApiDataView
                  data={ack.template_snapshot}
                  emptyLabel="No template fields returned."
                  maxHeightClass="max-h-80"
                />
              </div>
            ) : null}
          </div>
        ) : null}
        <SectionAttachmentsPanel
          entity="jobs"
          entityId={jobId}
          section="acknowledgement"
          recordId={ack?.id}
          title="Acknowledgement attachments"
          compact
        />
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            disabled={!canReceive || receive.isPending}
            onClick={() =>
              void run(() => receive.mutateAsync(), 'Acknowledgement marked received.')
            }
          >
            {receive.isPending ? 'Saving…' : 'Mark received'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={generatePdf.isPending || !ack || status === 'DRAFT'}
            onClick={() =>
              void run(
                () => generatePdf.mutateAsync(),
                'Proof of delivery PDF queued (visible to customer).',
              )
            }
          >
            {generatePdf.isPending ? 'Generating…' : 'Generate POD PDF'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
        {label}
      </span>
      <Input readOnly value={value?.trim() || '—'} className="bg-[var(--color-neutral-50)]" />
    </label>
  );
}
