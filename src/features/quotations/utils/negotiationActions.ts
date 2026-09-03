import type { NegotiationEvent, NegotiationPricing } from '../types/quotationExtended.types';
import {
  canStaffMarkCustomerDecision,
  coerceQuotationStatus,
  isQuotationTerminalClosed,
} from './quotationStatus';

const REVISE_STATUSES = new Set([
  'INTERNALLY_APPROVED',
  'SENT',
  'CUSTOMER_REVIEW',
  'NEGOTIATING',
]);

export function normalizeNegotiationEventType(type?: string): string {
  return (type || '').trim().toUpperCase().replace(/\s+/g, '_');
}

export function normalizeNegotiationActor(actor?: string): string {
  return (actor || '').trim().toUpperCase();
}

/** Sort oldest → newest when timestamps exist. */
export function sortNegotiationEvents(events: NegotiationEvent[]): NegotiationEvent[] {
  return [...events].sort((a, b) => {
    const at = a.createdAt ? Date.parse(a.createdAt) : NaN;
    const bt = b.createdAt ? Date.parse(b.createdAt) : NaN;
    if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return at - bt;
    return 0;
  });
}

function isAcceptEvent(type: string): boolean {
  return type === 'ACCEPT' || type === 'ACCEPTED' || type === 'APPROVE' || type === 'APPROVED';
}

function isCounterEvent(type: string): boolean {
  return type === 'COUNTER_OFFER' || type === 'COUNTER' || type === 'CUSTOMER_COUNTER';
}

function isCustomerActor(actor?: string): boolean {
  const a = normalizeNegotiationActor(actor);
  return (
    a.includes('CUSTOMER') ||
    a.includes('PORTAL') ||
    a.includes('VENDOR') // vendor cost negotiation counterparty
  );
}

function isTenantActor(actor?: string): boolean {
  const a = normalizeNegotiationActor(actor);
  return a.includes('TENANT') || a.includes('STAFF') || a.includes('USER') || a.includes('ADMIN');
}

export function isNegotiationClosed(
  status: string,
  events: NegotiationEvent[] = [],
): boolean {
  if (isQuotationTerminalClosed(status)) return true;

  const sorted = sortNegotiationEvents(events);
  const last = sorted[sorted.length - 1];
  if (!last) return false;
  const type = normalizeNegotiationEventType(last.eventType);
  return (
    isAcceptEvent(type) ||
    type === 'WON' ||
    type === 'LOST' ||
    type === 'DISAPPROVED' ||
    type === 'REJECTED' ||
    type === 'TERMINAL_REJECT'
  );
}

export function getPendingCustomerCounterTotal(
  pricing?: NegotiationPricing | null,
  events: NegotiationEvent[] = [],
  closed = false,
): number | undefined {
  if (closed) return undefined;
  if (pricing?.customerProposedTotal != null && Number.isFinite(pricing.customerProposedTotal)) {
    return pricing.customerProposedTotal;
  }

  const sorted = sortNegotiationEvents(events);
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const event = sorted[i];
    const type = normalizeNegotiationEventType(event.eventType);
    if (
      isAcceptEvent(type) ||
      type === 'WON' ||
      type === 'LOST' ||
      type === 'DISAPPROVED' ||
      type === 'REVISE' ||
      type === 'SEND'
    ) {
      return undefined;
    }
    if (isCounterEvent(type)) {
      if (!event.actor || isCustomerActor(event.actor)) {
        return event.proposedTotal;
      }
    }
  }
  return undefined;
}

export type NegotiationSettlement = {
  closed: boolean;
  acceptedBy?: 'CUSTOMER' | 'TENANT';
  finalTotal?: number;
  lastCustomerCounter?: number;
  customerAbandonedCounter?: boolean;
};

export function getNegotiationSettlement(opts: {
  status: string;
  events?: NegotiationEvent[];
  pricing?: NegotiationPricing | null;
  revenueTotal?: number;
}): NegotiationSettlement {
  const events = opts.events ?? [];
  const closed = isNegotiationClosed(opts.status, events);
  if (!closed) {
    return { closed: false };
  }

  const sorted = sortNegotiationEvents(events);
  const last = sorted[sorted.length - 1];
  const lastType = normalizeNegotiationEventType(last?.eventType);

  let acceptedBy: 'CUSTOMER' | 'TENANT' | undefined;
  if (isAcceptEvent(lastType) && last) {
    if (isCustomerActor(last.actor)) acceptedBy = 'CUSTOMER';
    else if (isTenantActor(last.actor) || !last.actor) acceptedBy = 'TENANT';
  } else if (isQuotationTerminalClosed(opts.status)) {
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      const type = normalizeNegotiationEventType(sorted[i].eventType);
      if (!isAcceptEvent(type)) continue;
      acceptedBy = isCustomerActor(sorted[i].actor) ? 'CUSTOMER' : 'TENANT';
      break;
    }
  }

  let lastCustomerCounter: number | undefined;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const event = sorted[i];
    if (!isCounterEvent(normalizeNegotiationEventType(event.eventType))) continue;
    if (!event.actor || isCustomerActor(event.actor)) {
      lastCustomerCounter = event.proposedTotal;
      break;
    }
  }
  if (lastCustomerCounter == null && opts.pricing?.customerProposedTotal != null) {
    lastCustomerCounter = opts.pricing.customerProposedTotal;
  }

  const tenantOffer =
    opts.pricing?.tenantProposedTotal ??
    opts.pricing?.revenueTotal ??
    opts.revenueTotal;

  let finalTotal: number | undefined;
  let customerAbandonedCounter = false;

  if (acceptedBy === 'CUSTOMER') {
    finalTotal = tenantOffer;
    customerAbandonedCounter =
      lastCustomerCounter != null &&
      tenantOffer != null &&
      lastCustomerCounter !== tenantOffer;
  } else if (acceptedBy === 'TENANT') {
    finalTotal = lastCustomerCounter ?? tenantOffer;
  } else {
    finalTotal = tenantOffer ?? lastCustomerCounter;
  }

  return {
    closed: true,
    acceptedBy,
    finalTotal,
    lastCustomerCounter,
    customerAbandonedCounter,
  };
}

export function canStaffReviseOffer(status: string, closed: boolean): boolean {
  if (closed) return false;
  const normalizedStatus = coerceQuotationStatus(status);
  return REVISE_STATUSES.has(normalizedStatus);
}

export function canStaffRespondToCounter(
  status: string,
  pendingCustomerTotal: number | undefined,
  closed: boolean,
): boolean {
  if (closed || pendingCustomerTotal == null) return false;
  return canStaffMarkCustomerDecision(status);
}
