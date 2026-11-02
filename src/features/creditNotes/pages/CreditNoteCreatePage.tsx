import { useMemo, useState } from 'react';
import { appType } from '@/lib/erpTypography';
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
  const prefillJobId = searchParams.get('job')?.trim() ?? '';
  const prefillPartyId = searchParams.get('party')?.trim() ?? '';
  const defaultValues = useMemo(() => {
    const next: Partial<CreateCreditNoteFormValues> = {};
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
        onClick={() => navigate(CREDIT_NOTE_ROUTE_PREFIX)}
      >
        ← Back to credit notes
      </button>
      <div>
        <h2 className={appType.pageTitle}>New credit note</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Create against a posted invoice, or with job + party for the job ledger (e.g. advance
          received — no invoice). After save, upload the payment proof on the detail page.
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
