import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { useVendorPortalJobs } from '../hooks/useVendorJobOffers';
import {
  coerceVendorOfferStatus,
  vendorOfferStatusLabel,
} from '../utils/vendorOfferStatus';

function statusVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = coerceVendorOfferStatus(status);
  if (s === 'APPROVED') return 'success';
  if (s === 'DISAPPROVED') return 'danger';
  if (s === 'NEGOTIATING') return 'warning';
  if (s === 'VENDOR_REVIEW' || s === 'SENT') return 'info';
  return 'neutral';
}

export default function VendorJobsPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorPortalJobs(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Jobs"
        description="Jobs assigned to you for cost pricing. Customer sell prices are never shown here."
      />
      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No jobs yet"
            description="When your forwarder passes a job to your vendor party account, it appears here for pricing. Sign in with a user linked to that same party."
            Icon={Briefcase}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((job) => (
              <PortalAnimatedListItem
                key={job.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <Link to={`/vendor/jobs/${job.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">
                    {job.jobNumber || job.id}
                  </div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[
                      job.jobType?.replaceAll('_', ' '),
                      [job.origin, job.destination].filter(Boolean).join(' → ') || null,
                      job.etd ? `ETD ${job.etd}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </Link>
                {job.offerStatus ? (
                  <Badge variant={statusVariant(job.offerStatus)}>
                    {vendorOfferStatusLabel(job.offerStatus)}
                  </Badge>
                ) : job.status ? (
                  <Badge variant="info">{job.status.replaceAll('_', ' ')}</Badge>
                ) : null}
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 ? (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
