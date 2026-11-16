export const CREDIT_NOTE_ROUTE_PREFIX = '/credit-notes';

export const CREDIT_NOTE_API = {
  list: '/credit-notes',
  create: '/credit-notes',
  byId: (id: string) => `/credit-notes/${id}`,
  post: (id: string) => `/credit-notes/${id}/post`,
  /** POST — server PDF (DRAFT | POSTED | SENT | PARTIALLY_PAID | PAID). */
  pdf: (id: string) => `/credit-notes/${id}/pdf`,
} as const;
