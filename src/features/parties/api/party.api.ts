export const PARTY_API = {
  list: '/parties',
  byId: (id: string) => `/parties/${id}`,
  creditStatus: (id: string) => `/parties/${id}/credit-status`,
  contacts: (id: string) => `/parties/${id}/contacts`,
  contactById: (id: string, contactId: string) => `/parties/${id}/contacts/${contactId}`,
  addresses: (id: string) => `/parties/${id}/addresses`,
  addressById: (id: string, addressId: string) => `/parties/${id}/addresses/${addressId}`,
  history: (id: string) => `/parties/${id}/history`,
  import: '/parties/import',
  export: '/parties/export',
  /** Parties → portal users (docs#/Parties) */
  portalUsers: (partyId: string) => `/parties/${partyId}/portal-users`,
  portalUserStatus: (partyId: string, id: string) =>
    `/parties/${partyId}/portal-users/${id}/status`,
  portalUserResetPassword: (partyId: string, id: string) =>
    `/parties/${partyId}/portal-users/${id}/reset-password`,
  /** Parties → portal document rights */
  portalPermissions: (partyId: string) => `/parties/${partyId}/portal-permissions`,
  portalPermissionsReset: (partyId: string) =>
    `/parties/${partyId}/portal-permissions/reset-defaults`,
} as const;

export const PARTY_PORTAL_DOCUMENT_TYPES = [
  'HAWB',
  'MAWB',
  'HBL',
  'MBL',
  'INVOICE',
  'CREDIT_NOTE',
  'STATEMENT',
  'CAN',
  'DO',
  'POD',
  'PRE_ALERT',
  'OTHER',
] as const;

export type PartyPortalDocumentType = (typeof PARTY_PORTAL_DOCUMENT_TYPES)[number];

export const PARTY_PORTAL_DOCUMENT_TYPE_LABELS: Record<PartyPortalDocumentType, string> = {
  HAWB: 'HAWB',
  MAWB: 'MAWB',
  HBL: 'HBL',
  MBL: 'MBL',
  INVOICE: 'Invoice',
  CREDIT_NOTE: 'Credit note',
  STATEMENT: 'Statement',
  CAN: 'CAN',
  DO: 'D/O',
  POD: 'POD',
  PRE_ALERT: 'Pre-alert',
  OTHER: 'Other',
};

