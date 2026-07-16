export const PARTY_API = {
  list: '/parties',
  byId: (id: string) => `/parties/${id}`,
  creditStatus: (id: string) => `/parties/${id}/credit-status`,
  contacts: (id: string) => `/parties/${id}/contacts`,
  contactById: (id: string, contactId: string) => `/parties/${id}/contacts/${contactId}`,
  addresses: (id: string) => `/parties/${id}/addresses`,
  addressById: (id: string, addressId: string) => `/parties/${id}/addresses/${addressId}`,
  import: '/parties/import',
} as const;
