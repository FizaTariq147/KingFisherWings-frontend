import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QuotationForm } from '../components/QuotationForm';
import { QUOTATION_CREATE_DRAFT_KEY } from '../constants/quotation.constants';
import { quotationKeys, useCreateQuotation } from '../hooks/useQuotations';
import type { CreateQuotationFormValues } from '../types/quotation.types';
import type { QuotationWizardCostingPayload } from '../types/quotationWizardCosting.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { persistQuotationWizardCosting } from '../utils/persistQuotationWizardCosting';
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
  const queryClient = useQueryClient();
  const create = useCreateQuotation();
  const [error, setError] = useState<string | null>(null);
  const [persistingCosting, setPersistingCosting] = useState(false);
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
        isSubmitting={create.isPending || persistingCosting}
        onValuesChange={onValuesChange}
        onCancel={() => navigate('/quotations/all')}
        onSubmit={async (values, options) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateQuotationFormValues);
            const costing = options?.costing as QuotationWizardCostingPayload | undefined;
            let targetId = created.id;
            let costingWarnings: string[] | undefined;

            if (costing && (costing.apply_tariff || costing.lines.length > 0)) {
              setPersistingCosting(true);
              try {
                const { quotation, warnings } = await persistQuotationWizardCosting(
                  created.id,
                  costing,
                );
                targetId = quotation.id;
                queryClient.setQueryData(quotationKeys.detail(quotation.id), quotation);
                void queryClient.invalidateQueries({ queryKey: quotationKeys.detail(quotation.id) });
                if (warnings.length) costingWarnings = warnings;
              } finally {
                setPersistingCosting(false);
              }
            }

            clearDraft();
            navigate(`/quotations/${targetId}`, {
              state: costingWarnings?.length ? { costingWarnings } : undefined,
            });
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
