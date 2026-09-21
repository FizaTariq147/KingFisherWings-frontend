/**
 * Air freight workflow — exact status diagram.
 *
 * Shared commercial (both AIR_EXPORT / AIR_IMPORT):
 *   QUOTE_REQUESTED → CS_TRIAGED → QUOTE_SENT → CUSTOMER_ACCEPTED
 *   → BOOKING_FORM_COMPLETE → auto INVOICE_SENT (draft invoice + send-invoice)
 *   → then AIR_EXPORT / AIR_IMPORT ops on the existing job shell
 *
 * Live APIs are on /jobs/:id/air/* and gated /jobs/:id/documents/*.
 * Air job shell is created earlier; invoice after booking form unlocks ops (no NVOCC convert-to-job).
 */

export type AirWorkflowStageId =
  | 'quote-requested'
  | 'cs-triaged'
  | 'quote-sent'
  | 'customer-accepted'
  | 'booking-form-complete'
  | 'invoice-sent'
  | 'uld-request-issued'
  | 'uld-allocated'
  | 'cargo-dropped-off'
  | 'build-up'
  | 'draft-hawb-issued'
  | 'mawb-issued'
  | 'payment-received'
  | 'final-hawb-issued'
  | 'mawb-received'
  | 'pre-can-issued'
  | 'can-issued'
  | 'delivery-order-issued'
  | 'pod-received'
  | 'closed';

export type AirWorkflowOwner =
  | 'CUSTOMER'
  | 'CS'
  | 'SALES'
  | 'OPS'
  | 'DOCS'
  | 'ACCOUNTS'
  | 'MGMT';

export interface AirWorkflowStage {
  id: AirWorkflowStageId;
  label: string;
  owner: AirWorkflowOwner;
  band: 'commercial' | 'export' | 'import';
  path: string;
  parallelGroup?: string;
  detail?: string;
}

/** Shared commercial — both export and import. */
export const AIR_COMMERCIAL_STAGES: readonly AirWorkflowStage[] = [
  {
    id: 'quote-requested',
    label: 'Quote requested',
    owner: 'CUSTOMER',
    band: 'commercial',
    path: '(initial)',
    detail: 'Job exists; commercial gates start here',
  },
  {
    id: 'cs-triaged',
    label: 'CS triaged',
    owner: 'CS',
    band: 'commercial',
    path: 'POST /jobs/:id/air/cs-triage',
  },
  {
    id: 'quote-sent',
    label: 'Quote sent',
    owner: 'SALES',
    band: 'commercial',
    path: 'POST /jobs/:id/air/mark-quote-sent',
  },
  {
    id: 'customer-accepted',
    label: 'Customer accepted',
    owner: 'CUSTOMER',
    band: 'commercial',
    path: 'POST /portal/shipments/:id/accept (Air) · /portal/bookings/:id/accept (NVOCC)',
    detail: 'Unlocks compliance booking form — no auto convert-to-job',
  },
  {
    id: 'booking-form-complete',
    label: 'Booking form complete',
    owner: 'CUSTOMER',
    band: 'commercial',
    path: 'Portal GET/PUT …/compliance-form → POST …/submit',
    detail: 'Air: /portal/shipments/:id · NVOCC: /portal/bookings/:id; Ops may assist',
  },
  {
    id: 'invoice-sent',
    label: 'Invoice sent',
    owner: 'SALES',
    band: 'commercial',
    path: 'POST /invoices/from-job/:id → POST /jobs/:id/air/send-invoice',
    detail: 'Only after BOOKING_FORM_COMPLETE',
  },
] as const;

export const AIR_EXPORT_OPS_STAGES: readonly AirWorkflowStage[] = [
  {
    id: 'uld-request-issued',
    label: 'ULD request issued',
    owner: 'OPS',
    band: 'export',
    path: '(removed — air pallet / ULD APIs retired)',
    parallelGroup: 'uld',
    detail: 'Skip in UI; backend /air/uld-requests no longer exists',
  },
  {
    id: 'uld-allocated',
    label: 'ULD allocated',
    owner: 'OPS',
    band: 'export',
    path: '(removed — air pallet / ULD APIs retired)',
    parallelGroup: 'uld',
    detail: 'Skip in UI; backend /air/uld-requests no longer exists',
  },
  {
    id: 'cargo-dropped-off',
    label: 'Cargo dropped off',
    owner: 'CUSTOMER',
    band: 'export',
    path: 'POST /portal/shipments/:id/uld-lines/:lineId/confirm-dropoff',
  },
  {
    id: 'build-up',
    label: 'Build-up',
    owner: 'OPS',
    band: 'export',
    path: 'POST /jobs/:id/air/stage/build-up',
  },
  {
    id: 'draft-hawb-issued',
    label: 'Draft HAWB issued',
    owner: 'DOCS',
    band: 'export',
    path: 'Portal request-draft-hawb → POST …/documents/hawb-draft-gated',
    parallelGroup: 'hawb-mawb',
  },
  {
    id: 'mawb-issued',
    label: 'MAWB issued',
    owner: 'DOCS',
    band: 'export',
    path: 'POST /jobs/:id/air/stage/mawb-issued',
    parallelGroup: 'hawb-mawb',
  },
  {
    id: 'payment-received',
    label: 'Payment received',
    owner: 'ACCOUNTS',
    band: 'export',
    path: 'POST /jobs/:id/air/accounts/confirm-payment',
  },
  {
    id: 'final-hawb-issued',
    label: 'Final HAWB issued',
    owner: 'DOCS',
    band: 'export',
    path: 'POST /jobs/:id/documents/hawb-final-gated',
  },
  {
    id: 'closed',
    label: 'Closed',
    owner: 'MGMT',
    band: 'export',
    path: 'POST /jobs/:id/air/close-report',
  },
] as const;

export const AIR_IMPORT_OPS_STAGES: readonly AirWorkflowStage[] = [
  {
    id: 'mawb-received',
    label: 'MAWB received',
    owner: 'OPS',
    band: 'import',
    path: 'POST /jobs/:id/air/stage/mawb-received',
  },
  {
    id: 'pre-can-issued',
    label: 'Pre-CAN issued',
    owner: 'DOCS',
    band: 'import',
    path: 'POST /jobs/:id/documents/pre-can-gated',
  },
  {
    id: 'can-issued',
    label: 'CAN issued',
    owner: 'DOCS',
    band: 'import',
    path: 'POST /jobs/:id/documents/can-gated',
  },
  {
    id: 'payment-received',
    label: 'Payment received',
    owner: 'ACCOUNTS',
    band: 'import',
    path: 'POST /jobs/:id/air/accounts/confirm-payment',
  },
  {
    id: 'delivery-order-issued',
    label: 'Delivery order issued',
    owner: 'DOCS',
    band: 'import',
    path: 'Portal request-delivery-order → POST …/documents/delivery-order-gated',
  },
  {
    id: 'pod-received',
    label: 'POD received',
    owner: 'OPS',
    band: 'import',
    path: 'POST /jobs/:id/air/stage/pod',
  },
  {
    id: 'closed',
    label: 'Closed',
    owner: 'MGMT',
    band: 'import',
    path: 'POST /jobs/:id/air/close-report',
  },
] as const;

/** Ordered staff action keys for commercial UI. */
export const AIR_COMMERCIAL_ACTION_ORDER = [
  'cs-triaged',
  'quote-sent',
  'customer-accepted',
  'booking-form-complete',
  'invoice-sent',
] as const satisfies readonly AirWorkflowStageId[];

export const AIR_EXPORT_ACTION_ORDER = [
  'uld-request-issued',
  'uld-allocated',
  'cargo-dropped-off',
  'build-up',
  'draft-hawb-issued',
  'mawb-issued',
  'payment-received',
  'final-hawb-issued',
  'closed',
] as const satisfies readonly AirWorkflowStageId[];

export const AIR_IMPORT_ACTION_ORDER = [
  'mawb-received',
  'pre-can-issued',
  'can-issued',
  'payment-received',
  'delivery-order-issued',
  'pod-received',
  'closed',
] as const satisfies readonly AirWorkflowStageId[];

/** @deprecated Prefer AIR_COMMERCIAL_STAGES */
export const AIR_EXPORT_QUOTE_STEPS = AIR_COMMERCIAL_STAGES.filter(
  (s) => s.id !== 'quote-requested',
).map((s) => ({
  key: s.id,
  label: s.label,
  owner: s.owner,
  path: s.path,
}));

/** @deprecated Prefer AIR_EXPORT_OPS_STAGES */
export const AIR_EXPORT_OPS_STEPS = AIR_EXPORT_OPS_STAGES.map((s) => ({
  key: s.id,
  label: s.label,
  owner: s.owner,
  path: s.path,
}));

/** @deprecated Prefer AIR_IMPORT_OPS_STAGES */
export const AIR_IMPORT_OPS_STEPS = AIR_IMPORT_OPS_STAGES.map((s) => ({
  key: s.id,
  label: s.label,
  owner: s.owner,
  path: s.path,
}));

export function isAirQuoteJobType(jobType?: string): boolean {
  const jt = String(jobType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  return jt === 'AIR' || jt.startsWith('AIR_');
}

export function isAirExportJobType(jobType?: string): boolean {
  return jobType === 'AIR_EXPORT';
}

export function isAirImportJobType(jobType?: string): boolean {
  return jobType === 'AIR_IMPORT';
}
