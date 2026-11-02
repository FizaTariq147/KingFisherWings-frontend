import { z } from 'zod';
import { optionalTextUndef, optionalUuid } from '@/lib/validation';
import { createInvoiceLineSchema } from '@/features/invoices/schemas/invoice.schema';

export { createInvoiceLineSchema };

/** CreateDebitNoteDto — invoice optional when job_id + party_id are set. */
export const createDebitNoteSchema = z
  .object({
    credited_invoice_id: optionalUuid(),
    job_id: optionalUuid(),
    party_id: optionalUuid(),
    currency_code: z.string().trim().length(3).optional().or(z.literal('')),
    remarks: optionalTextUndef({ max: 2000 }),
    lines: z.array(createInvoiceLineSchema).optional(),
  })
  .superRefine((val, ctx) => {
    const hasInvoice = Boolean(val.credited_invoice_id);
    const hasJobParty = Boolean(val.job_id && val.party_id);
    if (!hasInvoice && !hasJobParty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a debited invoice, or both job and party.',
        path: ['credited_invoice_id'],
      });
    }
  });

export type CreateDebitNoteFormValues = z.infer<typeof createDebitNoteSchema>;
export type CreateDebitNoteLineFormValues = z.infer<typeof createInvoiceLineSchema>;
