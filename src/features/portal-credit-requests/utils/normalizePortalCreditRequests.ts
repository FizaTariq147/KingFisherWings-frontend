import {
  asRecord,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList
} from '@/features/portal-shared/normalize';
import type { PortalCreditLimitRequest } from '../types/portalCreditRequests.types';

export function normalizeCreditLimitRequest(raw: unknown): PortalCreditLimitRequest | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    requestedLimit: pickNumber(r.requested_limit, r.requestedLimit),
    justification: pickString(r.justification) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    reviewNotes: pickString(r.review_notes, r.reviewNotes) || undefined,
    approvedLimit: pickNumber(r.approved_limit, r.approvedLimit),
  };
}

export function normalizeCreditLimitRequests(raw: unknown): PortalCreditLimitRequest[] {
  const { items } = unwrapList(raw, ['items', 'results', 'requests', 'data']);
  const unwrapped = unwrapData(raw);
  const list = items.length ? items : Array.isArray(unwrapped) ? unwrapped : [];
  return list.map(normalizeCreditLimitRequest).filter((x): x is PortalCreditLimitRequest => Boolean(x));
}
