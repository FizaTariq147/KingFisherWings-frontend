/**
 * NVOCC Sea Export workflow — matches the product flowchart.
 * Stage 1–2 = quotation & booking APIs; Stage 3–4 = job + portal APIs.
 * Other job types keep the standard /quotations send path.
 */

export type SeaExportOwner =
  | 'CUSTOMER'
  | 'CS'
  | 'SALES'
  | 'OPERATIONS'
  | 'OPS'
  | 'DOCS'
  | 'ACCOUNTS'
  | 'MGMT';

export type SeaExportStageKind = 'customer' | 'admin' | 'internal' | 'document' | 'end';

export type SeaExportStageId =
  | 'customer-request'
  | 'cs-receive'
  | 'quote-sent'
  | 'customer-accept'
  | 'booking-form'
  | 'invoice'
  | 'cro-container'
  | 'pick'
  | 'loading'
  | 'port-token'
  | 'draft-bl'
  | 'payment'
  | 'original-bl'
  | 'report';

export interface SeaExportStage {
  id: SeaExportStageId;
  band: '1-2' | '3-4';
  label: string;
  detail?: string;
  owner: SeaExportOwner;
  kind: SeaExportStageKind;
}

export const SEA_EXPORT_STAGES: readonly SeaExportStage[] = [
  {
    id: 'customer-request',
    band: '1-2',
    label: 'Customer requests quote',
    owner: 'CUSTOMER',
    kind: 'customer',
  },
  {
    id: 'cs-receive',
    band: '1-2',
    label: 'Admin receives request',
    detail: 'Portal access granted (CS triage)',
    owner: 'CS',
    kind: 'admin',
  },
  {
    id: 'quote-sent',
    band: '1-2',
    label: 'Admin sends quote',
    detail: 'Mark quote sent',
    owner: 'SALES',
    kind: 'admin',
  },
  {
    id: 'customer-accept',
    band: '1-2',
    label: 'Customer accepts',
    owner: 'CUSTOMER',
    kind: 'customer',
  },
  {
    id: 'booking-form',
    band: '1-2',
    label: 'Booking form filled',
    detail: 'Customer portal form first; Ops (admin / sales) completes /nvocc/bookings/:id/booking-form',
    owner: 'OPS',
    kind: 'internal',
  },
  {
    id: 'invoice',
    band: '1-2',
    label: 'Invoice sent by sales',
    owner: 'SALES',
    kind: 'internal',
  },
  {
    id: 'cro-container',
    band: '1-2',
    label: 'CRO + container number',
    detail: 'Issue CRO (DP World) · allocate container',
    owner: 'OPS',
    kind: 'document',
  },
  {
    id: 'pick',
    band: '3-4',
    label: 'Customer picks up container',
    detail: 'Tracking → Picked',
    owner: 'CUSTOMER',
    kind: 'customer',
  },
  {
    id: 'loading',
    band: '3-4',
    label: 'Loading',
    owner: 'OPERATIONS',
    kind: 'internal',
  },
  {
    id: 'port-token',
    band: '3-4',
    label: 'Customer at port',
    detail: 'Gets token',
    owner: 'CUSTOMER',
    kind: 'customer',
  },
  {
    id: 'draft-bl',
    band: '3-4',
    label: 'Draft BL given',
    owner: 'DOCS',
    kind: 'document',
  },
  {
    id: 'payment',
    band: '3-4',
    label: 'Payment received',
    owner: 'ACCOUNTS',
    kind: 'internal',
  },
  {
    id: 'original-bl',
    band: '3-4',
    label: 'Original BL given',
    owner: 'DOCS',
    kind: 'document',
  },
  {
    id: 'report',
    band: '3-4',
    label: 'Report generated',
    owner: 'MGMT',
    kind: 'end',
  },
] as const;

/** Booking-page actionable staff steps (Stage 1–2). */
export const SEA_EXPORT_BOOKING_ACTION_ORDER = [
  'cs-receive',
  'quote-sent',
  'customer-accept',
  'booking-form',
  'invoice',
  'cro-container',
] as const satisfies readonly SeaExportStageId[];

/** Job-page staff steps (Stage 3–4); portal steps are noted but done in portal. */
export const SEA_EXPORT_JOB_ACTION_ORDER = [
  'cro-container',
  'pick',
  'loading',
  'port-token',
  'draft-bl',
  'payment',
  'original-bl',
  'report',
] as const satisfies readonly SeaExportStageId[];

export const SEA_EXPORT_KIND_STYLES: Record<
  SeaExportStageKind,
  { bg: string; border: string; text: string }
> = {
  customer: { bg: '#E8F4FC', border: '#7EB6D9', text: '#0B4F6C' },
  admin: { bg: '#FFF4CC', border: '#E6C84A', text: '#6B5A00' },
  internal: { bg: '#E6F6EA', border: '#6FBF80', text: '#1B5E2A' },
  document: { bg: '#EDE4F7', border: '#A78BCA', text: '#4A2F6F' },
  end: { bg: '#0A2942', border: '#0A2942', text: '#FFFFFF' },
};

export function isNvoccQuoteJobType(jobType?: string): boolean {
  const jt = String(jobType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  return jt === 'NVOCC' || jt.startsWith('NVOCC_');
}

export function seaExportStageIndex(id: SeaExportStageId): number {
  return SEA_EXPORT_STAGES.findIndex((s) => s.id === id);
}

/** Map quotation status → current flowchart stage (Stage 1–2). */
export function quotationStatusToSeaExportStage(
  status: string,
  opts?: { hasJob?: boolean },
): SeaExportStageId {
  const s = status.toUpperCase().replace(/\s+/g, '_');
  if (opts?.hasJob || s === 'CONVERTED') return 'cro-container';
  if (s === 'APPROVED' || s === 'WON') return 'booking-form';
  if (s === 'SENT' || s === 'CUSTOMER_REVIEW' || s === 'NEGOTIATING') return 'customer-accept';
  if (s === 'INTERNALLY_APPROVED') return 'quote-sent';
  if (s === 'SUBMITTED') return 'cs-receive';
  return 'customer-request';
}

/** @deprecated Prefer SEA_EXPORT_STAGES — kept for older imports. */
export const SEA_EXPORT_BOOKING_QUOTE_STEPS = [
  {
    key: 'cs-triage',
    label: 'CS triage',
    owner: 'CS',
    path: 'POST /nvocc/bookings/:id/cs-triage',
  },
  {
    key: 'mark-quote-sent',
    label: 'Mark quote sent',
    owner: 'SALES',
    path: 'POST /nvocc/bookings/:id/mark-quote-sent',
  },
  {
    key: 'booking-form',
    label: 'Booking form (Ops)',
    owner: 'OPERATIONS',
    path: 'GET/PUT /nvocc/bookings/:id/booking-form',
  },
  {
    key: 'send-invoice',
    label: 'Send invoice',
    owner: 'SALES',
    path: 'POST /nvocc/bookings/:id/send-invoice',
  },
] as const;

/** @deprecated Prefer SEA_EXPORT_STAGES. */
export const SEA_EXPORT_JOB_OPS_STEPS = [
  {
    key: 'container-request',
    label: 'Container request → Issue CRO → Allocate',
    owner: 'OPS',
    path: 'POST /nvocc/jobs/:id/container-requests (+ issue / allocate)',
  },
  {
    key: 'confirm-pick',
    label: 'Customer confirm pick',
    owner: 'CUSTOMER',
    path: 'POST /portal/shipments/:id/containers/:lineId/confirm-pick',
  },
  {
    key: 'port-token',
    label: 'Customer port token',
    owner: 'CUSTOMER',
    path: 'POST /portal/shipments/:id/port-token/confirm',
  },
  {
    key: 'loading',
    label: 'Mark loading',
    owner: 'OPERATIONS',
    path: 'POST /nvocc/jobs/:id/stage/loading',
  },
  {
    key: 'draft-bl',
    label: 'Draft BL (portal request → gated HBL)',
    owner: 'DOCS',
    path: 'POST …/request-draft-bl → …/documents/hbl-draft-gated',
  },
  {
    key: 'payment',
    label: 'Confirm payment',
    owner: 'ACCOUNTS',
    path: 'POST /nvocc/jobs/:id/accounts/confirm-payment',
  },
  {
    key: 'original-bl',
    label: 'Original HBL (gated)',
    owner: 'DOCS',
    path: 'POST /nvocc/jobs/:id/documents/hbl-original-gated',
  },
  {
    key: 'close-report',
    label: 'Close report',
    owner: 'MGMT',
    path: 'POST /nvocc/jobs/:id/close-report',
  },
] as const;
