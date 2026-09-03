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
    String(record.customer_reject_reason ?? record.customerRejectReason ?? '').trim();
  const notes =
    String(record.lost_notes ?? record.lostNotes ?? '').trim() ||
    String(record.rejection_notes ?? record.rejectionNotes ?? '').trim();
  const decision = String(
    record.customer_decision ?? record.customerDecision ?? record.decision ?? '',
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
    type === 'QUOTE_REJECTED'
  );
}

function isCustomerActor(actor?: string): boolean {
  const a = normalizeNegotiationActor(actor);
  return a.includes('CUSTOMER') || a.includes('PORTAL');
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

    // Staff rejecting a counter-offer uses REJECT without closing the quote.
    if (type === 'REJECT' || type === 'COUNTER_REJECT' || type === 'REJECT_COUNTER') {
      continue;
    }

    if (isQuoteRejectEvent(type)) {
      if (type === 'REJECTED' && event.actor && !isCustomerActor(event.actor)) {
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

  if (negotiationEvents?.length) {
    status = statusFromNegotiationEvents(status, negotiationEvents);
  }

  if (!id) return status;

  if (isQuotationTerminalClosed(status)) {
    clearCustomerQuoteDecision(id);
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
