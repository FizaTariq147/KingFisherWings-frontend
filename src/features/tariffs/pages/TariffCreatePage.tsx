import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TARIFF_ROUTE_PREFIX } from '../api/tariff.api';
import { TariffForm } from '../components/TariffForm';
import { useCreateTariff } from '../hooks/useTariffs';
import type { CreateTariffFormValues } from '../types/tariff.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function TariffCreatePage() {
  const navigate = useNavigate();
  const create = useCreateTariff();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(TARIFF_ROUTE_PREFIX)}
      >
        ← Back to tariffs
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create tariff</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Add a sale/cost rate card for a service lane and charge code.
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
      <TariffForm
        mode="create"
        isSubmitting={create.isPending}
        onCancel={() => navigate(TARIFF_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateTariffFormValues);
            navigate(`${TARIFF_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
