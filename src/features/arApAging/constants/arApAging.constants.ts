export const AGING_BUCKET_LABELS = {
  current: 'Current',
  days_1_30: '1–30 days',
  days_31_60: '31–60 days',
  days_61_90: '61–90 days',
  days_over_90: 'Over 90 days',
  total: 'Total',
} as const;

export type AgingBucketKey = keyof typeof AGING_BUCKET_LABELS;
