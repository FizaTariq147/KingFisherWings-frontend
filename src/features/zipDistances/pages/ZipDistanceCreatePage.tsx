import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZIP_DISTANCE_ROUTE_PREFIX } from '../api/zipDistance.api';
import { ZipDistanceForm } from '../components/ZipDistanceForm';
import { useCreateZipDistance } from '../hooks/useZipDistances';
import type { CreateZipDistanceFormValues } from '../types/zipDistance.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ZipDistanceCreatePage() {
  const navigate = useNavigate();
  const create = useCreateZipDistance();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(ZIP_DISTANCE_ROUTE_PREFIX)}
      >
        ← Back to zip distances
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          Create zip distance
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Record distance between two zip / location codes.
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
      <ZipDistanceForm
        mode="create"
        isSubmitting={create.isPending}
        onCancel={() => navigate(ZIP_DISTANCE_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateZipDistanceFormValues);
            navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
