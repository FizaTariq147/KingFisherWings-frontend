import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
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
import { useWmsItemOptions } from '../components/WmsFormHelpers';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsGdo, useWmsGdoActions, wmsKeys } from '../hooks/useWms';
import { displayDocNumber } from '../utils/normalizeWms';
import { getErrorMessage } from '../utils/getErrorMessage';

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

function humanizeStockError(raw: string, itemLabelById: Map<string, string>): string {
  return raw.replace(UUID_RE, (id) => itemLabelById.get(id) ?? id);
}

export default function WmsGdoDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: doc, isLoading, isError, error, refetch, isFetching } = useWmsGdo(id);
  const { post, cancel } = useWmsGdoActions(id);
  const warehouseLabel = useWmsWarehouseLabel(doc?.warehouse_id);
  const { options: itemOptions } = useWmsItemOptions();

  const itemLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of itemOptions) {
      if (opt.value) map.set(opt.value, opt.label);
    }
    return map;
  }, [itemOptions]);

  const status = (doc?.status ?? '').toLowerCase();
  const canPost = Boolean(doc) && !status.includes('post') && !status.includes('cancel');
  const canCancel = Boolean(doc) && !status.includes('cancel');

  const actionError = post.isError || cancel.isError ? getErrorMessage(post.error ?? cancel.error) : null;
  const actionErrorDisplay = actionError ? humanizeStockError(actionError, itemLabelById) : null;
  const isInsufficientStock = Boolean(actionError?.toLowerCase().includes('insufficient stock'));

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: wmsKeys.gdo(id) });
    void queryClient.invalidateQueries({ queryKey: wmsKeys.gdos() });
    void refetch();
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={`${WMS_ROUTE_PREFIX}/gdos`}
        backLabel="GDO"
        title={doc ? displayDocNumber(doc) : 'GDO detail'}
        description={doc?.status ? undefined : 'Goods dispatch order'}
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
              <WmsDocumentLinesTable lines={doc.lines} variant="gdo" />
            </div>
          </>
        ) : (
          <p className="text-[var(--color-neutral-400)]">GDO not found.</p>
        )}
        {actionErrorDisplay ? (
          <div className="space-y-1">
            <p className="text-[var(--color-danger-600)]">{actionErrorDisplay}</p>
            {isInsufficientStock ? (
              <p className="text-xs text-[var(--color-neutral-600)]">
                Posting a GDO consumes on-hand stock in this warehouse. Receive stock first via a{' '}
                <Link className="underline" to={`${WMS_ROUTE_PREFIX}/grns/new`}>
                  posted GRN
                </Link>{' '}
                (or{' '}
                <Link className="underline" to={`${WMS_ROUTE_PREFIX}/stock`}>
                  Stock → Adjust
                </Link>
                ), then check{' '}
                <Link className="underline" to={`${WMS_ROUTE_PREFIX}/stock`}>
                  Stock → On hand
                </Link>{' '}
                for the same warehouse and item.
              </p>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
