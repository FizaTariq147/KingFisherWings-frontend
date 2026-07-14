import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuotationForm } from '../components/QuotationForm';
import { useQuotation, useUpdateQuotation } from '../hooks/useQuotations';
import type { UpdateQuotationFormValues } from '../types/quotation.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { quotationToFormValues } from '../utils/quotationToFormValues';

export default function QuotationEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading, isError, error } = useQuotation(id);
  const update = useUpdateQuotation(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  if (isError || !quotation) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Quotation not found.'}
      </p>
    );
  }

  const editable = quotation.status === 'DRAFT' || quotation.status === 'REJECTED';
  if (!editable) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-neutral-600)]">
          Only DRAFT or REJECTED quotations can be edited. Current status: {quotation.status}.
        </p>
        <button
          type="button"
          className="text-sm text-[var(--color-primary-600)]"
          onClick={() => navigate(`/quotations/${id}`)}
        >
          ← Back to detail
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`/quotations/${id}`)}
      >
        ← Back to detail
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit quotation</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Update header fields for this DRAFT / REJECTED quotation.
        </p>
      </div>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {formError}
        </div>
      )}
      <QuotationForm
        mode="edit"
        defaultValues={quotationToFormValues(quotation)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`/quotations/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateQuotationFormValues);
            navigate(`/quotations/${id}`);
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
