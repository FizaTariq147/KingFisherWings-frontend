import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Package, Scale, Box } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalGsapTimeline,
  PortalGsapTimelineItem,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import {
  useDownloadPortalShipmentDocument,
  usePortalShipment,
  usePortalShipmentActions,
  usePortalShipmentContainerRequests,
  usePortalShipmentDocuments,
  usePortalShipmentMilestones,
} from '../hooks/usePortalShipments';

export default function PortalShipmentDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalShipment(id);
  const milestonesQuery = usePortalShipmentMilestones(id, Boolean(data) && !data?.milestones?.length);
  const documentsQuery = usePortalShipmentDocuments(id, Boolean(data));
  const isAirExport = data?.jobType === 'AIR_EXPORT';
  const isAirImport = data?.jobType === 'AIR_IMPORT';
  const isAir =
    isAirExport ||
    isAirImport ||
    String(data?.jobType ?? '').startsWith('AIR_');
  const isNvoccOrSea =
    data?.jobType === 'NVOCC_EXPORT' ||
    data?.jobType === 'NVOCC_IMPORT' ||
    String(data?.jobType ?? '').includes('SEA_');
  const containerRequestsQuery = usePortalShipmentContainerRequests(
    id,
    Boolean(data) && isNvoccOrSea,
  );
  /** Air pallet / ULD request APIs removed from backend — do not call. */
  const actions = usePortalShipmentActions(id);
  const download = useDownloadPortalShipmentDocument();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const milestones = data?.milestones?.length ? data.milestones : milestonesQuery.data ?? [];
  const documents = data?.documents?.length ? data.documents : documentsQuery.data ?? [];
  const containerRequests = containerRequestsQuery.data ?? [];

  const runAction = async (fn: () => Promise<unknown>, success: string) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(success);
      await refetch();
      await containerRequestsQuery.refetch();
      await milestonesQuery.refetch();
    } catch (err) {
      setActionError(
        err instanceof PortalApiError || err instanceof Error ? err.message : 'Action failed.',
      );
    }
  };

  if (isLoading) {
    return <PortalLoadingState label="Loading shipment…" />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">
          {error instanceof PortalApiError || error instanceof Error
            ? error.message
            : 'Shipment not found.'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <button
          type="button"
          className="block text-sm text-[var(--color-primary)] underline"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back
      </button>
      <PortalPageHeader
        title={data.reference}
        description={
          [data.origin, data.destination].filter(Boolean).join(' → ') || data.jobType || 'Shipment detail'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {data.status ? <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge> : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/portal/documents?job_id=${encodeURIComponent(id)}`)}
            >
              All documents
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/portal/messages?job_id=${encodeURIComponent(id)}`)}
            >
              Message
            </Button>
          </div>
        }
      />

      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-3">
        <PortalAnimatedGridItem>
          <PortalStatCard label="Pieces" value={data.pieces ?? '—'} Icon={Package} theme="orange" />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Gross weight" value={data.grossWeight ?? '—'} Icon={Scale} theme="navy" />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Volume (CBM)" value={data.volumeCbm ?? '—'} Icon={Box} theme="cyan" />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>

      {data.cargoSummary ? (
        <PortalPanel padded>
          <p className="text-sm text-[var(--color-neutral-700)]">{data.cargoSummary}</p>
        </PortalPanel>
      ) : null}

      {actionError ? (
        <p className="text-sm text-[var(--color-danger-600)]">{actionError}</p>
      ) : null}
      {actionMessage ? (
        <p className="text-sm text-[var(--color-success-700)]">{actionMessage}</p>
      ) : null}

      {isAir ? (
        <PortalPanel padded>
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-neutral-900)]">
            Air document requests
          </h2>
          <p className="mb-3 text-xs text-[var(--color-neutral-500)]">
            {isAirImport
              ? 'Import: request delivery order after payment / CAN gates.'
              : 'Export: air pallet / ULD request APIs were removed. Request draft HAWB when ready.'}
          </p>

          {isAirExport ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={actions.requestDraftHawb.isPending}
                onClick={() =>
                  void runAction(
                    () => actions.requestDraftHawb.mutateAsync({}),
                    'Draft HAWB requested.',
                  )
                }
              >
                Request draft HAWB
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={actions.requestDeliveryOrder.isPending}
                onClick={() =>
                  void runAction(
                    () => actions.requestDeliveryOrder.mutateAsync({}),
                    'Delivery order requested.',
                  )
                }
              >
                Request delivery order
              </Button>
            </div>
          )}
        </PortalPanel>
      ) : isNvoccOrSea ? (
        <PortalPanel padded>
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-neutral-900)]">
            Container & port actions
          </h2>
          <p className="mb-3 text-xs text-[var(--color-neutral-500)]">
            Sea export flow: confirm yard pick (status → Picked) after CRO, confirm port token, then
            request draft BL for Docs.
          </p>

          {containerRequestsQuery.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading container requests…</p>
          ) : containerRequests.length === 0 ? (
            <p className="mb-3 text-sm text-[var(--color-neutral-400)]">
              No container requests yet. Staff must issue CRO / allocate first.
            </p>
          ) : (
            <PortalAnimatedList className="mb-3 space-y-2">
              {containerRequests.map((req) => (
                <PortalAnimatedListItem
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {req.containerNumber || req.croNumber || req.containerType || 'Container line'}
                    </div>
                    <div className="text-xs text-[var(--color-neutral-500)]">
                      {[req.status, req.containerType, req.croNumber && `CRO ${req.croNumber}`]
                        .filter(Boolean)
                        .join(' · ') || req.lineId}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={req.canConfirmPick === false || actions.confirmPick.isPending}
                    onClick={() =>
                      void runAction(
                        () => actions.confirmPick.mutateAsync({ lineId: req.lineId }),
                        'Container pick confirmed — tracking Picked.',
                      )
                    }
                  >
                    Confirm pick
                  </Button>
                </PortalAnimatedListItem>
              ))}
            </PortalAnimatedList>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={actions.confirmPortToken.isPending}
              onClick={() =>
                void runAction(
                  () => actions.confirmPortToken.mutateAsync({}),
                  'Port token confirmed.',
                )
              }
            >
              Confirm port token
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={actions.requestDraftBl.isPending}
              onClick={() =>
                void runAction(() => actions.requestDraftBl.mutateAsync({}), 'Draft BL requested.')
              }
            >
              Request draft BL
            </Button>
          </div>
        </PortalPanel>
      ) : null}

      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Milestones</h2>
        {milestones.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No milestones yet.</p>
        ) : (
          <PortalGsapTimeline>
            {milestones.map((m, index) => (
              <PortalGsapTimelineItem key={m.id} isLast={index === milestones.length - 1}>
                <div className="text-sm font-medium text-[var(--color-neutral-800)]">{m.label}</div>
                <div className="text-xs text-[var(--color-neutral-500)]">
                  {[m.occurredAt, m.location, m.status].filter(Boolean).join(' · ') || '—'}
                </div>
                {m.notes ? (
                  <p className="mt-1 text-xs text-[var(--color-neutral-600)]">{m.notes}</p>
                ) : null}
              </PortalGsapTimelineItem>
            ))}
          </PortalGsapTimeline>
        )}
      </PortalPanel>

      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No documents available.</p>
        ) : (
          <PortalAnimatedList className="space-y-2">
            {documents.map((doc) => (
              <PortalAnimatedListItem
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{doc.name}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {doc.documentType || 'Document'}
                  </div>
                </div>
                {doc.canDownload !== false && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={download.isPending}
                    onClick={() =>
                      void download.mutateAsync({
                        shipmentId: id,
                        docId: doc.id,
                        name: doc.name,
                      })
                    }
                  >
                    <Download size={14} aria-hidden="true" />
                    Download
                  </Button>
                )}
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}
