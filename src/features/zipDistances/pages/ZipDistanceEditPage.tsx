import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ZIP_DISTANCE_ROUTE_PREFIX } from '../api/zipDistance.api';
import { ZipDistanceForm } from '../components/ZipDistanceForm';
import { useUpdateZipDistance, useZipDistance } from '../hooks/useZipDistances';
import type { UpdateZipDistanceFormValues } from '../types/zipDistance.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { zipDistanceToFormValues } from '../utils/zipDistanceToFormValues';

export default function ZipDistanceEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
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
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to detail
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit zip distance</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Update zip codes, cities, distance, or status.
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
      <ZipDistanceForm
        mode="edit"
        defaultValues={zipDistanceToFormValues(item)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateZipDistanceFormValues);
            navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
