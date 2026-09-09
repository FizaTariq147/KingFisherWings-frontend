export const DEBIT_NOTE_ROUTE_PREFIX = '/debit-notes';

/** Staff Debit Notes — matches Swagger tag "Debit Notes". */
export const DEBIT_NOTE_API = {
  list: '/debit-notes',
  create: '/debit-notes',
  byId: (id: string) => `/debit-notes/${id}`,
  post: (id: string) => `/debit-notes/${id}/post`,
} as const;
