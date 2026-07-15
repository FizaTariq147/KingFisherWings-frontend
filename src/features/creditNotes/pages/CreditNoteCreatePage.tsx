import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { CREDIT_NOTE_ROUTE_PREFIX } from '../api/creditNote.api';
import { CreditNoteForm } from '../components/CreditNoteForm';
import { useCreateCreditNote } from '../hooks/useCreditNotes';
import type { CreateCreditNoteFormValues } from '../types/creditNote.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function CreditNoteCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const create = useCreateCreditNote();
  const [error, setError] = useState<string | null>(null);

  const prefillInvoiceId = searchParams.get('invoice')?.trim() ?? '';
  const defaultValues = useMemo(() => {
    if (prefillInvoiceId && isUuid(prefillInvoiceId)) {
      return { credited_invoice_id: prefillInvoiceId };
    }
    return undefined;
  }, [prefillInvoiceId]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(CREDIT_NOTE_ROUTE_PREFIX)}
      >
        ← Back to credit notes
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">New credit note</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Create a credit note against a posted customer invoice.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}

      <CreditNoteForm
        defaultValues={defaultValues}
        isSubmitting={create.isPending}
        onCancel={() => navigate(CREDIT_NOTE_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateCreditNoteFormValues);
            navigate(`${CREDIT_NOTE_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
