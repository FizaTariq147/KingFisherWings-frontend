import type { NegotiationEvent } from '@/features/quotations/types/quotationExtended.types';
import { sortNegotiationEvents } from '@/features/quotations/utils/negotiationActions';

interface VendorOfferNegotiationTimelineProps {
  events: NegotiationEvent[];
  isLoading?: boolean;
  emptyLabel?: string;
}

export function VendorOfferNegotiationTimeline({
  events,
  isLoading,
  emptyLabel = 'No negotiation events yet.',
}: VendorOfferNegotiationTimelineProps) {
  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading timeline…</p>;
  }
  const sorted = sortNegotiationEvents(events);
  if (!sorted.length) {
    return <p className="text-sm text-[var(--color-neutral-400)]">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2 border-t border-[var(--color-neutral-100)] pt-3">
      {[...sorted].reverse().map((event) => (
        <li key={event.id} className="text-xs text-[var(--color-neutral-700)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">
              {(event.eventType || 'EVENT').replaceAll('_', ' ')}
            </span>
            {event.actor ? (
              <span className="text-[var(--color-neutral-500)]">{event.actor}</span>
            ) : null}
            {event.status ? (
              <span className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5">
                {event.status.replaceAll('_', ' ')}
              </span>
            ) : null}
            {event.proposedTotal != null ? (
              <span className="tabular-nums">{event.proposedTotal}</span>
            ) : null}
          </div>
          {event.message ? <p className="mt-0.5 whitespace-pre-wrap">{event.message}</p> : null}
          {event.createdAt ? (
            <p className="text-[var(--color-neutral-400)]">{event.createdAt}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
