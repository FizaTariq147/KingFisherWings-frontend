import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
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
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [containerTypeId, setContainerTypeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setActionError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      await refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-neutral-500)]">
        Sea export ops: container requests (CRO / allocate) → loading → payment → close report.
        Gated HBL lives on the Documents generators below.
      </p>

      {actionError ? <p className="text-sm text-[var(--color-danger-600)]">{actionError}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Container requests</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              placeholder="Container type ID"
              value={containerTypeId}
              onChange={(e) => setContainerTypeId(e.target.value)}
            />
            <Input
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button
            type="button"
            disabled={actions.createContainerRequest.isPending}
            onClick={() =>
              run(async () => {
                await actions.createContainerRequest.mutateAsync({
                  ...(containerTypeId.trim() ? { container_type_id: containerTypeId.trim() } : {}),
                  ...(quantity.trim() ? { quantity: Number(quantity) } : {}),
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
                    {req.quantity != null ? ` × ${req.quantity}` : ''}
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
                        () =>
                          actions.issueContainerRequest.mutateAsync({ requestId: req.id }),
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
                      run(
                        () =>
                          actions.allocateContainerRequest.mutateAsync({ requestId: req.id }),
                        'Container number allocated.',
                      )
                    }
                  >
                    Allocate
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ops milestones</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          <Button
            type="button"
            variant="secondary"
            disabled={actions.stageLoading.isPending}
            onClick={() => run(() => actions.stageLoading.mutateAsync({}), 'Loading stage recorded.')}
          >
            Mark loading
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={actions.confirmPayment.isPending}
            onClick={() =>
              run(() => actions.confirmPayment.mutateAsync({}), 'Payment confirmed.')
            }
          >
            Confirm payment
          </Button>
          <Button
            type="button"
            disabled={actions.closeReport.isPending}
            onClick={() => run(() => actions.closeReport.mutateAsync({}), 'Close report generated.')}
          >
            Close report
          </Button>
        </div>
      </Card>
    </div>
  );
}
