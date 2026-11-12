import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PublicTrackTimeline } from '@/features/public-track/components/PublicTrackTimeline';
import { TrackMapBackground } from '@/features/public-track/components/TrackMapBackground';
import { TrackOverlayFrame } from '@/features/public-track/components/TrackOverlayFrame';
import { toTrackResult } from '@/features/public-track/utils/toTrackResult';
import { normalizeLiveTracking } from '@/features/public-track/utils/normalizeLiveTracking';
import { useJob, useJobTracking, useJobTrackingLive } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { JobTrackingProfileEditor } from '../JobTrackingProfileEditor';

/**
 * Dedicated Track & Trace tab body. Mounted only while the tab is active,
 * so GET /jobs/:id/tracking runs on open (action button or tab strip).
 * Also polls GET /jobs/:id/tracking/live for the live vessel/flight card.
 */
export function JobTrackTracePanel({
  jobId,
  jobNumber,
  shipmentId,
}: {
  jobId: string;
  jobNumber?: string;
  shipmentId?: string;
}) {
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const jobQuery = useJob(jobId);
  const trackingQuery = useJobTracking(
    {
      jobId,
      jobNumber,
      shipmentId,
    },
    Boolean(jobId),
  );
  const liveQuery = useJobTrackingLive(jobId, Boolean(jobId));

  const trackResult = useMemo(() => {
    const job = jobQuery.data;
    const raw = trackingQuery.data?.data ?? trackingQuery.data;
    const withJobSchedule =
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? {
            ...(raw as Record<string, unknown>),
            job_type:
              (raw as { job_type?: string; jobType?: string }).job_type ||
              (raw as { jobType?: string }).jobType ||
              job?.job_type,
            // Fall back to job / mode schedule when tracking route has no dates.
            etd:
              (raw as { etd?: string }).etd ||
              job?.etd ||
              job?.sea_fcl_details?.etd ||
              job?.sea_lcl_details?.etd ||
              job?.air_details?.flight_date,
            eta:
              (raw as { eta?: string }).eta ||
              job?.eta ||
              job?.sea_fcl_details?.eta ||
              job?.sea_lcl_details?.eta,
          }
        : raw;
    const base = toTrackResult(withJobSchedule, jobNumber || jobId);
    const withSchedule = {
      ...base,
      etd:
        base.etd ||
        job?.etd ||
        job?.sea_fcl_details?.etd ||
        job?.sea_lcl_details?.etd ||
        job?.air_details?.flight_date,
      expectedDelivery:
        base.expectedDelivery ||
        job?.eta ||
        job?.sea_fcl_details?.eta ||
        job?.sea_lcl_details?.eta,
    };
    if (withSchedule.liveTracking) return withSchedule;
    const live = normalizeLiveTracking(liveQuery.data);
    return live ? { ...withSchedule, liveTracking: live } : withSchedule;
  }, [
    trackingQuery.data,
    liveQuery.data,
    jobNumber,
    jobId,
    jobQuery.data,
  ]);

  return (
    <div className="rounded-sm bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Track &amp; Trace
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setShowProfileEditor((v) => !v)}
        >
          {showProfileEditor ? 'Hide profile editor' : 'Edit tracking profile'}
        </Button>
      </div>
      <div className="space-y-4">
        {showProfileEditor ? (
          <div className="mx-3 mt-3 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-3 sm:mx-4 sm:px-4">
            <JobTrackingProfileEditor
              jobId={jobId}
              onCancel={() => setShowProfileEditor(false)}
              onSaved={() => {
                void trackingQuery.refetch();
                void liveQuery.refetch();
              }}
            />
          </div>
        ) : null}
        {trackingQuery.isLoading ? (
          <p className="px-5 py-6 text-[13px] text-[#64748b]">Loading tracking…</p>
        ) : trackingQuery.isError ? (
          <p className="px-5 py-6 text-[13px] text-red-700">
            {getErrorMessage(trackingQuery.error)}
          </p>
        ) : (
          <div className="relative h-[min(70vh,640px)] min-h-[560px] overflow-hidden rounded-b-sm bg-[#0B1220]">
            <TrackMapBackground result={trackResult} showLiveBadge />
            <TrackOverlayFrame>
              <PublicTrackTimeline
                variant="overlay"
                className="h-full min-h-0 shadow-2xl"
                result={trackResult}
                pdfSource={{ kind: 'job', jobId }}
              />
            </TrackOverlayFrame>
          </div>
        )}
      </div>
    </div>
  );
}
