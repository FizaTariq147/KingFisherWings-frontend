import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Check, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import {
  WmsDetailField,
  WmsDocumentLinesTable,
  statusBadgeClass,
  useWmsWarehouseLabel,
} from '../components/WmsDocumentDetail';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsAsn, useWmsAsnActions, wmsKeys } from '../hooks/useWms';
import { displayDocNumber } from '../utils/normalizeWms';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsAsnDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: doc, isLoading, isError, error, refetch, isFetching } = useWmsAsn(id);
  const { confirm, cancel } = useWmsAsnActions(id);
  const warehouseLabel = useWmsWarehouseLabel(doc?.warehouse_id);

  const status = (doc?.status ?? '').toLowerCase();
  const canConfirm = Boolean(doc) && !status.includes('confirm') && !status.includes('cancel');
  const canCancel = Boolean(doc) && !status.includes('cancel');

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: wmsKeys.asn(id) });
    void queryClient.invalidateQueries({ queryKey: wmsKeys.asns() });
    void refetch();
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={`${WMS_ROUTE_PREFIX}/asns`}
        backLabel="ASN"
        title={doc ? displayDocNumber(doc) : 'ASN detail'}
        description={doc?.status ? undefined : 'Advance shipment notice'}
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
                  disabled={confirm.isPending}
                >
                  <Check className="h-4 w-4" />
                  Confirm
                </Button>
              ) : null}
              {canCancel ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => cancel.mutate(undefined, { onSuccess: refresh })}
                  disabled={cancel.isPending}
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--color-neutral-500)]">Status</span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(doc.status)}`}
              >
                {doc.status ?? '—'}
              </span>
            </div>
            <div>
              <WmsDetailField label="Document" value={displayDocNumber(doc)} />
              <WmsDetailField label="Warehouse" value={warehouseLabel} />
              <WmsDetailField label="Party" value={doc.party_id ?? '—'} />
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
        {(confirm.isError || cancel.isError) && (
          <p className="text-[var(--color-danger-600)]">
            {getErrorMessage(confirm.error ?? cancel.error)}
          </p>
        )}
      </Card>
    </div>
  );
}
