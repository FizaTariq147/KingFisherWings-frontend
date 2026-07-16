import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CHEQUE_ROUTE_PREFIX } from '../api/cheque.api';
import { ChequeForm } from '../components/ChequeForm';
import { useCheque, useUpdateCheque } from '../hooks/useGlCheques';
import type { UpdateChequeFormValues } from '../types/cheque.types';
import { chequeToFormValues } from '../utils/chequeToFormValues';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ChequeEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
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
          onClick={() => navigate(`${CHEQUE_ROUTE_PREFIX}/${id}`)}
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
        onClick={() => navigate(`${CHEQUE_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to cheque
      </button>
      <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit cheque</h2>
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
        onCancel={() => navigate(`${CHEQUE_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setSaveError(null);
          try {
            await update.mutateAsync(values as UpdateChequeFormValues);
            navigate(`${CHEQUE_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setSaveError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
