export const PORTAL_CREDIT_NOTES_API = {
  list: '/portal/credit-notes',
  detail: (id: string) => `/portal/credit-notes/${id}`,
} as const;

