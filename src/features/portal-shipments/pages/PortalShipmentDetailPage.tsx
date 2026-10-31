import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Package, Scale, Box } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import { ApiDataView } from '@/features/jobs/components/ApiDataView';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import { PublicTrackTimeline } from '@/features/public-track/components/PublicTrackTimeline';
import { normalizePublicTrack } from '@/features/public-track/utils/normalizePublicTrack';
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
import { PortalAcknowledgementPanel } from '../components/PortalAcknowledgementPanel';
import { PortalPortTokenModal } from '../components/PortalPortTokenModal';
import {
  useDownloadPortalShipmentDocument,
  usePortalShipment,
  usePortalShipmentActions,
  usePortalShipmentContainerRequests,
  usePortalShipmentDocuments,
  usePortalShipmentMilestones,
  usePortalShipmentTracking,
} from '../hooks/usePortalShipments';
import { portalMilestoneDotTone } from '../utils/normalizePortalShipments';

export default function PortalShipmentDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalShipment(id);
  const milestonesQuery = usePortalShipmentMilestones(id, Boolean(data) && !data?.milestones?.length);
  const documentsQuery = usePortalShipmentDocuments(id, Boolean(data));
  const [showTracking, setShowTracking] = useState(false);
  const trackingQuery = usePortalShipmentTracking(id, showTracking && Boolean(data));
  const isAirExport = data?.jobType === 'AIR_EXPORT';
  const isAirImport = data?.jobType === 'AIR_IMPORT';
  const isAir =
    isAirExport ||
    isAirImport ||
    String(data?.jobType ?? '').startsWith('AIR_');
  const isRoadLand =
    data?.jobType === 'ROAD_FREIGHT' ||
    data?.jobType === 'LAND' ||
    String(data?.jobType ?? '').toUpperCase() === 'ROAD_FREIGHT';
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
  const [portTokenOpen, setPortTokenOpen] = useState(false);

  const milestones = data?.milestones?.length ? data.milestones : milestonesQuery.data ?? [];
  const documents = data?.documents?.length ? data.documents : documentsQuery.data ?? [];
  const containerRequests = containerRequestsQuery.data ?? [];

  const runAction = async (fn: () => Promise<unknown>, success: string): Promise<boolean> => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(success);
      await refetch();
      await containerRequestsQuery.refetch();
      await milestonesQuery.refetch();
      return true;
    } catch (err) {
      let msg =
        err instanceof PortalApiError || err instanceof Error ? err.message : 'Action failed.';
      const fromBackend404 =
        err instanceof PortalApiError && (err.status === 404 || /not found/i.test(msg));
      // Air HAWB gate message on a sea/NVOCC job usually means wrong job_type on the shipment.
      if (
        isNvoccOrSea &&
        /house air waybill|draft hawb|build-up started/i.test(msg)
      ) {
        msg = `${msg} This shipment is treated as ${data?.jobType || 'sea'} on the portal — if you expected draft BL, the job type may be wrong on the server.`;
      } else if (
        isAirExport &&
        /invoice must be sent|build-up started/i.test(msg)
      ) {
        msg = `${msg} Ask ops to send the invoice or mark build-up, then try again.`;
      }
      setActionError(
        fromBackend404
          ? `${msg} Staff must finish convert-to-job and link this shipment to your portal customer before pick / port token / draft BL work.`
          : msg,
      );
      return false;
    }
  };

  if (isLoading) {
    return <PortalLoadingState label="Loading shipment…" />;
  }

  if (isError || !data) {
    const notFound =
      error instanceof PortalApiError && (error.status === 404 || /not found/i.test(error.message));
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">
          {error instanceof PortalApiError || error instanceof Error
            ? error.message
            : 'Shipment not found.'}
        </p>
        {notFound ? (
          <p className="text-xs text-[var(--color-neutral-500)]">
            The portal API returned 404 for this shipment id (backend: job not linked to this
            customer, wrong id, or detail route unavailable).
          </p>
        ) : null}
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <button
          type="button"
          className="block text-sm text-[var(--color-primary)] underline"
          onClick={() => navigate('/portal/shipments')}
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
        onClick={() => navigate('/portal/shipments')}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back
      </button>
      <PortalPageHeader
        title={data.jobNumber || data.reference}
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
              onClick={() => {
                setShowTracking((v) => !v);
                if (!showTracking) {
                  window.setTimeout(() => {
                    document
                      .getElementById('portal-shipment-track-trace')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 80);
                }
              }}
            >
              {showTracking ? 'Hide Tracking' : 'Track & Trace'}
            </Button>
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

      {(() => {
        const jobTypeUpper = String(data.jobType ?? '').toUpperCase();
        const isAirJob = jobTypeUpper.startsWith('AIR');
        const isCourierJob = jobTypeUpper.includes('COURIER');
        const isRoadLandJob =
          jobTypeUpper === 'LAND' ||
          jobTypeUpper === 'ROAD_FREIGHT' ||
          jobTypeUpper.includes('ROAD');

        const documentRef = (() => {
          if (isAirJob) {
            if (data.hawbNumber) return { label: 'HAWB', value: data.hawbNumber };
            if (data.mawbNumber) return { label: 'MAWB', value: data.mawbNumber };
            return { label: 'HAWB / MAWB', value: '' };
          }
          if (isCourierJob) {
            return {
              label: 'Tracking number',
              value: data.trackingNumber || '',
            };
          }
          if (isRoadLandJob) {
            return {
              label: 'Reference',
              value: data.reference && data.reference !== data.jobNumber ? data.reference : '',
            };
          }
          // Sea / NVOCC / default — BL with HBL/MBL fallbacks
          if (data.blNumber) return { label: 'BL number', value: data.blNumber };
          if (data.hblNumber) return { label: 'HBL number', value: data.hblNumber };
          if (data.mblNumber) return { label: 'MBL number', value: data.mblNumber };
          return { label: 'BL number', value: '' };
        })();

        const containersValue = data.containerNumbers?.join(', ') || '';
        const containersLabel = isAirJob ? 'ULD / pallets' : 'Containers';
        const missingNotes: string[] = [];
        if (!containersValue) {
          missingNotes.push(
            isAirJob
              ? 'ULD / pallet numbers were not returned by the API.'
              : 'Container numbers were not returned by the API.',
          );
        }
        if (!documentRef.value) {
          missingNotes.push(`${documentRef.label} was not returned by the API.`);
        }

        return (
          <>
            <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-3">
              <PortalAnimatedGridItem>
                <PortalStatCard
                  label="Job number"
                  value={data.jobNumber || data.reference || '—'}
                  Icon={Package}
                  theme="orange"
                />
              </PortalAnimatedGridItem>
              <PortalAnimatedGridItem>
                <PortalStatCard
                  label={containersLabel}
                  value={containersValue || '—'}
                  Icon={Box}
                  theme="navy"
                />
              </PortalAnimatedGridItem>
              <PortalAnimatedGridItem>
                <PortalStatCard
                  label={documentRef.label}
                  value={documentRef.value || '—'}
                  Icon={Scale}
                  theme="cyan"
                />
              </PortalAnimatedGridItem>
            </PortalAnimatedGrid>
            {missingNotes.length ? (
              <p className="text-xs text-[var(--color-neutral-500)]" role="status">
                {missingNotes.join(' ')}
              </p>
            ) : null}
          </>
        );
      })()}

      {(data.rotationNumber ||
        (data.hblNumber && data.blNumber) ||
        (data.mblNumber && data.blNumber)) && (
        <PortalPanel padded>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-neutral-900)]">
            Ops references
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              data.blNumber && data.hblNumber && data.blNumber !== data.hblNumber
                ? (['HBL', data.hblNumber] as const)
                : null,
              data.blNumber && data.mblNumber && data.blNumber !== data.mblNumber
                ? (['MBL', data.mblNumber] as const)
                : null,
              data.rotationNumber ? (['Rotation', data.rotationNumber] as const) : null,
              data.containerStatus
                ? (['Container status', data.containerStatus] as const)
                : null,
            ]
              .filter((row): row is readonly [string, string] => Boolean(row))
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--color-neutral-800)]">
                    {value}
                  </dd>
                </div>
              ))}
          </dl>
        </PortalPanel>
      )}

      {data.hold ? (
        <PortalPanel padded>
          <h2 className="mb-2 text-sm font-semibold text-amber-950">Hold</h2>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-[var(--color-neutral-800)]">
            {data.hold.holdReason ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
                  Reason
                </dt>
                <dd>{data.hold.holdReason}</dd>
              </div>
            ) : null}
            {data.hold.heldAt ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
                  Held at
                </dt>
                <dd>{new Date(data.hold.heldAt).toLocaleString()}</dd>
              </div>
            ) : null}
            {data.hold.expectedReleaseAt ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
                  Expected release
                </dt>
                <dd>{new Date(data.hold.expectedReleaseAt).toLocaleString()}</dd>
              </div>
            ) : null}
            {data.hold.resumeReason ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
                  Resume reason
                </dt>
                <dd>{data.hold.resumeReason}</dd>
              </div>
            ) : null}
            {data.hold.resumedAt ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
                  Resumed at
                </dt>
                <dd>{new Date(data.hold.resumedAt).toLocaleString()}</dd>
              </div>
            ) : null}
          </dl>
        </PortalPanel>
      ) : null}

      {data.cargoSummary ? (
        <PortalPanel padded>
          <p className="text-sm text-[var(--color-neutral-700)]">{data.cargoSummary}</p>
        </PortalPanel>
      ) : null}

      {isRoadLand ? (
        <PortalPanel padded>
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
            Road freight details
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Service scope', data.serviceScope],
              ['Cargo category', data.cargoCategory],
              ['Incoterms', data.incoterms],
              ['Vehicle type', data.vehicleType],
              ['Origin city / country', data.originCityCountry],
              ['Destination city / country', data.destinationCityCountry],
              ['Origin door', data.originDoorAddress],
              ['Dest door', data.destDoorAddress],
            ].map(([label, value]) =>
              value ? (
                <div key={label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--color-neutral-800)]">
                    {String(value).replaceAll('_', ' ')}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>
          {!data.serviceScope &&
          !data.originDoorAddress &&
          !data.originCityCountry &&
          !data.vehicleType ? (
            <p className="mt-2 text-xs text-[var(--color-neutral-500)]">
              Route and door details will appear once ops fills the road freight job.
            </p>
          ) : null}
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
              : 'Export: request draft HAWB after staff has sent the invoice or marked build-up. The portal will reject the request until that gate is met.'}
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

          {containerRequestsQuery.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading containers…</p>
          ) : containerRequests.length === 0 ? (
            <p className="mb-3 text-sm text-[var(--color-neutral-400)]">
              No containers yet — refresh after staff has converted the booking to a job.
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
              onClick={() => setPortTokenOpen(true)}
            >
              Confirm port token
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={actions.requestDraftBl.isPending}
              onClick={() =>
                void runAction(
                  () =>
                    actions.requestDraftBl.mutateAsync({
                      // Required by PortalRequestDraftBlDto; air HAWB posts {}.
                      comment: 'Customer requested draft BL',
                    }),
                  'Draft BL requested.',
                )
              }
            >
              Request draft BL
            </Button>
          </div>
        </PortalPanel>
      ) : null}

      {portTokenOpen ? (
        <PortalPortTokenModal
          open
          pending={actions.confirmPortToken.isPending}
          defaults={{
            bl_number: data.blNumber || data.hblNumber || data.mblNumber || '',
            container_number: data.containerNumbers?.[0] || '',
          }}
          onClose={() => setPortTokenOpen(false)}
          onSubmit={async (dto) => {
            const ok = await runAction(
              () => actions.confirmPortToken.mutateAsync(dto),
              'Port token confirmed.',
            );
            if (ok) setPortTokenOpen(false);
          }}
        />
      ) : null}

      {showTracking ? (
        <PortalPanel padded>
          <div
            id="portal-shipment-track-trace"
            className="mb-3 flex items-center justify-between gap-2"
          >
            <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
              Track &amp; Trace
            </h2>
            <Button type="button" size="sm" variant="secondary" onClick={() => setShowTracking(false)}>
              Hide
            </Button>
          </div>
          {trackingQuery.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-500)]">Loading tracking…</p>
          ) : trackingQuery.isError ? (
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(trackingQuery.error, 'Could not load tracking.')}
            </p>
          ) : (
            (() => {
              const track = normalizePublicTrack(trackingQuery.data);
              if (track) return <PublicTrackTimeline result={track} />;
              return (
                <ApiDataView
                  data={trackingQuery.data ?? {}}
                  emptyLabel="No tracking data returned."
                />
              );
            })()
          )}
        </PortalPanel>
      ) : null}

      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Milestones</h2>
        {milestones.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No milestones yet.</p>
        ) : (
          <PortalGsapTimeline orientation="horizontal">
            {milestones.map((m, index) => (
              <PortalGsapTimelineItem
                key={m.id}
                isLast={index === milestones.length - 1}
                tone={portalMilestoneDotTone(m)}
                orientation="horizontal"
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold leading-snug text-[var(--color-neutral-900)]">
                    {m.label}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-neutral-600)]">
                    {m.status ? (
                      <span className="font-medium uppercase tracking-wide text-[var(--color-neutral-500)]">
                        {m.status.replaceAll('_', ' ')}
                      </span>
                    ) : null}
                    {m.status && (m.occurredAt || m.location) ? (
                      <span aria-hidden className="text-[var(--color-neutral-300)]">
                        ·
                      </span>
                    ) : null}
                    {m.occurredAt ? (
                      <span>
                        {(() => {
                          const t = Date.parse(m.occurredAt);
                          return Number.isFinite(t)
                            ? new Date(t).toLocaleString()
                            : m.occurredAt;
                        })()}
                      </span>
                    ) : null}
                    {m.occurredAt && m.location ? (
                      <span aria-hidden className="text-[var(--color-neutral-300)]">
                        ·
                      </span>
                    ) : null}
                    {m.location ? <span>{m.location}</span> : null}
                    {!m.occurredAt && !m.location && !m.status ? (
                      <span className="text-[var(--color-neutral-400)]">Awaiting update</span>
                    ) : null}
                  </div>
                  {m.notes ? (
                    <p className="text-xs text-[var(--color-neutral-600)]">{m.notes}</p>
                  ) : null}
                </div>
              </PortalGsapTimelineItem>
            ))}
          </PortalGsapTimeline>
        )}
      </PortalPanel>

      <PortalPanel padded>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-neutral-900)]">Documents</h2>
        {data.documentsSummary ? (
          <p className="mb-3 text-xs text-[var(--color-neutral-500)]">
            {[
              data.documentsSummary.visible != null
                ? `${data.documentsSummary.visible} shared with you`
                : null,
              data.documentsSummary.total != null
                ? `${data.documentsSummary.total} total`
                : null,
              data.documentsSummary.bookingFormAttached != null
                ? `${data.documentsSummary.bookingFormAttached} booking docs`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
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
                {doc.canDownload !== false ? (
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
                ) : (
                  <span className="text-[11px] text-[var(--color-neutral-400)]">View only</span>
                )}
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      <PortalAcknowledgementPanel
        shipmentId={id}
        statusHint={data.acknowledgementStatus}
      />
    </div>
  );
}
