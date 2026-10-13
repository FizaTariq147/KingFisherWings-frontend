/** Vendor portal — payouts sent to the logged-in vendor. */
export const VENDOR_PORTAL_PAYOUTS_API = {
  list: '/vendor/payouts',
  detail: (id: string) => `/vendor/payouts/${encodeURIComponent(id)}`,
  account: '/vendor/payouts/account',
  accountOnboardingLink: '/vendor/payouts/account/onboarding-link',
} as const;

/** Staff ERP — Stripe Connect vendor payout administration. */
export const VENDOR_PAYOUTS_ADMIN_API = {
  list: '/vendor-payouts',
  detail: (id: string) => `/vendor-payouts/${encodeURIComponent(id)}`,
  account: (partyId: string) =>
    `/vendor-payouts/accounts/${encodeURIComponent(partyId)}`,
  accountOnboardingLink: (partyId: string) =>
    `/vendor-payouts/accounts/${encodeURIComponent(partyId)}/onboarding-link`,
} as const;
