import { z } from 'zod';
import { optionalTextUndef, requiredUuid } from '@/lib/validation';
import { createInvoiceLineSchema } from '@/features/invoices/schemas/invoice.schema';

export { createInvoiceLineSchema };

/** CreateDebitNoteDto — credited_invoice_id is the original customer invoice being debited. */
export const createDebitNoteSchema = z.object({
  credited_invoice_id: requiredUuid('Debited invoice'),
  remarks: optionalTextUndef({ max: 2000 }),
  lines: z.array(createInvoiceLineSchema).optional(),
});

export type CreateDebitNoteFormValues = z.infer<typeof createDebitNoteSchema>;
export type CreateDebitNoteLineFormValues = z.infer<typeof createInvoiceLineSchema>;
