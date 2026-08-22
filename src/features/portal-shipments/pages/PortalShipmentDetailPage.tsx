import { Link, useNavigate, useParams } from 'react-router-dom';
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
  usePortalShipmentDocuments,
  usePortalShipmentMilestones,
} from '../hooks/usePortalShipments';

export default function PortalShipmentDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalShipment(id);
  const milestonesQuery = usePortalShipmentMilestones(id, Boolean(data) && !data?.milestones?.length);
  const documentsQuery = usePortalShipmentDocuments(id, Boolean(data));
  const download = useDownloadPortalShipmentDocument();

  const milestones = data?.milestones?.length ? data.milestones : milestonesQuery.data ?? [];
  const documents = data?.documents?.length ? data.documents : documentsQuery.data ?? [];

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
        <Link to="/portal/shipments" className="block text-sm text-[var(--color-primary)] underline">
          Back to shipments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/portal/shipments"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to shipments
      </Link>
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
