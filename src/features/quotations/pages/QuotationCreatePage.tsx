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
    const raw = localStorage.getItem(QUOTATION_CREATE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<CreateQuotationFormValues>;
  } catch {
    return null;
  }
}

function saveDraft(values: CreateQuotationFormValues) {
  try {
    localStorage.setItem(QUOTATION_CREATE_DRAFT_KEY, JSON.stringify(values));
  } catch {
    // ignore quota
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(QUOTATION_CREATE_DRAFT_KEY);
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
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create quotation</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Creates a DRAFT quotation. Add charge lines on the detail page after save.
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
      <QuotationForm
        mode="create"
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
