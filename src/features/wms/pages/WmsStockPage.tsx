import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX, WMS_STOCK_STORAGE_STATUSES } from '../api/wms.api';
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
  useWmsPartyOptions,
  useWmsWarehouseOptions,
  WmsSelect,
} from '../components/WmsFormHelpers';
import {
  WmsFormAlert,
  WmsFormCard,
  WmsFormFooter,
  WmsFormGrid,
  WmsFormSpan2,
} from '../components/WmsFormLayout';
import { adjustStockSchema, createTransferSchema } from '../schemas/wms.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { WmsStockRow } from '../types/wms.types';

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

function buildLabelMap(options: Array<{ value: string; label: string }>): Map<string, string> {
  const map = new Map<string, string>();
  for (const opt of options) {
    if (opt.value) map.set(opt.value, opt.label);
  }
  return map;
}

function formatDateTime(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s.slice(0, 16);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function partyDisplay(row: WmsStockRow, partyLabels: Map<string, string>): string {
  if (row.party_name?.trim()) return row.party_name.trim();
  if (row.party_id && partyLabels.has(row.party_id)) return partyLabels.get(row.party_id)!;
  return '—';
}

export default function WmsStockPage() {
  const [tab, setTab] = useState<StockTab>('on-hand');
  const [warehouseId, setWarehouseId] = useState('');
  const [itemId, setItemId] = useState('');
  const [storageStatus, setStorageStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { options: warehouseOptions } = useWmsWarehouseOptions();
  const { options: itemOptions } = useWmsItemOptions();
  const { options: partyOptions } = useWmsPartyOptions();

  const warehouseLabels = useMemo(() => buildLabelMap(warehouseOptions), [warehouseOptions]);
  const itemLabels = useMemo(() => buildLabelMap(itemOptions), [itemOptions]);
  const partyLabels = useMemo(() => buildLabelMap(partyOptions), [partyOptions]);

  const filterParams = {
    warehouse_id: isUuid(warehouseId) ? warehouseId : undefined,
    item_id: isUuid(itemId) ? itemId : undefined,
    storage_status: storageStatus || undefined,
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

  const extraColumns =
    tab === 'lot-aging'
      ? [
          {
            key: 'party',
            label: 'Party',
            render: (r: WmsStockRow) => partyDisplay(r, partyLabels),
          },
          {
            key: 'storage_status',
            label: 'Status',
            render: (r: WmsStockRow) => String(r.storage_status ?? '—'),
          },
          {
            key: 'received_at',
            label: 'Received',
            render: (r: WmsStockRow) => formatDateTime(r.received_at),
          },
          {
            key: 'batch_code',
            label: 'Batch',
            render: (r: WmsStockRow) => String(r.batch_code ?? '—'),
          },
          {
            key: 'age_days',
            label: 'Age (days)',
            render: (r: WmsStockRow) =>
              r.age_days != null ? String(r.age_days) : String(r.days ?? '—'),
          },
        ]
      : tab === 'movements'
        ? [
            {
              key: 'movement_type',
              label: 'Type',
              render: (r: WmsStockRow) => String(r.movement_type ?? r.type ?? '—'),
            },
            {
              key: 'created_at',
              label: 'When',
              render: (r: WmsStockRow) =>
                formatDateTime(r.created_at ?? r.received_at ?? r.moved_at),
            },
          ]
        : tab === 'low-stock'
          ? [
              {
                key: 'low_stock_threshold',
                label: 'Threshold',
                render: (r: WmsStockRow) =>
                  String(r.low_stock_threshold ?? r.lowStockThreshold ?? '—'),
              },
            ]
          : [];

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
        <TransfersPanel warehouseLabels={warehouseLabels} itemLabels={itemLabels} />
      ) : (
        <Card className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <WarehouseFilter warehouseId={warehouseId} setWarehouseId={setWarehouseId} />
            <ItemFilter itemId={itemId} setItemId={setItemId} />
            <WmsSelect
              label="Storage status"
              value={storageStatus}
              onChange={setStorageStatus}
              options={[
                { value: '', label: 'All statuses' },
                ...WMS_STOCK_STORAGE_STATUSES.map((s) => ({
                  value: s,
                  label: s === 'NOT_COLLECTED' ? 'NOT_COLLECTED (overdue)' : s,
                })),
              ]}
            />
            {tab === 'movements' ? (
              <>
                <Input
                  label="From"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <Input
                  label="To"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </>
            ) : null}
          </div>

          {activeQuery?.isError ? (
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(activeQuery.error)}
            </p>
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
              warehouseLabels={warehouseLabels}
              itemLabels={itemLabels}
              partyLabels={partyLabels}
              extraColumns={extraColumns}
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

  const resetForm = () => {
    setWarehouseId('');
    setItemId('');
    setQuantity('');
    setRemarks('');
    clearErrors();
    setSuccess(null);
  };

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
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <WmsFormAlert message={formError} />
        {success ? (
          <p className="text-sm text-[var(--color-success-600)]" role="status">
            {success}
          </p>
        ) : null}

        <WmsFormCard title="Adjust stock">
          <WmsFormGrid>
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
            <WmsFormSpan2>
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
            </WmsFormSpan2>
          </WmsFormGrid>
        </WmsFormCard>

        <WmsFormFooter
          onCancel={resetForm}
          submitLabel="Adjust stock"
          isSubmitting={adjustMutation.isPending}
        />
      </form>
    </div>
  );
}

function TransfersPanel({
  warehouseLabels,
  itemLabels,
}: {
  warehouseLabels: Map<string, string>;
  itemLabels: Map<string, string>;
}) {
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

  const resetForm = () => {
    setFromWarehouseId('');
    setToWarehouseId('');
    setItemId('');
    setQuantity('1');
    setRemarks('');
    clearErrors();
  };

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

  const resolveWh = (id: unknown) => {
    const s = String(id ?? '').trim();
    if (!s) return '—';
    return warehouseLabels.get(s) || s;
  };
  const resolveItem = (id: unknown) => {
    const s = String(id ?? '').trim();
    if (!s) return '—';
    return itemLabels.get(s) || s;
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-3xl space-y-4">
        <form className="space-y-4" onSubmit={handleCreate} noValidate>
          <WmsFormAlert message={formError} />

          <WmsFormCard title="New transfer">
            <WmsFormGrid>
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
              <WmsFormSpan2>
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
              </WmsFormSpan2>
            </WmsFormGrid>
          </WmsFormCard>

          <WmsFormFooter
            onCancel={resetForm}
            submitLabel="Create transfer"
            isSubmitting={createMutation.isPending}
          />
        </form>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Transfers</CardTitle>
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <div className="space-y-2 p-4 pt-0">
          {isLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
          ) : !transfers.length ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No transfers.</p>
          ) : (
            transfers.map((t) => {
              const fromId = t.from_warehouse_id ?? t.fromWarehouseId;
              const toId = t.to_warehouse_id ?? t.toWarehouseId;
              const lines = Array.isArray(t.lines) ? t.lines : [];
              const firstLine = lines[0] as Record<string, unknown> | undefined;
              const lineItemId = firstLine
                ? String(firstLine.item_id ?? firstLine.itemId ?? '')
                : '';
              const lineQty = firstLine
                ? String(firstLine.quantity ?? firstLine.qty ?? '')
                : '';
              return (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{t.document_number ?? `Transfer ${t.id.slice(0, 8)}`}</p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      {resolveWh(fromId)} → {resolveWh(toId)}
                      {lineItemId ? ` · ${resolveItem(lineItemId)}` : ''}
                      {lineQty ? ` × ${lineQty}` : ''}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      Status: {t.status ?? '—'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      postMutation.isPending || (t.status ?? '').toLowerCase().includes('post')
                    }
                    onClick={() => postMutation.mutate(t.id, { onSuccess: () => refetch() })}
                  >
                    Post
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
