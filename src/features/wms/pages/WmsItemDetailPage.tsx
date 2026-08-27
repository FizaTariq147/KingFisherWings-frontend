import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useDeleteWmsItem, useWmsItem } from '../hooks/useWms';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsItemDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading, isError, error } = useWmsItem(id);
  const deleteMutation = useDeleteWmsItem();

  const handleDelete = async () => {
    if (!item || !window.confirm(`Delete item "${item.code}"?`)) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      navigate(`${WMS_ROUTE_PREFIX}/items`);
    } catch {
      // mutation error surfaced via isError if needed
    }
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={`${WMS_ROUTE_PREFIX}/items`}
        backLabel="Items"
        title={item?.code ?? 'Item detail'}
        description={item?.name}
        actions={
          item ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`${WMS_ROUTE_PREFIX}/items/${item.id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          ) : null
        }
      />

      <Card className="max-w-xl space-y-3 p-4 text-sm">
        {isLoading ? (
          <p className="text-[var(--color-neutral-400)]">Loading…</p>
        ) : isError ? (
          <p className="text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : item ? (
          <>
            <Row label="Code" value={item.code} />
            <Row label="Name" value={item.name} />
            <Row label="Description" value={item.description ?? '—'} />
            <Row label="UOM" value={item.uom_code ?? '—'} />
            <Row label="Low stock threshold" value={String(item.low_stock_threshold ?? '—')} />
            <Row label="Active" value={item.is_active ? 'Yes' : 'No'} />
          </>
        ) : (
          <p className="text-[var(--color-neutral-400)]">Item not found.</p>
        )}
        {deleteMutation.isError ? (
          <p className="text-[var(--color-danger-600)]">{getErrorMessage(deleteMutation.error)}</p>
        ) : null}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-[var(--color-neutral-100)] py-2 last:border-0">
      <span className="w-40 shrink-0 text-[var(--color-neutral-500)]">{label}</span>
      <span className="text-[var(--color-neutral-800)]">{value}</span>
    </div>
  );
}
