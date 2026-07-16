export const DEFAULT_AWB_STOCK_PAGE_SIZE = 20;

export const AWB_ALLOCATION_STATUSES = [
  'ALLOCATED',
  'USED',
  'VOID',
  'AVAILABLE',
] as const;

export type AwbAllocationStatus = (typeof AWB_ALLOCATION_STATUSES)[number];

export const AWB_ALLOCATION_STATUS_LABELS: Record<string, string> = {
  ALLOCATED: 'Allocated',
  USED: 'Used',
  VOID: 'Void',
  AVAILABLE: 'Available',
};
