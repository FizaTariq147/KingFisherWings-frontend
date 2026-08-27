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
import { useWmsGrn, useWmsGrnActions, wmsKeys } from '../hooks/useWms';
import { displayDocNumber } from '../utils/normalizeWms';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsGrnDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: doc, isLoading, isError, error, refetch, isFetching } = useWmsGrn(id);
  const { post, cancel } = useWmsGrnActions(id);
  const warehouseLabel = useWmsWarehouseLabel(doc?.warehouse_id);

  const status = (doc?.status ?? '').toLowerCase();
  const canPost = Boolean(doc) && !status.includes('post') && !status.includes('cancel');
  const canCancel = Boolean(doc) && !status.includes('cancel');

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: wmsKeys.grn(id) });
    void queryClient.invalidateQueries({ queryKey: wmsKeys.grns() });
    void refetch();
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={`${WMS_ROUTE_PREFIX}/grns`}
        backLabel="GRN"
        title={doc ? displayDocNumber(doc) : 'GRN detail'}
        description={doc?.status ? undefined : 'Goods received note'}
        actions={
          doc ? (
            <>
              <Button type="button" variant="secondary" onClick={refresh} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {canPost ? (
                <Button
                  type="button"
                  onClick={() => post.mutate(undefined, { onSuccess: refresh })}
                  disabled={post.isPending}
                >
                  <Check className="h-4 w-4" />
                  Post
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
              <WmsDetailField label="ASN" value={String(doc.asn_id ?? '—')} />
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
              <WmsDocumentLinesTable lines={doc.lines} variant="grn" />
            </div>
          </>
        ) : (
          <p className="text-[var(--color-neutral-400)]">GRN not found.</p>
        )}
        {(post.isError || cancel.isError) && (
          <p className="text-[var(--color-danger-600)]">{getErrorMessage(post.error ?? cancel.error)}</p>
        )}
      </Card>
    </div>
  );
}
