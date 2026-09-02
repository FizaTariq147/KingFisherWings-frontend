import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import {
  useQuotationNegotiation,
  useQuotationNegotiationActions,
} from '../hooks/useQuotationNegotiation';

interface QuotationNegotiationPanelProps {
  quotationId: string;
  status: string;
  onUpdated?: () => void;
}

export function QuotationNegotiationPanel({
  quotationId,
  status,
  onUpdated,
}: QuotationNegotiationPanelProps) {
  const { hasPermission } = useAuth();
  const canNegotiate = hasPermission('quotations.negotiate');
  const normalizedStatus = status.toUpperCase();
  const showPanel =
    normalizedStatus === 'NEGOTIATING' ||
    normalizedStatus === 'CUSTOMER_REVIEW' ||
    normalizedStatus === 'SENT' ||
    normalizedStatus === 'APPROVED';

  const { data: timeline, isLoading } = useQuotationNegotiation(quotationId, showPanel);
  const actions = useQuotationNegotiationActions(quotationId);
  const [reviseMessage, setReviseMessage] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const [terminalReject, setTerminalReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  if (!showPanel) return null;

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}

      {timeline?.round != null ? (
        <p className="text-sm text-[var(--color-neutral-600)]">
          Negotiation round: <strong>{timeline.round}</strong>
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading negotiation timeline…</p>
      ) : !timeline?.events.length ? (
        <p className="text-sm text-[var(--color-neutral-400)]">No negotiation events yet.</p>
      ) : (
        <div className="space-y-2">
          {timeline.events.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {(event.eventType || 'Event').replaceAll('_', ' ')}
                  {event.actor ? ` · ${event.actor}` : ''}
                </span>
                {event.status ? (
                  <Badge variant="neutral" dot={false}>
                    {event.status.replaceAll('_', ' ')}
                  </Badge>
                ) : null}
              </div>
              {event.message ? (
                <p className="text-[var(--color-neutral-600)] mt-1">{event.message}</p>
              ) : null}
              {event.proposedTotal != null ? (
                <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                  Proposed total: {event.proposedTotal}
                </p>
              ) : null}
              {event.createdAt ? (
                <p className="text-xs text-[var(--color-neutral-400)] mt-1">{event.createdAt}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {canNegotiate && normalizedStatus === 'NEGOTIATING' ? (
        <div className="rounded-md border border-[var(--color-neutral-200)] p-3 space-y-3">
          <p className="text-sm font-medium">Respond to counter-offer</p>
          <Input
            placeholder="Message to customer *"
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={terminalReject}
              onChange={(e) => setTerminalReject(e.target.checked)}
            />
            Terminal reject (close negotiation)
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={actions.acceptCounterOffer.isPending}
              onClick={() =>
                void run(
                  () => actions.acceptCounterOffer.mutateAsync({}),
                  'Counter-offer accepted. Quotation marked won.',
                )
              }
            >
              Accept counter-offer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={!rejectMessage.trim() || actions.rejectCounterOffer.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.rejectCounterOffer.mutateAsync({
                      message: rejectMessage.trim(),
                      terminal: terminalReject,
                    }),
                  terminalReject ? 'Counter-offer rejected (terminal).' : 'Counter-offer rejected.',
                )
              }
            >
              Reject counter-offer
            </Button>
          </div>
        </div>
      ) : null}

      {canNegotiate && (normalizedStatus === 'APPROVED' || normalizedStatus === 'SENT') ? (
        <div className="rounded-md border border-[var(--color-neutral-200)] p-3 space-y-3">
          <p className="text-sm font-medium">Revise and send to customer</p>
          <Input
            placeholder="Message to customer *"
            value={reviseMessage}
            onChange={(e) => setReviseMessage(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={!reviseMessage.trim() || actions.reviseAndSend.isPending}
            onClick={() =>
              void run(
                () => actions.reviseAndSend.mutateAsync({ message: reviseMessage.trim() }),
                'Revised quotation sent for customer review.',
              )
            }
          >
            Revise and send
          </Button>
        </div>
      ) : null}
    </div>
  );
}
