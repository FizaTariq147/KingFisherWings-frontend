import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appType } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import { JOB_TYPES, type JobType } from '@/features/quotations/constants/quotation.constants';
import {
  SHIPMENT_FORM_DEFAULTS,
  ShipmentForm,
  type ShipmentFormValues,
} from '../components/ShipmentForm';
import { SHIPMENT_CREATE_DRAFT_KEY } from '../constants/shipmentWizard.constants';
import { useShipmentPaths } from '../hooks/useShipmentPaths';
import { useCreateShipment } from '../hooks/useShipments';
import { useShipmentsPermissions } from '../hooks/useShipmentsPermissions';
import type { CreateShipmentDto } from '../types/shipment.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { shipmentDisplayNumber } from '../utils/normalizeShipment';

function loadDraft(): Partial<ShipmentFormValues> | null {
  try {
    const raw = sessionStorage.getItem(SHIPMENT_CREATE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ShipmentFormValues>;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(SHIPMENT_CREATE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function parseJobType(raw: string | null): JobType | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  return (JOB_TYPES as readonly string[]).includes(upper) ? (upper as JobType) : null;
}

export default function ShipmentCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paths = useShipmentPaths();
  const create = useCreateShipment();
  const { canWriteCreate } = useShipmentsPermissions();
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo(() => {
    const draft = loadDraft();
    const jobType = parseJobType(searchParams.get('job_type'));
    const customer =
      searchParams.get('customer_id') || searchParams.get('party_id') || '';
    return {
      ...SHIPMENT_FORM_DEFAULTS,
      ...draft,
      ...(jobType ? { job_type: jobType } : {}),
      ...(isUuid(customer) ? { customer_id: customer } : {}),
      ...(isUuid(searchParams.get('quotation_id') || '')
        ? { quotation_id: searchParams.get('quotation_id')! }
        : {}),
      ...(isUuid(searchParams.get('enquiry_id') || '')
        ? { enquiry_id: searchParams.get('enquiry_id')! }
        : {}),
    } satisfies Partial<ShipmentFormValues>;
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(paths.list)}
      >
        ← Back to shipments
      </button>
      <div className="text-center">
        <h2 className={appType.pageTitle}>Create Shipment</h2>
      </div>

      {error ? (
        <div
          role="alert"
          className="mx-auto max-w-5xl rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      ) : null}

      {!canWriteCreate ? (
        <div
          role="alert"
          className="mx-auto max-w-5xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Missing permission: shipments.create
        </div>
      ) : null}

      <ShipmentForm
        defaultValues={defaults}
        isSubmitting={create.isPending}
        onCancel={() => navigate(paths.list)}
        onSubmit={async (dto: CreateShipmentDto) => {
          if (!canWriteCreate) {
            setError('Missing permission: shipments.create');
            return;
          }
          setError(null);
          try {
            const created = await create.mutateAsync(dto);
            clearDraft();
            navigate(paths.detail(created.id), {
              replace: true,
              state: { message: `Shipment ${shipmentDisplayNumber(created)} created.` },
            });
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
