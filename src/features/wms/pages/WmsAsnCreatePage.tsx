import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsPageHeader } from '../components/WmsPageHeader';
import {
  useWmsItemOptions,
  useWmsJobOptions,
  useWmsPartyOptions,
  useWmsWarehouseOptions,
  WmsItemsEmptyHint,
  WmsSelect,
  WmsWarehousesEmptyHint,
} from '../components/WmsFormHelpers';
import {
  WmsFormAlert,
  WmsFormCard,
  WmsFormFooter,
  WmsFormGrid,
  WmsFormSpan2,
} from '../components/WmsFormLayout';
import { useCreateWmsAsn } from '../hooks/useWms';
import { useWmsAutoSelectValue } from '../hooks/useWmsAutoSelectValue';
import { createAsnSchema } from '../schemas/wms.schema';
import type { AsnLineDto } from '../types/wms.types';
import { getErrorMessage } from '../utils/getErrorMessage';

type LineRow = AsnLineDto & { key: string };

function emptyLine(): LineRow {
  return { key: crypto.randomUUID(), item_id: '', quantity: 1 };
}

export default function WmsAsnCreatePage() {
  const navigate = useNavigate();
  const {
    options: warehouseOptions,
    isLoading: warehousesLoading,
    preferredId: preferredWarehouseId,
    selectableCount: warehouseCount,
    errorMessage: warehouseErrorMessage,
    refetch: refetchWarehouses,
  } = useWmsWarehouseOptions();
  const { options: partyOptions, isLoading: partiesLoading } = useWmsPartyOptions();
  const { options: jobOptions, isLoading: jobsLoading } = useWmsJobOptions();
  const {
    options: itemOptions,
    isEmpty: itemsEmpty,
    isError: itemsError,
    errorMessage: itemsErrorMessage,
    refetch: refetchItems,
  } = useWmsItemOptions();
  const createMutation = useCreateWmsAsn();
  const { fieldError, formError, setFormError, clearErrors, validate, revalidate, validatePath } =
    useInlineValidation();

  const [warehouseId, setWarehouseId] = useState('');
  const [partyId, setPartyId] = useState('');
  const [jobId, setJobId] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState<LineRow[]>([emptyLine()]);

  useWmsAutoSelectValue(
    warehouseOptions,
    warehouseId,
    setWarehouseId,
    preferredWarehouseId,
    warehousesLoading,
  );
  useWmsAutoSelectValue(partyOptions, partyId, setPartyId, null, partiesLoading);
  useWmsAutoSelectValue(jobOptions, jobId, setJobId, null, jobsLoading);

  const toPayload = (
    patch: Partial<{
      warehouse_id: string;
      party_id: string;
      job_id: string;
      expected_at: string;
      remarks: string;
      lines: LineRow[];
    }> = {},
  ) => {
    const nextLines = patch.lines ?? lines;
    return {
      warehouse_id: patch.warehouse_id ?? warehouseId,
      party_id: patch.party_id ?? partyId,
      job_id: patch.job_id ?? jobId,
      expected_at: patch.expected_at ?? expectedAt,
      remarks: patch.remarks ?? remarks,
      lines: nextLines.map(({ item_id, quantity, cbm, remarks: lineRemarks }) => ({
        item_id,
        quantity,
        cbm,
        remarks: lineRemarks,
      })),
    };
  };

  const updateLine = (key: string, patch: Partial<LineRow>) => {
    const next = lines.map((l) => (l.key === key ? { ...l, ...patch } : l));
    setLines(next);
    revalidate(createAsnSchema, toPayload({ lines: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const parsed = validate(createAsnSchema, toPayload());
    if (!parsed) return;
    try {
      const doc = await createMutation.mutateAsync(parsed);
      navigate(`${WMS_ROUTE_PREFIX}/asns/${doc.id}`);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const cancel = () => navigate(`${WMS_ROUTE_PREFIX}/asns`);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <WmsPageHeader
        backTo={`${WMS_ROUTE_PREFIX}/asns`}
        backLabel="ASN"
        title="New ASN"
        description="Advance shipment notice for expected inbound stock."
      />

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <WmsFormAlert message={formError} />

        <WmsFormCard title="Document">
          <WmsWarehousesEmptyHint
            selectableCount={warehouseCount}
            isLoading={warehousesLoading}
            errorMessage={warehouseErrorMessage}
            onRetry={() => refetchWarehouses()}
          />
          <WmsFormGrid>
            <WmsSelect
              label="Warehouse"
              value={warehouseId}
              onChange={(v) => {
                setWarehouseId(v);
                revalidate(createAsnSchema, toPayload({ warehouse_id: v }));
              }}
              onBlur={() => validatePath(createAsnSchema, toPayload(), 'warehouse_id')}
              options={warehouseOptions}
              required
              disabled={warehousesLoading}
              error={fieldError('warehouse_id')}
            />
            <WmsSelect
              label="Party"
              value={partyId}
              onChange={(v) => {
                setPartyId(v);
                revalidate(createAsnSchema, toPayload({ party_id: v }));
              }}
              onBlur={() => validatePath(createAsnSchema, toPayload(), 'party_id')}
              options={partyOptions}
              disabled={partiesLoading}
              error={fieldError('party_id')}
            />
            <WmsSelect
              label="Job"
              value={jobId}
              onChange={(v) => {
                setJobId(v);
                revalidate(createAsnSchema, toPayload({ job_id: v }));
              }}
              onBlur={() => validatePath(createAsnSchema, toPayload(), 'job_id')}
              options={jobOptions}
              disabled={jobsLoading}
              error={fieldError('job_id')}
            />
            <Input
              label="Expected at"
              type="datetime-local"
              value={expectedAt}
              error={fieldError('expected_at')}
              onChange={(e) => {
                const next = e.target.value;
                setExpectedAt(next);
                revalidate(createAsnSchema, toPayload({ expected_at: next }));
              }}
              onBlur={() => validatePath(createAsnSchema, toPayload(), 'expected_at')}
            />
            <WmsFormSpan2>
              <Input
                label="Remarks"
                value={remarks}
                error={fieldError('remarks')}
                onChange={(e) => {
                  const next = e.target.value;
                  setRemarks(next);
                  revalidate(createAsnSchema, toPayload({ remarks: next }));
                }}
                onBlur={() => validatePath(createAsnSchema, toPayload(), 'remarks')}
              />
            </WmsFormSpan2>
          </WmsFormGrid>
        </WmsFormCard>

        <WmsFormCard
          title="Lines"
          headerAction={
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                const next = [...lines, emptyLine()];
                setLines(next);
                revalidate(createAsnSchema, toPayload({ lines: next }));
              }}
            >
              <Plus className="h-4 w-4" />
              Add line
            </Button>
          }
        >
          <div className="space-y-3 p-4 pt-0">
            <FieldError message={fieldError('lines')} />
            {itemsEmpty || itemsError ? (
              <WmsItemsEmptyHint
                isEmpty={itemsEmpty}
                isError={itemsError}
                errorMessage={itemsErrorMessage}
                onRetry={() => void refetchItems()}
              />
            ) : null}

            <div className="hidden sm:grid sm:grid-cols-12 gap-2 border-b border-[var(--color-neutral-100)] pb-2 text-xs font-medium text-[var(--color-neutral-500)]">
              <div className="sm:col-span-7">Item</div>
              <div className="sm:col-span-3">Qty</div>
              <div className="sm:col-span-2" />
            </div>

            {lines.map((line, index) => (
              <div
                key={line.key}
                className="grid grid-cols-1 gap-3 border-b border-[var(--color-neutral-100)] pb-3 last:border-0 sm:grid-cols-12 sm:items-start"
              >
                <div className="sm:col-span-7">
                  <WmsSelect
                    label="Item"
                    id={`asn-item-${line.key}`}
                    value={line.item_id}
                    onChange={(v) => updateLine(line.key, { item_id: v })}
                    onBlur={() =>
                      validatePath(createAsnSchema, toPayload(), `lines.${index}.item_id`)
                    }
                    options={itemOptions}
                    required
                    disabled={itemsEmpty || itemsError}
                    error={fieldError(`lines.${index}.item_id`)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <Input
                    label="Qty"
                    type="number"
                    min={0.0001}
                    step="any"
                    value={String(line.quantity)}
                    error={fieldError(`lines.${index}.quantity`)}
                    onChange={(e) =>
                      updateLine(line.key, { quantity: Number(e.target.value) || 0 })
                    }
                    onBlur={() =>
                      validatePath(createAsnSchema, toPayload(), `lines.${index}.quantity`)
                    }
                    required
                  />
                </div>
                <div className="flex sm:col-span-2 sm:justify-end sm:pt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-label="Remove line"
                    onClick={() => {
                      const next = lines.filter((l) => l.key !== line.key);
                      setLines(next);
                      revalidate(createAsnSchema, toPayload({ lines: next }));
                    }}
                    disabled={lines.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </WmsFormCard>

        <WmsFormFooter
          onCancel={cancel}
          submitLabel="Create ASN"
          isSubmitting={createMutation.isPending}
        />
      </form>
    </div>
  );
}
