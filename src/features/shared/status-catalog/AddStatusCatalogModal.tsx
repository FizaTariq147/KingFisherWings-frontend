import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { jobService } from '@/features/jobs/services/job.service';
import { jobKeys } from '@/features/jobs/hooks/useJobs';
import type { UpsertStatusCatalogDto } from '@/features/jobs/types/job.types';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { quotationKeys } from '@/features/quotations/hooks/useQuotations';
import { shipmentService } from '@/features/shipments/services/shipment.service';
import { shipmentKeys } from '@/features/shipments/hooks/useShipments';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';

export type StatusCatalogEntity = 'jobs' | 'shipments' | 'quotations';

export type AddStatusCatalogModalProps = {
  open: boolean;
  onClose: () => void;
  entity: StatusCatalogEntity;
  /** Called after create — parent should select the new catalog code. */
  onCreated: (code: string, label: string) => void;
  /** Open over another modal (change-status). */
  nested?: boolean;
};

const FIELD =
  'h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]';

function toCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

async function createCatalog(
  entity: StatusCatalogEntity,
  dto: UpsertStatusCatalogDto,
): Promise<unknown> {
  if (entity === 'jobs') return jobService.createStatusCatalog(dto);
  if (entity === 'shipments') return shipmentService.createStatusCatalog(dto);
  return quotationService.createStatusCatalog(dto);
}

function pickCreatedCode(raw: unknown, fallback: string): string {
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Record<string, unknown>;
  const nested =
    r.data && typeof r.data === 'object' && !Array.isArray(r.data)
      ? (r.data as Record<string, unknown>)
      : r;
  const code = String(nested.code ?? nested.status_code ?? nested.value ?? '').trim();
  return code || fallback;
}

/**
 * In-place custom status create for change-status modals.
 * POST /{jobs|shipments|quotations}/status-catalog
 */
export function AddStatusCatalogModal({
  open,
  onClose,
  entity,
  onCreated,
  nested = true,
}: AddStatusCatalogModalProps) {
  const qc = useQueryClient();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCode('');
    setLabel('');
    setError(null);
  }, [open]);

  const create = useMutation({
    mutationFn: (dto: UpsertStatusCatalogDto) => createCatalog(entity, dto),
    onSuccess: async () => {
      if (entity === 'jobs') {
        await qc.invalidateQueries({ queryKey: [...jobKeys.all, 'status-options'] });
      } else if (entity === 'shipments') {
        await qc.invalidateQueries({ queryKey: shipmentKeys.statusOptions });
      } else {
        await qc.invalidateQueries({ queryKey: quotationKeys.statusOptions });
      }
    },
  });

  const submit = async () => {
    setError(null);
    const normalized = toCode(code || label);
    if (!normalized) {
      setError('Code is required (e.g. AWAITING_DOCS).');
      return;
    }
    const dto: UpsertStatusCatalogDto = {
      code: normalized,
      label: label.trim() || normalized.replaceAll('_', ' '),
      is_active: true,
    };
    try {
      const created = await create.mutateAsync(dto);
      onCreated(pickCreatedCode(created, normalized), dto.label);
      onClose();
    } catch (err) {
      setError(getServerErrorMessage(err) || 'Could not create status.');
    }
  };

  const entityLabel =
    entity === 'jobs' ? 'job' : entity === 'shipments' ? 'shipment' : 'quotation';

  return (
    <Modal
      open={open}
      onClose={() => !create.isPending && onClose()}
      title={`Add custom ${entityLabel} status`}
      size="sm"
      layer={nested ? 'nested' : 'base'}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={create.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={create.isPending || !toCode(code || label)}
            onClick={() => void submit()}
          >
            {create.isPending ? 'Saving…' : 'Add status'}
          </Button>
        </div>
      }
    >
      {error ? (
        <p className="mb-2 text-[13px] text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      <label className="mb-3 block text-[13px]">
        <span className="mb-1 block text-[12px] font-medium text-[#334155]">Code</span>
        <input
          className={FIELD}
          value={code}
          placeholder="AWAITING_DOCS"
          onChange={(e) => setCode(toCode(e.target.value) || e.target.value.toUpperCase())}
          onBlur={() => setCode((c) => toCode(c))}
        />
      </label>
      <label className="block text-[13px]">
        <span className="mb-1 block text-[12px] font-medium text-[#334155]">Label</span>
        <input
          className={FIELD}
          value={label}
          placeholder="Awaiting docs"
          onChange={(e) => {
            setLabel(e.target.value);
            if (!code.trim()) setCode(toCode(e.target.value));
          }}
        />
      </label>
    </Modal>
  );
}
