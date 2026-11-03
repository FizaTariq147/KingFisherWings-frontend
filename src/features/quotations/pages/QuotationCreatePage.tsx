import { useCallback, useMemo, useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useStaffAllowedJobTypes } from '@/features/jobs/hooks/useStaffAllowedJobTypes';
import type { JobType as OpsJobType } from '@/features/jobs/constants/job.constants';
import { QuotationForm } from '../components/QuotationForm';
import { JOB_TYPES, QUOTATION_CREATE_DRAFT_KEY } from '../constants/quotation.constants';
import { quotationKeys, useCreateQuotation } from '../hooks/useQuotations';
import type { CreateQuotationFormValues } from '../types/quotation.types';
import type { QuotationWizardCostingPayload } from '../types/quotationWizardCosting.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { persistQuotationWizardCosting } from '../utils/persistQuotationWizardCosting';
import { QUOTATION_FORM_DEFAULTS } from '../utils/quotationToFormValues';

const QUOTE_JOB_TYPE_CANDIDATES = JOB_TYPES as readonly OpsJobType[];

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
  const allowedJobTypes = useStaffAllowedJobTypes(QUOTE_JOB_TYPE_CANDIDATES);
  const draft = useMemo(() => loadDraft(), []);

  const defaultValues = useMemo(() => {
    const merged = { ...QUOTATION_FORM_DEFAULTS, ...draft };
    const jt = String(merged.job_type ?? '');
    if (allowedJobTypes.length && !allowedJobTypes.includes(jt as OpsJobType)) {
      return { ...merged, job_type: allowedJobTypes[0] };
    }
    return merged;
  }, [draft, allowedJobTypes]);

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
        <h2 className={appType.pageTitle}>Create Quotation</h2>
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
      {allowedJobTypes.length === 0 ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          No quotation types are available for your departments. Ask an admin to grant Air Import /
          Air Export (or other operations) access.
        </div>
      ) : (
        <QuotationForm
          mode="create"
          layout="wizard"
          jobTypeOptions={allowedJobTypes}
          defaultValues={defaultValues}
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
                  void queryClient.invalidateQueries({
                    queryKey: quotationKeys.detail(quotation.id),
                  });
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
      )}
    </div>
  );
}
