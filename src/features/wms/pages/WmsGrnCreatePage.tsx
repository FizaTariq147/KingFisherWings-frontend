import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsPageHeader } from '../components/WmsPageHeader';
import {
  useWmsItemOptions,
  useWmsWarehouseOptions,
  WmsItemsEmptyHint,
  WmsSelect,
} from '../components/WmsFormHelpers';
import { useCreateWmsGrn } from '../hooks/useWms';
import { createGrnSchema } from '../schemas/wms.schema';
import type { GrnLineDto } from '../types/wms.types';
import { getErrorMessage } from '../utils/getErrorMessage';

type LineRow = GrnLineDto & { key: string };

function emptyLine(): LineRow {
  return { key: crypto.randomUUID(), item_id: '', quantity: 1 };
}

export default function WmsGrnCreatePage() {
  const navigate = useNavigate();
  const { options: warehouseOptions } = useWmsWarehouseOptions();
  const {
    options: itemOptions,
    isEmpty: itemsEmpty,
    isError: itemsError,
    errorMessage: itemsErrorMessage,
    refetch: refetchItems,
  } = useWmsItemOptions();
  const createMutation = useCreateWmsGrn();
  const { fieldError, formError, setFormError, clearErrors, validate, revalidate, validatePath } =
    useInlineValidation();

  const [warehouseId, setWarehouseId] = useState('');
  const [partyId, setPartyId] = useState('');
  const [jobId, setJobId] = useState('');
  const [asnId, setAsnId] = useState('');
  const [receivedAt, setReceivedAt] = useState('');
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState<LineRow[]>([emptyLine()]);

  const toPayload = (
    patch: Partial<{
      warehouse_id: string;
      party_id: string;
      job_id: string;
      asn_id: string;
      received_at: string;
      remarks: string;
      lines: LineRow[];
    }> = {},
  ) => {
    const nextLines = patch.lines ?? lines;
    return {
      warehouse_id: patch.warehouse_id ?? warehouseId,
      party_id: patch.party_id ?? partyId,
      job_id: patch.job_id ?? jobId,
      asn_id: patch.asn_id ?? asnId,
      received_at: patch.received_at ?? receivedAt,
      remarks: patch.remarks ?? remarks,
      lines: nextLines.map(({ item_id, quantity, cbm, remarks: lineRemarks, unit_cost, batch_code }) => ({
        item_id,
        quantity,
        cbm,
        remarks: lineRemarks,
        unit_cost,
        batch_code,
      })),
    };
  };

  const updateLine = (key: string, patch: Partial<LineRow>) => {
    const next = lines.map((l) => (l.key === key ? { ...l, ...patch } : l));
    setLines(next);
    revalidate(createGrnSchema, toPayload({ lines: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const parsed = validate(createGrnSchema, toPayload());
    if (!parsed) return;
    try {
      const doc = await createMutation.mutateAsync(parsed);
      navigate(`${WMS_ROUTE_PREFIX}/grns/${doc.id}`);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader backTo={`${WMS_ROUTE_PREFIX}/grns`} backLabel="GRN" title="New GRN" />
      <Card className="max-w-3xl p-4">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <WmsSelect
            label="Warehouse"
            value={warehouseId}
            onChange={(v) => {
              setWarehouseId(v);
              revalidate(createGrnSchema, toPayload({ warehouse_id: v }));
            }}
            onBlur={() => validatePath(createGrnSchema, toPayload(), 'warehouse_id')}
            options={warehouseOptions}
            required
            error={fieldError('warehouse_id')}
          />
          <Input
            label="Party ID (optional)"
            value={partyId}
            error={fieldError('party_id')}
            onChange={(e) => {
              const next = e.target.value;
              setPartyId(next);
              revalidate(createGrnSchema, toPayload({ party_id: next }));
            }}
            onBlur={() => validatePath(createGrnSchema, toPayload(), 'party_id')}
          />
          <Input
            label="Job ID (optional)"
            value={jobId}
            error={fieldError('job_id')}
            onChange={(e) => {
              const next = e.target.value;
              setJobId(next);
              revalidate(createGrnSchema, toPayload({ job_id: next }));
            }}
            onBlur={() => validatePath(createGrnSchema, toPayload(), 'job_id')}
          />
          <Input
            label="ASN ID (optional)"
            value={asnId}
            error={fieldError('asn_id')}
            onChange={(e) => {
              const next = e.target.value;
              setAsnId(next);
              revalidate(createGrnSchema, toPayload({ asn_id: next }));
            }}
            onBlur={() => validatePath(createGrnSchema, toPayload(), 'asn_id')}
          />
          <Input
            label="Received at"
            type="datetime-local"
            value={receivedAt}
            error={fieldError('received_at')}
            onChange={(e) => {
              const next = e.target.value;
              setReceivedAt(next);
              revalidate(createGrnSchema, toPayload({ received_at: next }));
            }}
            onBlur={() => validatePath(createGrnSchema, toPayload(), 'received_at')}
          />
          <Input
            label="Remarks"
            value={remarks}
            error={fieldError('remarks')}
            onChange={(e) => {
              const next = e.target.value;
              setRemarks(next);
              revalidate(createGrnSchema, toPayload({ remarks: next }));
            }}
            onBlur={() => validatePath(createGrnSchema, toPayload(), 'remarks')}
          />

          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-neutral-600)]">Lines</p>
            <FieldError message={fieldError('lines')} />
            {itemsEmpty || itemsError ? (
              <WmsItemsEmptyHint
                isEmpty={itemsEmpty}
                isError={itemsError}
                errorMessage={itemsErrorMessage}
                onRetry={() => void refetchItems()}
              />
            ) : null}
            {lines.map((line, index) => (
              <div key={line.key} className="space-y-2 rounded-md border p-3">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[180px] flex-1">
                    <WmsSelect
                      label="Item"
                      id={`grn-item-${line.key}`}
                      value={line.item_id}
                      onChange={(v) => updateLine(line.key, { item_id: v })}
                      onBlur={() =>
                        validatePath(createGrnSchema, toPayload(), `lines.${index}.item_id`)
                      }
                      options={itemOptions}
                      required
                      disabled={itemsEmpty || itemsError}
                      error={fieldError(`lines.${index}.item_id`)}
                    />
                  </div>
                  <div className="w-24">
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
                        validatePath(createGrnSchema, toPayload(), `lines.${index}.quantity`)
                      }
                      required
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      label="Unit cost"
                      type="number"
                      min={0}
                      step="any"
                      value={line.unit_cost != null ? String(line.unit_cost) : ''}
                      error={fieldError(`lines.${index}.unit_cost`)}
                      onChange={(e) =>
                        updateLine(line.key, {
                          unit_cost: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      onBlur={() =>
                        validatePath(createGrnSchema, toPayload(), `lines.${index}.unit_cost`)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const next = lines.filter((l) => l.key !== line.key);
                      setLines(next);
                      revalidate(createGrnSchema, toPayload({ lines: next }));
                    }}
                    disabled={lines.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const next = [...lines, emptyLine()];
                setLines(next);
                revalidate(createGrnSchema, toPayload({ lines: next }));
              }}
            >
              <Plus className="h-4 w-4" />
              Add line
            </Button>
          </div>

          <FieldError message={formError} />
          <Button type="submit" disabled={createMutation.isPending}>
            <Save className="h-4 w-4" />
            Create GRN
          </Button>
        </form>
      </Card>
    </div>
  );
}
