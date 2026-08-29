export const NVOCC_PAGE_SIZE = 20;

export const NVOCC_TARIFF_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type NvoccTariffStatus = (typeof NVOCC_TARIFF_STATUSES)[number];

export const NVOCC_VOYAGE_STATUSES = ['OPEN', 'FULL', 'SAILED', 'COMPLETED', 'CANCELLED'] as const;
export type NvoccVoyageStatus = (typeof NVOCC_VOYAGE_STATUSES)[number];

export const NVOCC_ENQUIRY_STATUSES = [
  'NEW',
  'RATE_SENT',
  'ACCEPTED',
  'CONVERTED',
  'LOST',
  'CANCELLED',
] as const;
export type NvoccEnquiryStatus = (typeof NVOCC_ENQUIRY_STATUSES)[number];

export const NVOCC_CARGO_TYPES = ['FCL', 'LCL'] as const;
export type NvoccCargoType = (typeof NVOCC_CARGO_TYPES)[number];

export const NVOCC_COMMODITY_TYPES = ['GENERAL', 'DG', 'REEFER', 'OOG'] as const;
export type NvoccCommodityType = (typeof NVOCC_COMMODITY_TYPES)[number];

export const NVOCC_CARGO_STATUSES = [
  'PENDING',
  'RECEIVED_AT_CFS',
  'STUFFED',
  'LOADED_ON_VESSEL',
  'MANIFESTED',
] as const;
export type NvoccCargoStatus = (typeof NVOCC_CARGO_STATUSES)[number];

export function nvoccLabel(value: string | undefined | null): string {
  if (!value) return '—';
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
