import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TARIFF_ROUTE_PREFIX } from '../api/tariff.api';
import { TariffForm } from '../components/TariffForm';
import { useTariff, useUpdateTariff } from '../hooks/useTariffs';
import type { UpdateTariffFormValues } from '../types/tariff.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { tariffToFormValues } from '../utils/tariffToFormValues';

export default function TariffEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: tariff, isLoading, isError, error } = useTariff(id);
  const update = useUpdateTariff(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !tariff) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Tariff not found.'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${TARIFF_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to detail
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit tariff</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Update rates, lane, or validity for this tariff card.
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
      <TariffForm
        mode="edit"
        defaultValues={tariffToFormValues(tariff)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${TARIFF_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateTariffFormValues);
            navigate(`${TARIFF_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
