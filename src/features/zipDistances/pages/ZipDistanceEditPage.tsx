import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { ZIP_DISTANCE_ROUTE_PREFIX } from '../api/zipDistance.api';
import { ZipDistanceForm } from '../components/ZipDistanceForm';
import { useUpdateZipDistance, useZipDistance } from '../hooks/useZipDistances';
import type { UpdateZipDistanceFormValues } from '../types/zipDistance.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { zipDistanceToFormValues } from '../utils/zipDistanceToFormValues';

export default function ZipDistanceEditPage() {
  const { id = '' } = useParams();
  const { goBack } = useReturnNavigation(`${ZIP_DISTANCE_ROUTE_PREFIX}/${id}`);
  const { data: item, isLoading, isError, error } = useZipDistance(id);
  const update = useUpdateZipDistance(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !item) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Zip distance not found.'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <FormPageHeader
        title={"Edit zip distance"}
        subtitle={"Update zip codes, cities, distance, or status."}
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
      <ZipDistanceForm
        mode="edit"
        defaultValues={zipDistanceToFormValues(item)}
        isSubmitting={update.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateZipDistanceFormValues);
            goBack();
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
