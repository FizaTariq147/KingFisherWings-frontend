import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { usePortalQuotationNegotiation, usePortalQuotationCounterOffer } from '../hooks/usePortalQuotations';
import { canPortalCustomerCounterOffer } from '../utils/portalQuotationStatus';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';
import { Badge } from '@/components/ui/Badge';

interface PortalQuotationNegotiationPanelProps {
  quote: PortalQuotationDetail;
  onSuccess?: (message: string) => void;
}

export function PortalQuotationNegotiationPanel({
  quote,
  onSuccess,
}: PortalQuotationNegotiationPanelProps) {
  const showTimeline =
    canPortalCustomerCounterOffer(quote.status) ||
    (quote.negotiationRound != null && quote.negotiationRound > 0);
  const { data: timeline, isLoading } = usePortalQuotationNegotiation(quote.id, showTimeline);
  const counterOffer = usePortalQuotationCounterOffer();
  const [message, setMessage] = useState('');
  const [proposedTotal, setProposedTotal] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canCounter = canPortalCustomerCounterOffer(quote.status);

  if (!showTimeline && !canCounter) return null;

  return (
    <PortalPanel padded className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Negotiation</h2>
        {quote.negotiationRound != null ? (
          <p className="text-xs text-[var(--color-neutral-500)]">Round {quote.negotiationRound}</p>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading timeline…</p>
      ) : timeline?.events.length ? (
        <div className="space-y-2">
          {timeline.events.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-[var(--color-neutral-100)] px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{(event.eventType || 'Event').replaceAll('_', ' ')}</span>
                {event.status ? (
                  <Badge variant="neutral" dot={false}>
                    {event.status.replaceAll('_', ' ')}
                  </Badge>
                ) : null}
              </div>
              {event.message ? <p className="mt-1 text-[var(--color-neutral-600)]">{event.message}</p> : null}
              {event.createdAt ? (
                <p className="mt-1 text-xs text-[var(--color-neutral-400)]">{event.createdAt}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-neutral-400)]">No negotiation events yet.</p>
      )}

      {canCounter ? (
        <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-4">
          <p className="text-sm font-medium">Submit counter-offer</p>
          <Input
            placeholder="Message *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Input
            placeholder="Proposed total (optional)"
            value={proposedTotal}
            onChange={(e) => setProposedTotal(e.target.value)}
          />
          {error ? <p className="text-xs text-[var(--color-danger-600)]">{error}</p> : null}
          <Button
            type="button"
            size="sm"
            disabled={!message.trim() || counterOffer.isPending}
            onClick={() => {
              setError(null);
              void counterOffer
                .mutateAsync({
                  id: quote.id,
                  dto: {
                    message: message.trim(),
                    ...(proposedTotal.trim() ? { proposed_total: Number(proposedTotal) } : {}),
                  },
                })
                .then(() => {
                  setMessage('');
                  setProposedTotal('');
                  onSuccess?.('Counter-offer submitted.');
                })
                .catch((err) =>
                  setError(err instanceof Error ? err.message : 'Could not submit counter-offer.'),
                );
            }}
          >
            {counterOffer.isPending ? 'Submitting…' : 'Submit counter-offer'}
          </Button>
        </div>
      ) : null}
    </PortalPanel>
  );
}
