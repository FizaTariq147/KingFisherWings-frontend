import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAirJobWorkflow, useAirUldRequests } from '../hooks/useAirJobWorkflow';

interface AirJobWorkflowPanelProps {
  jobId: string;
  jobType: string;
}

export function AirJobWorkflowPanel({ jobId, jobType }: AirJobWorkflowPanelProps) {
  const isExport = jobType === 'AIR_EXPORT';
  const isImport = jobType === 'AIR_IMPORT';
  const { data: requests = [], isLoading, isError, error, refetch } = useAirUldRequests(
    jobId,
    isExport,
  );
  const actions = useAirJobWorkflow(jobId);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [palletTypeId, setPalletTypeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setActionError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      if (isExport) await refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Air commercial workflow</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <p className="text-sm text-[var(--color-neutral-500)]">
            Shared path: CS triage → quote sent → booking form (Ops) → send invoice.
          </p>
          {actionError ? (
            <p className="text-sm text-[var(--color-danger-600)]">{actionError}</p>
          ) : null}
          {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={actions.csTriage.isPending}
              onClick={() =>
                run(() => actions.csTriage.mutateAsync({}), 'CS triage recorded.')
              }
            >
              CS triage
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.markQuoteSent.isPending}
              onClick={() =>
                run(() => actions.markQuoteSent.mutateAsync({}), 'Quote marked as sent.')
              }
            >
              Mark quote sent
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.sendInvoice.isPending}
              onClick={() => run(() => actions.sendInvoice.mutateAsync({}), 'Invoice sent.')}
            >
              Send invoice
            </Button>
          </div>
        </div>
      </Card>

      {isExport ? (
        <Card>
          <CardHeader>
            <CardTitle>ULD requests (export)</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Air pallet type ID"
                value={palletTypeId}
                onChange={(e) => setPalletTypeId(e.target.value)}
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
              disabled={actions.createUldRequest.isPending}
              onClick={() =>
                run(async () => {
                  await actions.createUldRequest.mutateAsync({
                    ...(palletTypeId.trim()
                      ? { air_pallet_type_id: palletTypeId.trim() }
                      : {}),
                    ...(quantity.trim() ? { quantity: Number(quantity) } : {}),
                    ...(notes.trim() ? { notes: notes.trim() } : {}),
                  });
                  setNotes('');
                }, 'ULD request created.')
              }
            >
              Create ULD request
            </Button>

            {isLoading ? (
              <p className="text-sm text-[var(--color-neutral-400)]">Loading ULD requests…</p>
            ) : null}
            {isError ? (
              <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
            ) : null}
            {!isLoading && requests.length === 0 ? (
              <p className="text-sm text-[var(--color-neutral-400)]">No ULD requests yet.</p>
            ) : null}

            <ul className="space-y-2">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {req.air_pallet_type_code || req.air_pallet_type_id || 'ULD request'}
                      {req.quantity != null ? ` × ${req.quantity}` : ''}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      {[req.status, req.uld_number].filter(Boolean).join(' · ') ||
                        req.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={actions.issueUldRequest.isPending}
                      onClick={() =>
                        run(
                          () => actions.issueUldRequest.mutateAsync({ requestId: req.id }),
                          'ULD request issued.',
                        )
                      }
                    >
                      Issue ULD
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={actions.allocateUldRequest.isPending}
                      onClick={() =>
                        run(
                          () => actions.allocateUldRequest.mutateAsync({ requestId: req.id }),
                          'ULD allocated.',
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
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isImport ? 'Import ops stages' : 'Export ops stages'}</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {isExport ? (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={actions.stageBuildUp.isPending}
                onClick={() =>
                  run(() => actions.stageBuildUp.mutateAsync({}), 'Build-up stage recorded.')
                }
              >
                Mark build-up
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={actions.stageMawbIssued.isPending}
                onClick={() =>
                  run(() => actions.stageMawbIssued.mutateAsync({}), 'MAWB issued recorded.')
                }
              >
                MAWB issued
              </Button>
            </>
          ) : null}
          {isImport ? (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={actions.stageMawbReceived.isPending}
                onClick={() =>
                  run(
                    () => actions.stageMawbReceived.mutateAsync({}),
                    'MAWB received recorded.',
                  )
                }
              >
                MAWB received
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={actions.stagePod.isPending}
                onClick={() => run(() => actions.stagePod.mutateAsync({}), 'POD stage recorded.')}
              >
                POD received
              </Button>
            </>
          ) : null}
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
            onClick={() =>
              run(() => actions.closeReport.mutateAsync({}), 'Close report generated.')
            }
          >
            Close report
          </Button>
        </div>
      </Card>
    </div>
  );
}
