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
  portalUserResendInvite: (partyId: string, id: string) =>
    `/parties/${partyId}/portal-users/${id}/resend-invite`,
  /** Parties → portal document rights */
  portalPermissions: (partyId: string) => `/parties/${partyId}/portal-permissions`,
  portalPermissionsReset: (partyId: string) =>
    `/parties/${partyId}/portal-permissions/reset-defaults`,
  /** Parties → vendor portal users (docs#/Parties + Admin — Vendor Portal Users) */
  vendorUsers: (partyId: string) => `/parties/${partyId}/vendor-users`,
  vendorUserStatus: (partyId: string, id: string) =>
    `/parties/${partyId}/vendor-users/${id}/status`,
  vendorUserResetPassword: (partyId: string, id: string) =>
    `/parties/${partyId}/vendor-users/${id}/reset-password`,
  vendorUserResendInvite: (partyId: string, id: string) =>
    `/parties/${partyId}/vendor-users/${id}/resend-invite`,
  /** Parties → vendor document rights */
  vendorPermissions: (partyId: string) => `/parties/${partyId}/vendor-permissions`,
  /** Customer transaction summary (may 404 until backend ships). */
  transactionSummary: (id: string) => `/parties/${id}/transaction-summary`,
  sendTransactionSummary: (id: string) => `/parties/${id}/transaction-summary/send`,
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

/** Vendor portal document rights (docs VendorPermissionEntryDto). */
export const PARTY_VENDOR_DOCUMENT_TYPES = [
  'PURCHASE_INVOICE',
  'REMITTANCE',
  'CREDIT_NOTE',
  'STATEMENT',
  'TDS_CERTIFICATE',
] as const;

export type PartyVendorDocumentType = (typeof PARTY_VENDOR_DOCUMENT_TYPES)[number];

export const PARTY_VENDOR_DOCUMENT_TYPE_LABELS: Record<PartyVendorDocumentType, string> = {
  PURCHASE_INVOICE: 'Purchase invoice',
  REMITTANCE: 'Remittance',
  CREDIT_NOTE: 'Credit note',
  STATEMENT: 'Statement',
  TDS_CERTIFICATE: 'TDS certificate',
};

