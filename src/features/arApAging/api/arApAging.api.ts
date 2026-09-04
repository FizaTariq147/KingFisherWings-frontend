/** UI route prefixes (not API paths). */
export const AR_AGING_ROUTE = '/gl/ar/aging';
export const AP_AGING_ROUTE = '/gl/ap/aging';

/** @deprecated use AR_AGING_ROUTE */
export const AR_AP_AGING_ROUTE_PREFIX = AR_AGING_ROUTE;

export const AR_AP_AGING_API = {
  arAging: '/gl/ar/aging',
  apAging: '/gl/ap/aging',
  arOpenItems: '/gl/ar/open-items',
  apOpenItems: '/gl/ap/open-items',
  arStatement: (partyId: string) => `/gl/ar/statement/${partyId}`,
  apStatement: (partyId: string) => `/gl/ap/statement/${partyId}`,
} as const;
