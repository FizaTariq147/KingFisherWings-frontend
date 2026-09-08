import {
  canPortalCustomerRespond,
  coerceQuotationStatus,
  isQuotationTerminalClosed,
} from './quotationStatus';
import type { QuotationStatus } from '../constants/quotation.constants';
import type { NegotiationEvent } from '../types/quotationExtended.types';
import {
  normalizeNegotiationActor,
  normalizeNegotiationEventType,
  sortNegotiationEvents,
} from './negotiationActions';

/** Shared across tabs on the same origin (portal + admin). */
export const CUSTOMER_QUOTE_DECISION_STORAGE_KEY = 'kfw.quotationCustomerDecisions.v1';

export type CustomerQuoteDecision = 'APPROVED' | 'REJECTED';

type DecisionEntry = {
  decision: CustomerQuoteDecision;
  at: number;
};

function parseMap(raw: string | null): Record<string, DecisionEntry> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string | DecisionEntry>;
    const out: Record<string, DecisionEntry> = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (value === 'APPROVED' || value === 'REJECTED') {
        out[id] = { decision: value, at: Date.now() };
      } else if (
        value &&
        typeof value === 'object' &&
        (value.decision === 'APPROVED' || value.decision === 'REJECTED')
      ) {
        out[id] = {
          decision: value.decision,
          at: typeof value.at === 'number' ? value.at : Date.now(),
        };
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Move per-tab session decisions into shared localStorage (portal tab → admin tab). */
function migrateSessionToLocal(): void {
  try {
    const sessionRaw = sessionStorage.getItem(CUSTOMER_QUOTE_DECISION_STORAGE_KEY);
    if (!sessionRaw) return;
    const sessionMap = parseMap(sessionRaw);
    const localMap = parseMap(localStorage.getItem(CUSTOMER_QUOTE_DECISION_STORAGE_KEY));
    const merged = { ...localMap, ...sessionMap };
    localStorage.setItem(CUSTOMER_QUOTE_DECISION_STORAGE_KEY, JSON.stringify(merged));
    sessionStorage.removeItem(CUSTOMER_QUOTE_DECISION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function readMap(): Record<string, DecisionEntry> {
  migrateSessionToLocal();
  try {
    return parseMap(localStorage.getItem(CUSTOMER_QUOTE_DECISION_STORAGE_KEY));
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, DecisionEntry>) {
  try {
    localStorage.setItem(CUSTOMER_QUOTE_DECISION_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Call on portal/admin boot so per-tab session decisions become shared. */
export function ensureCustomerQuoteDecisionStorageMigrated() {
  migrateSessionToLocal();
}

/** Remember a successful portal accept/reject when the API status lags. */
export function rememberCustomerQuoteDecision(id: string, decision: CustomerQuoteDecision) {
  if (!id) return;
  const map = readMap();
  map[id] = { decision, at: Date.now() };
  writeMap(map);
  // Same-tab listeners (admin SPA) — StorageEvent only fires in other tabs.
  try {
    window.dispatchEvent(
      new CustomEvent('kfw-customer-quote-decision', { detail: { id, decision } }),
    );
  } catch {
    /* ignore */
  }
}

export function clearCustomerQuoteDecision(id: string) {
  if (!id) return;
  const map = readMap();
  if (!(id in map)) return;
  delete map[id];
  writeMap(map);
}

export function isAwaitingCustomerDecision(status: string): boolean {
  const s = coerceQuotationStatus(status);
  return s === 'SENT' || s === 'CUSTOMER_REVIEW' || s === 'NEGOTIATING';
}

/**
 * If the API left status open but set a lost/reject reason, treat as Rejected.
 */
export function statusFromRejectMarkers(
  status: QuotationStatus,
  record?: Record<string, unknown> | null,
): QuotationStatus {
  if (!record) return status;
  if (!isAwaitingCustomerDecision(status)) return status;

  const reason =
    String(record.lost_reason ?? record.lostReason ?? '').trim() ||
    String(record.rejection_reason ?? record.rejectionReason ?? '').trim() ||
    String(record.disapprove_reason ?? record.disapproveReason ?? '').trim() ||
    String(record.customer_reject_reason ?? record.customerRejectReason ?? '').trim() ||
    String(record.reject_reason ?? record.rejectReason ?? '').trim();
  const notes =
    String(record.lost_notes ?? record.lostNotes ?? '').trim() ||
    String(record.rejection_notes ?? record.rejectionNotes ?? '').trim() ||
    String(record.disapprove_notes ?? record.disapproveNotes ?? '').trim();
  const decision = String(
    record.customer_decision ??
      record.customerDecision ??
      record.decision ??
      record.portal_decision ??
      record.portalDecision ??
      '',
  )
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

  if (
    reason ||
    notes ||
    decision === 'REJECTED' ||
    decision === 'DISAPPROVED' ||
    decision === 'LOST' ||
    decision === 'REJECT'
  ) {
    return 'REJECTED';
  }

  if (decision === 'APPROVED' || decision === 'ACCEPTED' || decision === 'WON') {
    return 'APPROVED';
  }

  return status;
}

/** Prefer latest terminal transition in status_history when header status lags. */
export function statusFromStatusHistory(
  record?: Record<string, unknown> | null,
): QuotationStatus | undefined {
  if (!record) return undefined;
  const history = record.status_history ?? record.statusHistory;
  if (!Array.isArray(history) || history.length === 0) return undefined;

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const e = entry as Record<string, unknown>;
    const toRaw = e.to_status ?? e.toStatus ?? e.status ?? e.to;
    if (toRaw == null || String(toRaw).trim() === '') continue;
    const to = coerceQuotationStatus(toRaw);
    if (isQuotationTerminalClosed(to)) {
      return to === 'DISAPPROVED' ? 'REJECTED' : to;
    }
  }
  return undefined;
}

function isAcceptEvent(type: string): boolean {
  return type === 'ACCEPT' || type === 'ACCEPTED' || type === 'APPROVE' || type === 'APPROVED';
}

function isQuoteRejectEvent(type: string): boolean {
  return (
    type === 'LOST' ||
    type === 'DISAPPROVED' ||
    type === 'REJECTED' ||
    type === 'TERMINAL_REJECT' ||
    type === 'CUSTOMER_REJECT' ||
    type === 'CUSTOMER_DISAPPROVE' ||
    type === 'PORTAL_REJECT' ||
    type === 'QUOTE_REJECTED' ||
    type === 'MARK_LOST' ||
    type === 'MARK_REJECTED'
  );
}

function isStaffCounterRejectEvent(type: string): boolean {
  return type === 'COUNTER_REJECT' || type === 'REJECT_COUNTER' || type === 'REJECT_COUNTER_OFFER';
}

function isCustomerActor(actor?: string): boolean {
  const a = normalizeNegotiationActor(actor);
  return a.includes('CUSTOMER') || a.includes('PORTAL');
}

function isStaffActor(actor?: string): boolean {
  const a = normalizeNegotiationActor(actor);
  return (
    a.includes('TENANT') ||
    a.includes('STAFF') ||
    a.includes('USER') ||
    a.includes('ADMIN') ||
    a.includes('FORWARDER')
  );
}

/**
 * When quotation.status is still SENT/NEGOTIATING but the timeline already
 * recorded customer accept/reject, surface Approved/Rejected in admin UI.
 */
export function statusFromNegotiationEvents(
  status: QuotationStatus,
  events: NegotiationEvent[] = [],
): QuotationStatus {
  if (!isAwaitingCustomerDecision(status) || events.length === 0) return status;

  const sorted = sortNegotiationEvents(events);
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const event = sorted[i];
    const type = normalizeNegotiationEventType(event.eventType);
    const eventStatus = event.status ? coerceQuotationStatus(event.status) : undefined;

    if (eventStatus && isQuotationTerminalClosed(eventStatus)) {
      return eventStatus === 'DISAPPROVED' ? 'REJECTED' : eventStatus;
    }

    // Staff rejecting a counter-offer (non-terminal) keeps negotiation open.
    if (isStaffCounterRejectEvent(type)) {
      continue;
    }

    // Portal/customer REJECT closes the quote. Staff REJECT on a counter does not.
    if (type === 'REJECT') {
      if (isCustomerActor(event.actor)) return 'REJECTED';
      if (isStaffActor(event.actor)) continue;
      // No actor: prefer explicit terminal status on the event; otherwise treat as portal close.
      if (eventStatus && isQuotationTerminalClosed(eventStatus)) {
        return eventStatus === 'DISAPPROVED' ? 'REJECTED' : eventStatus;
      }
      return 'REJECTED';
    }

    if (isQuoteRejectEvent(type)) {
      if (type === 'REJECTED' && event.actor && isStaffActor(event.actor) && !isCustomerActor(event.actor)) {
        continue;
      }
      return 'REJECTED';
    }

    if (isAcceptEvent(type) && (isCustomerActor(event.actor) || !event.actor)) {
      return 'APPROVED';
    }
    if (type === 'WON' || type === 'MARK_WON') {
      return 'APPROVED';
    }
  }

  return status;
}

export type ResolveQuoteStatusOptions = {
  /**
   * Use shared localStorage decisions from the customer portal when the API
   * still returns Negotiating (same browser, portal + admin tabs).
   */
  useMemory?: boolean;
  negotiationEvents?: NegotiationEvent[];
};

/**
 * Merge API status with reject markers, status history, negotiation events,
 * and optional portal memory so admin/portal show Approved/Rejected promptly.
 */
export function resolveCustomerFacingQuoteStatus(
  id: string | undefined,
  rawStatus: unknown,
  record?: Record<string, unknown> | null,
  options: ResolveQuoteStatusOptions = {},
): QuotationStatus | undefined {
  const { useMemory = true, negotiationEvents } = options;
  const raw = rawStatus == null || rawStatus === '' ? undefined : coerceQuotationStatus(rawStatus);
  if (!raw) return undefined;

  let status = statusFromRejectMarkers(raw, record);

  if (isAwaitingCustomerDecision(status)) {
    const fromHistory = statusFromStatusHistory(record);
    if (fromHistory) status = fromHistory;
  }

  const embeddedEvents = negotiationEvents?.length
    ? negotiationEvents
    : extractNegotiationEventsFromRecord(record);
  if (embeddedEvents?.length) {
    status = statusFromNegotiationEvents(status, embeddedEvents);
  }

  if (!id) return status === 'DISAPPROVED' ? 'REJECTED' : status;

  const apiStillOpen = isAwaitingCustomerDecision(raw);
  const resolvedClosed = isQuotationTerminalClosed(status);

  // Only drop portal memory when the SERVER itself reports a closed status.
  // Clearing earlier made list/detail flicker back to Negotiating on the next refetch.
  if (resolvedClosed && !apiStillOpen) {
    clearCustomerQuoteDecision(id);
    return status === 'DISAPPROVED' ? 'REJECTED' : status;
  }

  if (resolvedClosed && apiStillOpen) {
    if (useMemory) {
      const decision: CustomerQuoteDecision =
        status === 'APPROVED' || status === 'CONVERTED' ? 'APPROVED' : 'REJECTED';
      rememberCustomerQuoteDecision(id, decision);
    }
    return status === 'DISAPPROVED' ? 'REJECTED' : status;
  }

  if (useMemory) {
    const remembered = readMap()[id];
    if (remembered && canPortalCustomerRespond(status)) {
      return remembered.decision;
    }
  }

  return status;
}

/** Some list/detail payloads embed negotiation events or a timeline object. */
function extractNegotiationEventsFromRecord(
  record?: Record<string, unknown> | null,
): NegotiationEvent[] | undefined {
  if (!record) return undefined;
  const nested =
    record.negotiation_events ??
    record.negotiationEvents ??
    record.events ??
    (record.negotiation && typeof record.negotiation === 'object'
      ? (record.negotiation as Record<string, unknown>).events
      : undefined);
  if (!Array.isArray(nested) || nested.length === 0) return undefined;
  return nested.map((item) => {
    const r = item && typeof item === 'object' && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : {};
    return {
      id: String(r.id ?? ''),
      eventType: String(r.event_type ?? r.eventType ?? r.type ?? r.action ?? ''),
      actor: r.actor != null ? String(r.actor) : undefined,
      status: r.status != null ? String(r.status) : undefined,
      message: r.message != null ? String(r.message) : undefined,
      createdAt: r.created_at != null
        ? String(r.created_at)
        : r.createdAt != null
          ? String(r.createdAt)
          : undefined,
    } as NegotiationEvent;
  });
}
