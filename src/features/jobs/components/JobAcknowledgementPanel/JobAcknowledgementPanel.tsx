import { useMemo, useState } from 'react';
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
import { jobKeys, useJobContainers } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { DeliveryAcknowledgement } from '../../types/job.types';

function statusVariant(
  status: string,
): 'neutral' | 'warning' | 'info' | 'success' {
  const s = status.toUpperCase();
  if (s === 'RECEIVED_BY_ADMIN') return 'success';
  if (s === 'ACKNOWLEDGED_BY_CUSTOMER' || s === 'SUBMITTED') return 'info';
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
  const { data: containers = [] } = useJobContainers(jobId);

  const [containerId, setContainerId] = useState('');
  const [sendRemarks, setSendRemarks] = useState('');

  const containerOptions = useMemo(
    () =>
      containers
        .filter((c) => isUuid(c.id))
        .map((c) => ({
          value: c.id,
          label: c.container_number?.trim() || c.id.slice(0, 8).toUpperCase(),
        })),
    [containers],
  );

  const send = useMutation({
    mutationFn: () =>
      jobService.sendAcknowledgement(jobId, {
        ...(containerId.trim() ? { container_id: containerId.trim() } : {}),
        ...(sendRemarks.trim() ? { remarks: sendRemarks.trim() } : {}),
      }),
    onSuccess: (data) => {
      qc.setQueryData([...jobKeys.all, 'acknowledgement', jobId], data);
      void qc.invalidateQueries({ queryKey: [...jobKeys.all, 'acknowledgement', jobId] });
    },
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
  const canReceive =
    status === 'SUBMITTED' || status === 'ACKNOWLEDGED_BY_CUSTOMER';
  const canSend = status === 'DRAFT' || !ack;

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
        {query.isError || (!query.isLoading && !ack) ? (
          <p className="text-[var(--color-neutral-500)]">
            No acknowledgement yet — send one to the customer (they confirm receipt in the portal).
          </p>
        ) : null}
        {ack ? (
          <div className="space-y-3">
            <ul className="divide-y divide-[#e8edf2] rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white">
              {[
                { label: 'Receiver', value: ack.receiver_name },
                { label: 'Title', value: ack.receiver_title },
                { label: 'Goods condition', value: ack.goods_condition },
                { label: 'Acknowledged at', value: ack.acknowledged_at },
                { label: 'Delivery date', value: ack.actual_delivery_date },
                { label: 'Received at', value: ack.received_at },
                ...(ack.remarks
                  ? [{ label: 'Remarks', value: ack.remarks }]
                  : []),
                ...(ack.signature_url || ack.signature_s3_key
                  ? [
                      {
                        label: 'Signature',
                        value: ack.signature_url ? 'On file' : 'On file (key only)',
                        href: ack.signature_url,
                      },
                    ]
                  : []),
              ].map((row) => (
                <li
                  key={row.label}
                  className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4"
                >
                  <span className="text-[12px] font-medium text-[#64748b]">{row.label}</span>
                  <span className="break-words text-[13px] font-medium text-[#0f172a]">
                    {'href' in row && row.href ? (
                      <a
                        className="text-[var(--color-primary)] underline"
                        href={row.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {row.value?.trim() || 'View'}
                      </a>
                    ) : (
                      row.value?.trim() || '—'
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {ack.template_snapshot ? (
              <div className="space-y-1">
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
        {canSend ? (
          <div className="grid gap-3 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] p-3 sm:grid-cols-2">
            <p className="sm:col-span-2 text-[12px] text-[#64748b]">
              Send acknowledgement to the customer. Pick a container when the job has more than one.
            </p>
            {containerOptions.length > 1 ? (
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Container
                </span>
                <select
                  className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
                  value={containerId}
                  onChange={(e) => setContainerId(e.target.value)}
                >
                  <option value="">Select container…</option>
                  {containerOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <Input
              label="Remarks (optional)"
              value={sendRemarks}
              onChange={(e) => setSendRemarks(e.target.value)}
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {canSend ? (
            <Button
              type="button"
              disabled={
                send.isPending ||
                (containerOptions.length > 1 && !containerId.trim())
              }
              onClick={() =>
                void run(() => send.mutateAsync(), 'Acknowledgement sent to customer.')
              }
            >
              {send.isPending ? 'Sending…' : 'Send to customer'}
            </Button>
          ) : null}
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

