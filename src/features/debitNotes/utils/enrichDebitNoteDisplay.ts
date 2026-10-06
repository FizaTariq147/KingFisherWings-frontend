import { isUuid } from '@/lib/isUuid';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import { partyService } from '@/features/parties/services/party.service';
import type { DebitNote } from '../types/debitNote.types';

function humanLabel(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isUuid(trimmed)) return undefined;
  return trimmed;
}

/**
 * Resolve party names and debited invoice numbers when the list API only returns IDs.
 */
export async function enrichDebitNotesDisplay(notes: DebitNote[]): Promise<DebitNote[]> {
  if (!notes.length) return notes;

  const partyIds = [
    ...new Set(
      notes
        .filter((n) => !humanLabel(n.party_name) && n.party_id && isUuid(n.party_id))
        .map((n) => n.party_id as string),
    ),
  ];
  const invoiceIds = [
    ...new Set(
      notes
        .filter(
          (n) =>
            !humanLabel(n.credited_invoice_number) &&
            n.credited_invoice_id &&
            isUuid(n.credited_invoice_id),
        )
        .map((n) => n.credited_invoice_id as string),
    ),
  ];

  const [partyEntries, invoiceEntries] = await Promise.all([
    Promise.all(
      partyIds.map(async (id) => {
        try {
          const party = await partyService.getById(id);
          return [id, party.name] as const;
        } catch {
          return [id, undefined] as const;
        }
      }),
    ),
    Promise.all(
      invoiceIds.map(async (id) => {
        try {
          const inv = await invoiceService.getById(id);
          return [
            id,
            {
              number: humanLabel(invoiceDisplayNumber(inv)) ?? humanLabel(inv.invoice_number),
              partyName: humanLabel(inv.party_name),
              partyId: inv.party_id,
            },
          ] as const;
        } catch {
          return [id, undefined] as const;
        }
      }),
    ),
  ]);

  const partyById = new Map(partyEntries);
  const invoiceById = new Map(invoiceEntries);

  return notes.map((note) => {
    const inv = note.credited_invoice_id
      ? invoiceById.get(note.credited_invoice_id)
      : undefined;
    const partyName =
      humanLabel(note.party_name) ||
      (note.party_id ? partyById.get(note.party_id) : undefined) ||
      inv?.partyName;
    const creditedNumber =
      humanLabel(note.credited_invoice_number) || inv?.number;
    if (partyName === note.party_name && creditedNumber === note.credited_invoice_number) {
      return note;
    }
    return {
      ...note,
      party_name: partyName || note.party_name,
      credited_invoice_number: creditedNumber || note.credited_invoice_number,
      party_id: note.party_id || inv?.partyId,
    };
  });
}
