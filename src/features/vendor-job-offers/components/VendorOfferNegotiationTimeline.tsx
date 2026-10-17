import type { NegotiationEvent } from '@/features/quotations/types/quotationExtended.types';
import { sortNegotiationEvents } from '@/features/quotations/utils/negotiationActions';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';

interface VendorOfferNegotiationTimelineProps {
  events: NegotiationEvent[];
  isLoading?: boolean;
  emptyLabel?: string;
  currencyCode?: string;
}

function actorLabel(actor?: string): string {
  const a = (actor || '').trim().toUpperCase();
  if (!a) return '';
  if (a === 'TENANT' || a.includes('STAFF') || a.includes('ADMIN')) return 'Tenant';
  if (a.includes('VENDOR') || a.includes('SUPPLIER')) return 'Vendor';
  if (a.includes('CUSTOMER') || a.includes('PORTAL')) return 'Customer';
  return a
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0) + p.slice(1).toLowerCase())
    .join(' ');
}

function eventTypeLabel(type?: string): string {
  const t = (type || '').trim().toUpperCase().replace(/\s+/g, '_');
  const map: Record<string, string> = {
    SEND: 'Sent',
    SENT: 'Sent',
    REVISE: 'Revised offer',
    REVISED: 'Revised offer',
    ACCEPT: 'Accepted',
    ACCEPTED: 'Accepted',
    APPROVE: 'Approved',
    APPROVED: 'Approved',
    REJECT: 'Rejected',
    REJECTED: 'Rejected',
    DISAPPROVE: 'Disapproved',
    DISAPPROVED: 'Disapproved',
    COUNTER: 'Counter offer',
    COUNTER_OFFER: 'Counter offer',
    VENDOR_COUNTER: 'Vendor counter',
    CUSTOMER_COUNTER: 'Customer counter',
    PRICE: 'Price update',
    VENDOR_PRICE: 'Vendor price',
  };
  if (map[t]) return map[t];
  return (type || 'Event')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWhen(iso?: string): string {
  if (!iso?.trim()) return '';
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  return new Date(ms).toLocaleString();
}

export function VendorOfferNegotiationTimeline({
  events,
  isLoading,
  emptyLabel = 'No negotiation events yet.',
  currencyCode,
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
      {[...sorted].reverse().map((event) => {
        const who = actorLabel(event.actor);
        const when = formatWhen(event.createdAt);
        const amount =
          event.proposedTotal != null
            ? formatVendorMoney(event.proposedTotal, currencyCode)
            : null;
        return (
          <li key={event.id} className="text-xs text-[var(--color-neutral-700)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{eventTypeLabel(event.eventType)}</span>
              {who ? (
                <span className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[var(--color-neutral-600)]">
                  {who}
                </span>
              ) : null}
              {event.status ? (
                <span className="text-[var(--color-neutral-500)]">
                  {eventTypeLabel(event.status)}
                </span>
              ) : null}
              {amount ? <span className="tabular-nums font-medium">{amount}</span> : null}
            </div>
            {event.message ? (
              <p className="mt-0.5 whitespace-pre-wrap">{event.message}</p>
            ) : null}
            {when ? <p className="text-[var(--color-neutral-400)]">{when}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
