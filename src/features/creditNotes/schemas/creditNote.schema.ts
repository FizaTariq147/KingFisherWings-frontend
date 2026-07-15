import { z } from 'zod';
import { optionalTextUndef, requiredUuid } from '@/lib/validation';
import { createInvoiceLineSchema } from '@/features/invoices/schemas/invoice.schema';

export { createInvoiceLineSchema };

export const createCreditNoteSchema = z.object({
  credited_invoice_id: requiredUuid('Credited invoice'),
  remarks: optionalTextUndef({ max: 2000 }),
  lines: z.array(createInvoiceLineSchema).optional(),
});

export type CreateCreditNoteFormValues = z.infer<typeof createCreditNoteSchema>;
export type CreateCreditNoteLineFormValues = z.infer<typeof createInvoiceLineSchema>;
