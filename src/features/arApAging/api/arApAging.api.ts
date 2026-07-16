export const AR_AP_AGING_ROUTE_PREFIX = '/gl/ar/aging';

export const AR_AP_AGING_API = {
  arAging: '/gl/ar/aging',
  apAging: '/gl/ap/aging',
  arStatement: (partyId: string) => `/gl/ar/statement/${partyId}`,
  apStatement: (partyId: string) => `/gl/ap/statement/${partyId}`,
} as const;
