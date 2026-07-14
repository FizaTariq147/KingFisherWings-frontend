import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AWB_STOCK_ROUTE_PREFIX } from '../api/awbStock.api';
import { AwbStockErrorBanner } from '../components/AwbStockBanners';
import { AwbStockForm } from '../components/AwbStockForm';
import { useCreateAwbStockBatch } from '../hooks/useAwbStock';
import type { CreateAwbStockBatchFormValues } from '../types/awbStock.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function AwbStockCreatePage() {
  const navigate = useNavigate();
  const create = useCreateAwbStockBatch();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(AWB_STOCK_ROUTE_PREFIX)}
      >
        ← Back to AWB stock
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          Register AWB stock batch
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Register a new AWB number range for an airline. Start must be less than end.
        </p>
      </div>
      {error ? <AwbStockErrorBanner message={error} /> : null}
      <AwbStockForm
        mode="create"
        isSubmitting={create.isPending}
        onCancel={() => navigate(AWB_STOCK_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateAwbStockBatchFormValues);
            navigate(`${AWB_STOCK_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
