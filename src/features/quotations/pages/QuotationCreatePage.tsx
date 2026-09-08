import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotationForm } from '../components/QuotationForm';
import { QUOTATION_CREATE_DRAFT_KEY } from '../constants/quotation.constants';
import { useCreateQuotation } from '../hooks/useQuotations';
import type { CreateQuotationFormValues } from '../types/quotation.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { QUOTATION_FORM_DEFAULTS } from '../utils/quotationToFormValues';

function loadDraft(): Partial<CreateQuotationFormValues> | null {
  try {
    const raw = sessionStorage.getItem(QUOTATION_CREATE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<CreateQuotationFormValues>;
  } catch {
    return null;
  }
}

function saveDraft(values: CreateQuotationFormValues) {
  try {
    sessionStorage.setItem(QUOTATION_CREATE_DRAFT_KEY, JSON.stringify(values));
  } catch {
    // ignore quota
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(QUOTATION_CREATE_DRAFT_KEY);
  } catch {
    // ignore
  }
}

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const create = useCreateQuotation();
  const [error, setError] = useState<string | null>(null);
  const draft = useMemo(() => loadDraft(), []);

  const onValuesChange = useCallback((values: CreateQuotationFormValues) => {
    saveDraft(values);
  }, []);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate('/quotations/all')}
      >
        ← Back to quotations
      </button>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create Quotation</h2>
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
      <QuotationForm
        mode="create"
        layout="wizard"
        defaultValues={{ ...QUOTATION_FORM_DEFAULTS, ...draft }}
        isSubmitting={create.isPending}
        onValuesChange={onValuesChange}
        onCancel={() => navigate('/quotations/all')}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateQuotationFormValues);
            clearDraft();
            navigate(`/quotations/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
