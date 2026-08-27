import { useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { isUuid } from '@/lib/isUuid';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { WmsStockTable } from '../components/WmsStockTable';
import {
  useAdjustWmsStock,
  useCreateWmsTransfer,
  usePostWmsTransfer,
  useWmsStockAging,
  useWmsStockLow,
  useWmsStockMovements,
  useWmsStockOnHand,
  useWmsTransfers,
} from '../hooks/useWms';
import {
  useWmsItemOptions,
  useWmsWarehouseOptions,
  WmsSelect,
} from '../components/WmsFormHelpers';
import { adjustStockSchema, createTransferSchema } from '../schemas/wms.schema';
import { getErrorMessage } from '../utils/getErrorMessage';

type StockTab =
  | 'on-hand'
  | 'movements'
  | 'low-stock'
  | 'lot-aging'
  | 'adjust'
  | 'transfers';

const TABS: Array<{ id: StockTab; label: string }> = [
  { id: 'on-hand', label: 'On hand' },
  { id: 'movements', label: 'Movements' },
  { id: 'low-stock', label: 'Low stock' },
  { id: 'lot-aging', label: 'Lot aging' },
  { id: 'adjust', label: 'Adjust' },
  { id: 'transfers', label: 'Transfers' },
];

export default function WmsStockPage() {
  const [tab, setTab] = useState<StockTab>('on-hand');
  const [warehouseId, setWarehouseId] = useState('');
  const [itemId, setItemId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filterParams = {
    warehouse_id: isUuid(warehouseId) ? warehouseId : undefined,
    item_id: isUuid(itemId) ? itemId : undefined,
  };
  const movementParams = {
    ...filterParams,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  const onHandQuery = useWmsStockOnHand(filterParams, tab === 'on-hand');
  const movementsQuery = useWmsStockMovements(movementParams, tab === 'movements');
  const lowQuery = useWmsStockLow(filterParams, tab === 'low-stock');
  const agingQuery = useWmsStockAging(filterParams, tab === 'lot-aging');
  const transfersQuery = useWmsTransfers();

  const activeQuery =
    tab === 'on-hand'
      ? onHandQuery
      : tab === 'movements'
        ? movementsQuery
        : tab === 'low-stock'
          ? lowQuery
          : tab === 'lot-aging'
            ? agingQuery
            : null;

  const refetchActive = () => {
    activeQuery?.refetch();
    if (tab === 'transfers') transfersQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS Stock"
        description="On-hand, movements, low stock, lot aging, adjustments, and transfers."
        actions={
          tab !== 'adjust' && tab !== 'transfers' ? (
            <Button type="button" variant="secondary" onClick={refetchActive}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tab === t.id
                ? 'bg-[var(--color-primary-600)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'adjust' ? (
        <AdjustStockPanel />
      ) : tab === 'transfers' ? (
        <TransfersPanel />
      ) : (
        <Card className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <WarehouseFilter warehouseId={warehouseId} setWarehouseId={setWarehouseId} />
            <ItemFilter itemId={itemId} setItemId={setItemId} />
            {tab === 'movements' ? (
              <>
                <Input label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <Input label="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </>
            ) : null}
          </div>

          {activeQuery?.isError ? (
            <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(activeQuery.error)}</p>
          ) : (
            <WmsStockTable
              rows={
                tab === 'on-hand'
                  ? (onHandQuery.data ?? [])
                  : tab === 'movements'
                    ? (movementsQuery.data ?? [])
                    : tab === 'low-stock'
                      ? (lowQuery.data ?? [])
                      : (agingQuery.data ?? [])
              }
              isLoading={activeQuery?.isLoading}
              extraColumns={
                tab === 'lot-aging'
                  ? [{ key: 'age_days', label: 'Age (days)', render: (r) => String(r.age_days ?? r.days ?? '—') }]
                  : tab === 'movements'
                    ? [{ key: 'movement_type', label: 'Type', render: (r) => String(r.movement_type ?? r.type ?? '—') }]
                    : []
              }
            />
          )}
        </Card>
      )}
    </div>
  );
}

function WarehouseFilter({
  warehouseId,
  setWarehouseId,
}: {
  warehouseId: string;
  setWarehouseId: (v: string) => void;
}) {
  const { options } = useWmsWarehouseOptions();
  return (
    <WmsSelect
      label="Warehouse"
      value={warehouseId}
      onChange={setWarehouseId}
      options={[{ value: '', label: 'All warehouses' }, ...options.slice(1)]}
    />
  );
}

function ItemFilter({ itemId, setItemId }: { itemId: string; setItemId: (v: string) => void }) {
  const { options } = useWmsItemOptions();
  return (
    <WmsSelect
      label="Item"
      value={itemId}
      onChange={setItemId}
      options={[{ value: '', label: 'All items' }, ...options.slice(1)]}
    />
  );
}

function AdjustStockPanel() {
  const { options: warehouseOptions } = useWmsWarehouseOptions();
  const { options: itemOptions } = useWmsItemOptions();
  const adjustMutation = useAdjustWmsStock();
  const { fieldError, formError, setFormError, clearErrors, validate, revalidate, validatePath } =
    useInlineValidation();
  const [warehouseId, setWarehouseId] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const values = (
    patch: Partial<{
      warehouse_id: string;
      item_id: string;
      quantity: string;
      remarks: string;
    }> = {},
  ) => ({
    warehouse_id: patch.warehouse_id ?? warehouseId,
    item_id: patch.item_id ?? itemId,
    quantity: patch.quantity ?? quantity,
    remarks: patch.remarks ?? remarks,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setSuccess(null);
    const parsed = validate(adjustStockSchema, values());
    if (!parsed) return;
    try {
      await adjustMutation.mutateAsync(parsed);
      setSuccess('Stock adjusted.');
      setQuantity('');
      setRemarks('');
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <Card className="max-w-xl space-y-4 p-4">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <WmsSelect
          label="Warehouse"
          value={warehouseId}
          onChange={(v) => {
            setWarehouseId(v);
            revalidate(adjustStockSchema, values({ warehouse_id: v }));
          }}
          onBlur={() => validatePath(adjustStockSchema, values(), 'warehouse_id')}
          options={warehouseOptions}
          required
          error={fieldError('warehouse_id')}
        />
        <WmsSelect
          label="Item"
          value={itemId}
          onChange={(v) => {
            setItemId(v);
            revalidate(adjustStockSchema, values({ item_id: v }));
          }}
          onBlur={() => validatePath(adjustStockSchema, values(), 'item_id')}
          options={itemOptions}
          required
          error={fieldError('item_id')}
        />
        <Input
          label="Quantity (+/-)"
          type="number"
          step="any"
          value={quantity}
          error={fieldError('quantity')}
          onChange={(e) => {
            const next = e.target.value;
            setQuantity(next);
            revalidate(adjustStockSchema, values({ quantity: next }));
          }}
          onBlur={() => validatePath(adjustStockSchema, values(), 'quantity')}
          required
        />
        <Input
          label="Remarks"
          value={remarks}
          error={fieldError('remarks')}
          onChange={(e) => {
            const next = e.target.value;
            setRemarks(next);
            revalidate(adjustStockSchema, values({ remarks: next }));
          }}
          onBlur={() => validatePath(adjustStockSchema, values(), 'remarks')}
          required
        />
        <FieldError message={formError} />
        {success ? <p className="text-sm text-[var(--color-success-600)]">{success}</p> : null}
        <Button type="submit" disabled={adjustMutation.isPending}>
          <Save className="h-4 w-4" />
          Adjust stock
        </Button>
      </form>
    </Card>
  );
}

function TransfersPanel() {
  const { data: transfers = [], isLoading, refetch, isFetching } = useWmsTransfers();
  const createMutation = useCreateWmsTransfer();
  const postMutation = usePostWmsTransfer();
  const { options: warehouseOptions } = useWmsWarehouseOptions();
  const { options: itemOptions } = useWmsItemOptions();
  const { fieldError, formError, setFormError, clearErrors, validate, revalidate, validatePath } =
    useInlineValidation();

  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [remarks, setRemarks] = useState('');

  const values = (
    patch: Partial<{
      from_warehouse_id: string;
      to_warehouse_id: string;
      remarks: string;
      item_id: string;
      quantity: string;
    }> = {},
  ) => ({
    from_warehouse_id: patch.from_warehouse_id ?? fromWarehouseId,
    to_warehouse_id: patch.to_warehouse_id ?? toWarehouseId,
    remarks: patch.remarks ?? remarks,
    item_id: patch.item_id ?? itemId,
    quantity: patch.quantity ?? quantity,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const parsed = validate(createTransferSchema, values());
    if (!parsed) return;
    try {
      await createMutation.mutateAsync({
        from_warehouse_id: parsed.from_warehouse_id,
        to_warehouse_id: parsed.to_warehouse_id,
        remarks: parsed.remarks,
        lines: [{ item_id: parsed.item_id, quantity: parsed.quantity }],
      });
      refetch();
      setRemarks('');
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <Card className="max-w-xl space-y-4 p-4">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">New transfer</h3>
        <form className="space-y-3" onSubmit={handleCreate} noValidate>
          <WmsSelect
            label="From warehouse"
            value={fromWarehouseId}
            onChange={(v) => {
              setFromWarehouseId(v);
              revalidate(createTransferSchema, values({ from_warehouse_id: v }));
            }}
            onBlur={() => validatePath(createTransferSchema, values(), 'from_warehouse_id')}
            options={warehouseOptions}
            required
            error={fieldError('from_warehouse_id')}
          />
          <WmsSelect
            label="To warehouse"
            value={toWarehouseId}
            onChange={(v) => {
              setToWarehouseId(v);
              revalidate(createTransferSchema, values({ to_warehouse_id: v }));
            }}
            onBlur={() => validatePath(createTransferSchema, values(), 'to_warehouse_id')}
            options={warehouseOptions}
            required
            error={fieldError('to_warehouse_id')}
          />
          <WmsSelect
            label="Item"
            value={itemId}
            onChange={(v) => {
              setItemId(v);
              revalidate(createTransferSchema, values({ item_id: v }));
            }}
            onBlur={() => validatePath(createTransferSchema, values(), 'item_id')}
            options={itemOptions}
            required
            error={fieldError('item_id')}
          />
          <Input
            label="Quantity"
            type="number"
            min={0.0001}
            value={quantity}
            error={fieldError('quantity')}
            onChange={(e) => {
              const next = e.target.value;
              setQuantity(next);
              revalidate(createTransferSchema, values({ quantity: next }));
            }}
            onBlur={() => validatePath(createTransferSchema, values(), 'quantity')}
          />
          <Input
            label="Remarks"
            value={remarks}
            error={fieldError('remarks')}
            onChange={(e) => {
              const next = e.target.value;
              setRemarks(next);
              revalidate(createTransferSchema, values({ remarks: next }));
            }}
            onBlur={() => validatePath(createTransferSchema, values(), 'remarks')}
          />
          <FieldError message={formError} />
          <Button type="submit" disabled={createMutation.isPending}>
            Create transfer
          </Button>
        </form>
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Transfers</h3>
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : !transfers.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No transfers.</p>
        ) : (
          <div className="space-y-2">
            {transfers.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{t.document_number ?? t.id.slice(0, 8)}</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">Status: {t.status ?? '—'}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={postMutation.isPending || (t.status ?? '').toLowerCase().includes('post')}
                  onClick={() => postMutation.mutate(t.id, { onSuccess: () => refetch() })}
                >
                  Post
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
