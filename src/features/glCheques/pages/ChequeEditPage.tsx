import { useState } from 'react';
import { appType } from '@/lib/erpTypography';
import { useParams } from 'react-router-dom';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { Button } from '@/components/ui/Button';
import { CHEQUE_ROUTE_PREFIX } from '../api/cheque.api';
import { ChequeForm } from '../components/ChequeForm';
import { useCheque, useUpdateCheque } from '../hooks/useGlCheques';
import type { UpdateChequeFormValues } from '../types/cheque.types';
import { chequeToFormValues } from '../utils/chequeToFormValues';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ChequeEditPage() {
  const { id = '' } = useParams();
  const { goBack } = useReturnNavigation(`${CHEQUE_ROUTE_PREFIX}/${id}`);
  const { data: cheque, isLoading, isError, error } = useCheque(id);
  const update = useUpdateCheque(id);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !cheque) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Cheque not found.'}
      </p>
    );
  }

  if (cheque.status !== 'PENDING') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          Only pending cheques can be edited.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => goBack()}
        >
          View cheque
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => goBack()}
      >
        ← Back to cheque
      </button>
      <h2 className={appType.pageTitle}>Edit cheque</h2>
      {saveError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {saveError}
        </div>
      )}
      <ChequeForm
        mode="edit"
        defaultValues={chequeToFormValues(cheque)}
        isSubmitting={update.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          setSaveError(null);
          try {
            await update.mutateAsync(values as UpdateChequeFormValues);
            goBack();
          } catch (err) {
            setSaveError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
