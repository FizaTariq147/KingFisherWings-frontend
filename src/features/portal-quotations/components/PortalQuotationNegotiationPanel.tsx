import { NegotiationPricingCard } from '@/features/quotations/components/NegotiationPricingCard';
import {
  getNegotiationSettlement,
  isNegotiationClosed,
  sortNegotiationEvents,
} from '@/features/quotations/utils/negotiationActions';
import { fallbackNegotiationPricing } from '@/features/quotations/utils/normalizeQuotationExtended';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import {
  usePortalQuotationNegotiation,
  usePortalQuotationCounterOffer,
} from '../hooks/usePortalQuotations';
import { canPortalCustomerCounterOffer, portalQuoteTotalAmount } from '../utils/portalQuotationStatus';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';

interface PortalQuotationNegotiationPanelProps {
  quote: PortalQuotationDetail;
  onSuccess?: (message: string) => void;
}

export function PortalQuotationNegotiationPanel({
  quote,
  onSuccess,
}: PortalQuotationNegotiationPanelProps) {
  const canCounter = canPortalCustomerCounterOffer(quote.status);
  const showTimeline =
    canCounter || (quote.negotiationRound != null && quote.negotiationRound > 0);
  const { data: timeline, isLoading, isError, error, refetch } = usePortalQuotationNegotiation(
    quote.id,
    showTimeline,
  );
  const counterOffer = usePortalQuotationCounterOffer();
  const events = useMemo(
    () => sortNegotiationEvents(timeline?.events ?? []),
    [timeline?.events],
  );
  const negotiationClosed = isNegotiationClosed(quote.status || '', events);

  const pricing = useMemo(() => {
    const fromApi = timeline?.pricing ?? quote.negotiationPricing;
    const lineTotal = quote.lines?.reduce((sum, line) => sum + (line.amount ?? 0), 0);
    const fallback = fallbackNegotiationPricing({
      currencyCode: quote.currencyCode,
      revenueTotal: fromApi?.tenantProposedTotal ?? fromApi?.revenueTotal,
      totalAmount: portalQuoteTotalAmount(quote) ?? (lineTotal && lineTotal > 0 ? lineTotal : undefined),
      customerProposedTotal: negotiationClosed ? undefined : fromApi?.customerProposedTotal,
      lines: quote.lines?.map((line) => ({
        description: line.description,
        amount: line.amount,
      })),
    });
    if (!fromApi && !fallback) return undefined;
    return {
      ...fallback,
      ...fromApi,
      tenantProposedTotal:
        fromApi?.tenantProposedTotal ??
        fromApi?.revenueTotal ??
        fallback?.tenantProposedTotal,
      revenueTotal:
        fromApi?.revenueTotal ?? fromApi?.tenantProposedTotal ?? fallback?.revenueTotal,
      customerProposedTotal: negotiationClosed
        ? undefined
        : (fromApi?.customerProposedTotal ?? fallback?.customerProposedTotal),
      customerProposedLines: negotiationClosed ? undefined : fromApi?.customerProposedLines,
      currencyCode: fromApi?.currencyCode ?? fallback?.currencyCode ?? quote.currencyCode,
    };
  }, [timeline?.pricing, quote, negotiationClosed]);

  const settlement = useMemo(
    () =>
      getNegotiationSettlement({
        status: quote.status || '',
        events,
        pricing: timeline?.pricing ?? quote.negotiationPricing ?? pricing,
        revenueTotal: portalQuoteTotalAmount(quote),
      }),
    [quote, events, timeline?.pricing, pricing],
  );

  const [message, setMessage] = useState('');
  const [proposedTotal, setProposedTotal] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!showTimeline && !canCounter) return null;

  return (
    <PortalPanel padded className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Negotiation</h2>
        {quote.negotiationRound != null ? (
          <p className="text-xs text-[var(--color-neutral-500)]">Round {quote.negotiationRound}</p>
        ) : null}
      </div>

      <NegotiationPricingCard
        pricing={pricing}
        currencyCode={quote.currencyCode}
        settlement={settlement}
      />
      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading timeline…</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-danger-600)]">{getServerErrorMessage(error)}</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : timeline?.events.length ? (
        <div className="space-y-2">
          {timeline.events.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-[var(--color-neutral-100)] px-3 py-2 text-sm"
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
                <p className="mt-1 text-[var(--color-neutral-600)]">{event.message}</p>
              ) : null}
              {event.proposedTotal != null ? (
                <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                  Proposed total: {event.proposedTotal}
                </p>
              ) : null}
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
          <p className="text-xs text-[var(--color-neutral-500)]">
            Your proposed total is required. Tenant charge lines stay unchanged until they accept.
          </p>
          <Input
            placeholder="Message *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Input
            placeholder="Proposed total *"
            type="number"
            min={0}
            step="0.01"
            required
            value={proposedTotal}
            onChange={(e) => setProposedTotal(e.target.value)}
          />
          {localError ? <p className="text-xs text-[var(--color-danger-600)]">{localError}</p> : null}
          <Button
            type="button"
            size="sm"
            disabled={!message.trim() || !proposedTotal.trim() || counterOffer.isPending}
            onClick={() => {
              setLocalError(null);
              const n = Number(proposedTotal.trim());
              if (!Number.isFinite(n) || n < 0) {
                setLocalError('Proposed total is required and must be a number ≥ 0.');
                return;
              }
              void counterOffer
                .mutateAsync({
                  id: quote.id,
                  dto: {
                    message: message.trim(),
                    proposed_total: n,
                  },
                })
                .then(() => {
                  setMessage('');
                  setProposedTotal('');
                  void refetch();
                  onSuccess?.(
                    'Counter-offer submitted. Your proposed total is waiting for the forwarder.',
                  );
                })
                .catch((err) => setLocalError(getServerErrorMessage(err)));
            }}
          >
            {counterOffer.isPending ? 'Submitting…' : 'Submit counter-offer'}
          </Button>
        </div>
      ) : null}
    </PortalPanel>
  );
}
