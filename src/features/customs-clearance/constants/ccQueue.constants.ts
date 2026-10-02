/** Status values accepted by GET /jobs/cc/queue (OpenAPI). */
export const CC_QUEUE_STATUSES = [
  'PENDING',
  'QUOTED',
  'ACCEPTED',
  'OPS_OPEN',
  'DOCS',
  'CLASSIFIED',
  'FILED',
  'QUERY',
  'ASSESSED',
  'DUTY_PAID',
  'CLEARED',
  'RELEASED',
  'INVOICE_READY',
  'CLOSED',
] as const;

export type CcQueueStatus = (typeof CC_QUEUE_STATUSES)[number];

/** Owner filter values accepted by GET /jobs/cc/queue (OpenAPI). */
export const CC_QUEUE_OWNERS = ['SALES', 'OPS', 'ACCOUNTS'] as const;

export type CcQueueOwner = (typeof CC_QUEUE_OWNERS)[number];

export const CC_QUEUE_DIRECTIONS = ['IMPORT', 'EXPORT', 'TRANSIT'] as const;

export type CcQueueDirection = (typeof CC_QUEUE_DIRECTIONS)[number];
