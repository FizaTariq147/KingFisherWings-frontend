import type { CreateCreditNoteFormValues } from '../types/creditNote.types';
import type { CreateCreditNoteLineFormValues } from '../schemas/creditNote.schema';

/** Swagger `CreateCreditNoteDto` — only documented fields. */
export function buildCreditNoteDemoValues(refs: {
  creditedInvoiceId: string;
  lines?: CreateCreditNoteLineFormValues[];
}): CreateCreditNoteFormValues {
  return {
    credited_invoice_id: refs.creditedInvoiceId,
    remarks: 'Demo credit note against posted customer invoice',
    lines: refs.lines ?? [
      {
        description: 'Ocean Freight',
        quantity: 1,
        unit_price: 1500,
        is_taxable: true,
        sort_order: 0,
      },
    ],
  };
}
