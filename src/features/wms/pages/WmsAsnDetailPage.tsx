import { useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Check, Mail, PackageCheck, RefreshCw, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { useParty } from '@/features/parties/hooks/useParties';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import {
  WmsDetailField,
  WmsDocumentLinesTable,
  statusBadgeClass,
  useWmsWarehouseLabel,
} from '../components/WmsDocumentDetail';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsAsn, useWmsAsnActions, wmsKeys } from '../hooks/useWms';
import {
  ASN_YARD_STEPS,
  asnHasPartyAndJob,
  asnYardStepIndex,
  normalizeAsnStatus,
} from '../utils/asnYardStatus';
import { displayDocNumber } from '../utils/normalizeWms';
import { getErrorMessage } from '../utils/getErrorMessage';

function AsnYardRail({ status }: { status?: string | null }) {
  const key = normalizeAsnStatus(status);
  const idx = asnYardStepIndex(status);
  if (key === 'CANCELLED' || key === 'CANCELED') {
    return (
      <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-600)]">
        ASN cancelled — yard flow stopped.
      </p>
    );
  }
  return (
    <ol className="flex flex-wrap gap-1.5">
      {ASN_YARD_STEPS.map((step, i) => {
        const done = idx >= 0 && i <= idx;
        const current = idx === i;
        return (
          <li
            key={step}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              current
                ? 'bg-[var(--color-primary-600)] text-white'
                : done
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]'
            }`}
          >
            {step}
          </li>
        );
      })}
    </ol>
  );
}

export default function WmsAsnDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: doc, isLoading, isError, error, refetch, isFetching } = useWmsAsn(id);
  const { confirm, markPicked, markUnloading, markUnloaded, resendGrn, cancel } =
    useWmsAsnActions(id);
  const warehouseLabel = useWmsWarehouseLabel(doc?.warehouse_id);
  const partyId = doc?.party_id && isUuid(doc.party_id) ? doc.party_id : '';
  const { data: party } = useParty(partyId);
  const partyLabel = party?.name || party?.short_name || doc?.party_id || undefined;

  const key = normalizeAsnStatus(doc?.status);
  const canUnload =
    asnHasPartyAndJob(doc) && isUuid(String(doc?.party_id)) && isUuid(String(doc?.job_id));

  const canConfirm = Boolean(doc) && (key === 'DRAFT' || key === '');
  const canMarkPicked = Boolean(doc) && key === 'CONFIRMED';
  const canMarkUnloading = Boolean(doc) && key === 'PICKED';
  const canMarkUnloaded = Boolean(doc) && key === 'UNLOADING';
  const canResendGrn =
    Boolean(doc) && (key === 'UNLOADED' || key === 'RECEIVED' || key.includes('UNLOAD'));
  const canCancel =
    Boolean(doc) && (key === 'CONFIRMED' || key === 'PICKED' || key === 'DRAFT');

  const actionPending =
    confirm.isPending ||
    markPicked.isPending ||
    markUnloading.isPending ||
    markUnloaded.isPending ||
    resendGrn.isPending ||
    cancel.isPending;

  const actionError =
    confirm.error ||
    markPicked.error ||
    markUnloading.error ||
    markUnloaded.error ||
    resendGrn.error ||
    cancel.error;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: wmsKeys.asn(id) });
    void queryClient.invalidateQueries({ queryKey: wmsKeys.asns() });
    void queryClient.invalidateQueries({ queryKey: wmsKeys.opsBoard() });
    void queryClient.invalidateQueries({ queryKey: wmsKeys.grns() });
    void refetch();
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={`${WMS_ROUTE_PREFIX}/asns`}
        backLabel="ASN"
        title={doc ? displayDocNumber(doc) : 'ASN detail'}
        description="Yard: DRAFT → CONFIRMED → PICKED → UNLOADING → UNLOADED (auto GRN + portal)"
        actions={
          doc ? (
            <>
              <Button type="button" variant="secondary" onClick={refresh} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {canConfirm ? (
                <Button
                  type="button"
                  onClick={() => confirm.mutate(undefined, { onSuccess: refresh })}
                  disabled={actionPending}
                >
                  <Check className="h-4 w-4" />
                  Confirm
                </Button>
              ) : null}
              {canMarkPicked ? (
                <Button
                  type="button"
                  onClick={() => markPicked.mutate(undefined, { onSuccess: refresh })}
                  disabled={actionPending}
                >
                  <Truck className="h-4 w-4" />
                  Mark picked
                </Button>
              ) : null}
              {canMarkUnloading ? (
                <Button
                  type="button"
                  onClick={() => markUnloading.mutate(undefined, { onSuccess: refresh })}
                  disabled={actionPending}
                >
                  <PackageCheck className="h-4 w-4" />
                  Mark unloading
                </Button>
              ) : null}
              {canMarkUnloaded ? (
                <Button
                  type="button"
                  onClick={() => markUnloaded.mutate(undefined, { onSuccess: refresh })}
                  disabled={actionPending || !canUnload}
                  title={
                    canUnload
                      ? 'Auto-create/post GRN, email party + portal, attach JobDocument'
                      : 'party_id and job_id are required before unload'
                  }
                >
                  <PackageCheck className="h-4 w-4" />
                  {markUnloaded.isPending ? 'Unloading…' : 'Mark unloaded'}
                </Button>
              ) : null}
              {canResendGrn ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => resendGrn.mutate(undefined, { onSuccess: refresh })}
                  disabled={actionPending}
                >
                  <Mail className="h-4 w-4" />
                  {resendGrn.isPending ? 'Sending…' : 'Resend GRN'}
                </Button>
              ) : null}
              {canCancel ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => cancel.mutate(undefined, { onSuccess: refresh })}
                  disabled={actionPending}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              ) : null}
            </>
          ) : null
        }
      />

      <Card className="max-w-3xl space-y-4 p-4 text-sm">
        {isLoading ? (
          <p className="text-[var(--color-neutral-400)]">Loading…</p>
        ) : isError ? (
          <p className="text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : doc ? (
          <>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--color-neutral-500)]">Status</span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(doc.status)}`}
                >
                  {doc.status ?? '—'}
                </span>
              </div>
              <AsnYardRail status={doc.status} />
            </div>
            {!canUnload && (canMarkUnloaded || key === 'UNLOADING' || key === 'DRAFT') ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Mark unloaded requires <strong>party</strong> and <strong>job</strong> on this ASN
                (for GRN email + portal JobDocument). Recreate ASN with both set, or use legacy{' '}
                <Link className="underline" to={`${WMS_ROUTE_PREFIX}/grns/new`}>
                  manual GRN post
                </Link>{' '}
                (sets ASN RECEIVED).
              </p>
            ) : null}
            {key === 'UNLOADED' || key === 'RECEIVED' ? (
              <p className="text-xs text-[var(--color-neutral-500)]">
                Preferred: Mark unloaded auto-posts GRN and notifies the customer. Legacy: manual GRN
                post sets ASN to RECEIVED — check{' '}
                <Link className="underline" to={`${WMS_ROUTE_PREFIX}/grns`}>
                  GRN list
                </Link>{' '}
                and{' '}
                <Link className="underline" to={`${WMS_ROUTE_PREFIX}/ops-board`}>
                  Ops board
                </Link>
                .
              </p>
            ) : null}
            <div>
              <WmsDetailField label="Document" value={displayDocNumber(doc)} />
              <WmsDetailField label="Warehouse" value={warehouseLabel} />
              <WmsDetailField label="Party" value={partyLabel || doc.party_id || '—'} />
              <WmsDetailField label="Job" value={doc.job_id ?? '—'} />
              <WmsDetailField label="Remarks" value={doc.remarks ?? '—'} />
              <WmsDetailField
                label="Created"
                value={doc.created_at ? new Date(doc.created_at).toLocaleString() : '—'}
              />
            </div>
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                Lines
              </p>
              <WmsDocumentLinesTable lines={doc.lines} variant="asn" />
            </div>
          </>
        ) : (
          <p className="text-[var(--color-neutral-400)]">ASN not found.</p>
        )}
        {actionError ? (
          <p className="text-[var(--color-danger-600)]">{getErrorMessage(actionError)}</p>
        ) : null}
      </Card>
    </div>
  );
}
