import { useMemo, useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { DEBIT_NOTE_ROUTE_PREFIX } from '../api/debitNote.api';
import { DebitNoteForm } from '../components/DebitNoteForm';
import { useCreateDebitNote } from '../hooks/useDebitNotes';
import type { CreateDebitNoteFormValues } from '../types/debitNote.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function DebitNoteCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const create = useCreateDebitNote();
  const [error, setError] = useState<string | null>(null);

  const prefillInvoiceId = searchParams.get('invoice')?.trim() ?? '';
  const prefillJobId = searchParams.get('job')?.trim() ?? '';
  const prefillPartyId = searchParams.get('party')?.trim() ?? '';
  const defaultValues = useMemo(() => {
    const next: Partial<CreateDebitNoteFormValues> = {};
    if (prefillInvoiceId && isUuid(prefillInvoiceId)) {
      next.credited_invoice_id = prefillInvoiceId;
    }
    if (prefillJobId && isUuid(prefillJobId)) next.job_id = prefillJobId;
    if (prefillPartyId && isUuid(prefillPartyId)) next.party_id = prefillPartyId;
    return Object.keys(next).length ? next : undefined;
  }, [prefillInvoiceId, prefillJobId, prefillPartyId]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(DEBIT_NOTE_ROUTE_PREFIX)}
      >
        ← Back to debit notes
      </button>
      <div>
        <h2 className={appType.pageTitle}>New debit note</h2>
        <p className="mt-0.5 text-sm text-[var(--color-neutral-400)]">
          Create against a posted invoice, or with job + party for the job ledger.
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

      <DebitNoteForm
        defaultValues={defaultValues}
        isSubmitting={create.isPending}
        onCancel={() => navigate(DEBIT_NOTE_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateDebitNoteFormValues);
            navigate(`${DEBIT_NOTE_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
