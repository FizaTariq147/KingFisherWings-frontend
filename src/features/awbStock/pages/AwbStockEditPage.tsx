import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { AWB_STOCK_ROUTE_PREFIX } from '../api/awbStock.api';
import { AwbStockErrorBanner } from '../components/AwbStockBanners';
import { AwbStockForm } from '../components/AwbStockForm';
import { useAwbStockBatch, useUpdateAwbStockBatch } from '../hooks/useAwbStock';
import type { UpdateAwbStockBatchFormValues } from '../types/awbStock.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { batchToFormValues } from '../utils/prepareAwbStockPayload';

export default function AwbStockEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: batch, isLoading, isError, error, refetch } = useAwbStockBatch(id);
  const update = useUpdateAwbStockBatch(id);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>;
  }
  if (isError || !batch) {
    return (
      <div className="space-y-3 py-8">
        <AwbStockErrorBanner message={getErrorMessage(error) || 'Batch not found.'} />
        <Button type="button" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <button
          type="button"
          className="block text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
          onClick={() => navigate(AWB_STOCK_ROUTE_PREFIX)}
        >
          ← Back to AWB stock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${AWB_STOCK_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to batch
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          Edit AWB stock batch
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Range and airline cannot be changed after registration. Update threshold and notes only.
        </p>
      </div>
      {saveError ? <AwbStockErrorBanner message={saveError} /> : null}
      <AwbStockForm
        mode="edit"
        defaultValues={batchToFormValues(batch)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${AWB_STOCK_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setSaveError(null);
          try {
            await update.mutateAsync(values as UpdateAwbStockBatchFormValues);
            navigate(`${AWB_STOCK_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setSaveError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
