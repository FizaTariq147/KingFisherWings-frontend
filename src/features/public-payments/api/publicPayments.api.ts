/** Payment Links (public) — no auth. */
export const PUBLIC_PAYMENTS_API = {
  summary: (token: string) => `/pay/${encodeURIComponent(token)}`,
  checkout: (token: string) => `/pay/${encodeURIComponent(token)}/checkout`,
} as const;
