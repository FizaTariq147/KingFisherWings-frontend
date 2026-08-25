import { z } from 'zod';
import { optionalTextUndef } from '@/lib/validation';

export const reviewVendorDisputeSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED']),
  staff_notes: optionalTextUndef({ max: 2000 }),
});

export type ReviewVendorDisputeFormValues = z.infer<typeof reviewVendorDisputeSchema>;
