export const DEBIT_NOTE_ROUTE_PREFIX = '/debit-notes';

/** Staff Debit Notes — matches Swagger tag "Debit Notes". */
export const DEBIT_NOTE_API = {
  list: '/debit-notes',
  create: '/debit-notes',
  byId: (id: string) => `/debit-notes/${id}`,
  post: (id: string) => `/debit-notes/${id}/post`,
  /** POST — server PDF (DRAFT | POSTED | SENT | PARTIALLY_PAID | PAID). */
  pdf: (id: string) => `/debit-notes/${id}/pdf`,
  /** GET download / POST upload — customer portal payment proof (same file as /portal/debit-notes/:id/attachment). */
  attachment: (id: string) => `/debit-notes/${id}/attachment`,
} as const;
