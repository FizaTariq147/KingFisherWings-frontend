export const PORTAL_CREDIT_NOTES_API = {
  list: '/portal/credit-notes',
  detail: (id: string) => `/portal/credit-notes/${encodeURIComponent(id)}`,
} as const;

export const PORTAL_DEBIT_NOTES_API = {
  list: '/portal/debit-notes',
  detail: (id: string) => `/portal/debit-notes/${encodeURIComponent(id)}`,
} as const;
