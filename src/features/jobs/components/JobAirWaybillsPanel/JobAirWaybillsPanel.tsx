import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SectionAttachmentsPanel } from '@/features/shared/section-attachments';
import { BlDraftFromBookingPanel } from '@/features/shared/bl-draft/BlDraftFromBookingPanel';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJob, useJobAirWaybills } from '../../hooks/useJobs';
import type { AirWaybillType, UpsertAirWaybillDto } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { AIR_BOOKING_FORM_LIMITS } from '../../utils/airBookingFormLimits';

interface JobAirWaybillsPanelProps {
  jobId: string;
}

/**
 * AIR_EXPORT / AIR_IMPORT — MAWB/HAWB records via GET/POST/PATCH/DELETE /jobs/:id/air-waybills.
 * Sea modes keep bills-of-lading; other job types cannot use this API.
 */
export function JobAirWaybillsPanel({ jobId }: JobAirWaybillsPanelProps) {
  const { data: job } = useJob(jobId);
  const { data: bills = [], refetch } = useJobAirWaybills(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const [error, setError] = useState<string | null>(null);
  const [awbType, setAwbType] = useState<AirWaybillType>('HAWB');
  const [awbNumber, setAwbNumber] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [flightStatus, setFlightStatus] = useState('');
  const draftBlComment = job?.draft_bl_customer_comment?.trim();

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      await refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const createDto = (): UpsertAirWaybillDto => ({
    awb_type: awbType,
    awb_number: awbNumber.trim() || undefined,
    flight_number: flightNumber.trim() || undefined,
    flight_status: flightStatus.trim() || undefined,
  });

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      {draftBlComment ? (
        <Card>
          <CardHeader>
            <CardTitle>Customer draft AWB request</CardTitle>
          </CardHeader>
          <div className="space-y-1 px-4 pb-4 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              Comment from portal
            </p>
            <p className="whitespace-pre-wrap break-words text-[13px] font-medium text-[#0f172a]">
              {draftBlComment}
            </p>
          </div>
        </Card>
      ) : (
        <p className="text-xs text-[var(--color-neutral-500)]">
          No customer draft AWB comment yet. When the portal submits a draft request with a
          comment, it appears here for Docs / ops.
        </p>
      )}
      <BlDraftFromBookingPanel
        jobId={jobId}
        onGenerated={() => {
          void refetch();
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Airway bills</CardTitle>
        </CardHeader>
        <div className="space-y-2 px-4 pb-4 text-sm">
          {bills.length === 0 ? (
            <p className="text-[var(--color-neutral-400)]">No airway bills.</p>
          ) : (
            bills.map((b) => (
              <div key={b.id} className="space-y-2 border-b py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {b.awb_type || 'AWB'} {b.awb_number || b.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Flight: {b.flight_number || '—'}
                      {b.flight_status ? ` · ${b.flight_status}` : ''} · Original:{' '}
                      {b.is_original ? 'Yes' : 'No'}
                      {b.is_draft ? ' · Draft' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(() =>
                          mutations.updateAirWaybill.mutateAsync({
                            awbId: b.id,
                            dto: { is_original: true, is_draft: false },
                          }),
                        )
                      }
                    >
                      Mark original
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        run(() => mutations.deleteAirWaybill.mutateAsync(b.id))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <SectionAttachmentsPanel
                  entity="jobs"
                  entityId={jobId}
                  section="air_waybills"
                  recordId={b.id}
                  title="AWB files"
                  compact
                />
              </div>
            ))
          )}
          <SectionAttachmentsPanel
            entity="jobs"
            entityId={jobId}
            section="air_waybills"
            compact
          />
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Create Airway Bill</CardTitle>
        </CardHeader>
        <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
          <label className="block space-y-1 text-xs font-medium text-[var(--color-neutral-600)]">
            AWB type
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={awbType}
              onChange={(e) => setAwbType(e.target.value as AirWaybillType)}
            >
              <option value="HAWB">HAWB</option>
              <option value="MAWB">MAWB</option>
            </select>
          </label>
          <Input
            label="AWB number"
            maxLength={AIR_BOOKING_FORM_LIMITS.mawb_number}
            value={awbNumber}
            onChange={(e) => setAwbNumber(e.target.value)}
          />
          <Input
            label="Flight number"
            maxLength={AIR_BOOKING_FORM_LIMITS.flight_number}
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
          />
          <Input
            label="Flight status"
            maxLength={AIR_BOOKING_FORM_LIMITS.flight_status}
            value={flightStatus}
            onChange={(e) => setFlightStatus(e.target.value)}
          />
          <Button
            type="button"
            disabled={mutations.createAirWaybill.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createAirWaybill.mutateAsync(createDto());
                setAwbNumber('');
                setFlightNumber('');
                setFlightStatus('');
              })
            }
          >
            Create AWB
          </Button>
        </div>
      </Card>
    </div>
  );
}
