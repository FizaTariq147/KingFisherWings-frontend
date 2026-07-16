export const PARTY_TYPES = [
  'CUSTOMER',
  'AGENT',
  'AIRLINE',
  'SHIPPING_LINE',
  'TRUCKER',
  'CUSTOMS_BROKER',
  'CFS_PORT_AGENT',
  'WAREHOUSE',
  'SUPPLIER',
  'OVERSEAS_AGENT',
  'OTHER',
] as const;

export type PartyType = (typeof PARTY_TYPES)[number];

export const CREDIT_STATUSES = ['ACTIVE', 'ON_HOLD', 'BLACKLISTED'] as const;
export type CreditStatus = (typeof CREDIT_STATUSES)[number];

export const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  CUSTOMER: 'Customer',
  AGENT: 'Agent',
  AIRLINE: 'Airline',
  SHIPPING_LINE: 'Shipping Line',
  TRUCKER: 'Trucker',
  CUSTOMS_BROKER: 'Customs Broker',
  CFS_PORT_AGENT: 'CFS / Port Agent',
  WAREHOUSE: 'Warehouse',
  SUPPLIER: 'Supplier',
  OVERSEAS_AGENT: 'Overseas Agent',
  OTHER: 'Other',
};

export const CREDIT_STATUS_LABELS: Record<CreditStatus, string> = {
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  BLACKLISTED: 'Blacklisted',
};

export const DEFAULT_PARTY_PAGE_SIZE = 20;
