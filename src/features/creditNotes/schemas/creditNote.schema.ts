import { z } from 'zod';
import { emptyToUndefined, optionalTextUndef, optionalUuid } from '@/lib/validation';
import { createInvoiceLineSchema } from '@/features/invoices/schemas/invoice.schema';

export { createInvoiceLineSchema };

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

export const createCreditNoteSchema = z
  .object({
    /** Optional when job_id + party_id are set (job ledger CN without invoice). */
    credited_invoice_id: optionalUuid(),
    job_id: optionalUuid(),
    party_id: optionalUuid(),
    currency_code: z.string().trim().length(3).optional().or(z.literal('')),
    invoice_date: optionalDate,
    /** Shown on AR statements (stored as Invoice.remarks). Alias of remarks. */
    description: optionalTextUndef({ max: 2000 }),
    remarks: optionalTextUndef({ max: 2000 }),
    lines: z.array(createInvoiceLineSchema).optional(),
  })
  .superRefine((val, ctx) => {
    const hasInvoice = Boolean(val.credited_invoice_id);
    const hasJobParty = Boolean(val.job_id && val.party_id);
    if (!hasInvoice && !hasJobParty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a credited invoice, or both job and party.',
        path: ['credited_invoice_id'],
      });
    }
  });

export type CreateCreditNoteFormValues = z.infer<typeof createCreditNoteSchema>;
export type CreateCreditNoteLineFormValues = z.infer<typeof createInvoiceLineSchema>;
