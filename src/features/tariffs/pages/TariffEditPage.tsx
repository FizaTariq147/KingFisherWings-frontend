import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { TARIFF_ROUTE_PREFIX } from '../api/tariff.api';
import { TariffForm } from '../components/TariffForm';
import { useTariff, useUpdateTariff } from '../hooks/useTariffs';
import type { UpdateTariffFormValues } from '../types/tariff.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { tariffToFormValues } from '../utils/tariffToFormValues';

export default function TariffEditPage() {
  const { id = '' } = useParams();
  const { goBack } = useReturnNavigation(`${TARIFF_ROUTE_PREFIX}/${id}`);
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
      <FormPageHeader
        title="Edit tariff"
        subtitle="Update rates, lane, or validity for this tariff card."
        onBack={goBack}
      />
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
        onCancel={goBack}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateTariffFormValues);
            goBack();
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
