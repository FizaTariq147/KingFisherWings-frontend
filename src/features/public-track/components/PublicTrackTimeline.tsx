import { Badge } from '@/components/ui/Badge';
import type { PublicTrackResult } from '../types/publicTrack.types';

function formatWhen(value?: string): string {
  if (!value?.trim()) return '';
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value;
  return new Date(t).toLocaleString();
}

export function PublicTrackTimeline({ result }: { result: PublicTrackResult }) {
  const status = result.currentStatus || result.status;
  const progress =
    result.progress != null && Number.isFinite(result.progress)
      ? Math.max(0, Math.min(100, Math.round(result.progress)))
      : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-[var(--color-neutral-900)]">
            {result.reference}
          </div>
          <div className="text-sm text-[var(--color-neutral-500)]">
            {[result.origin, result.destination].filter(Boolean).join(' → ') ||
              result.jobType ||
              '—'}
          </div>
          {result.expectedDelivery ? (
            <p className="mt-1 text-sm text-[var(--color-neutral-700)]">
              Expected delivery:{' '}
              <span className="font-medium">{formatWhen(result.expectedDelivery)}</span>
            </p>
          ) : null}
        </div>
        {status ? (
          <Badge variant="info">{status.replaceAll('_', ' ')}</Badge>
        ) : null}
      </div>

      {progress != null ? (
        <div>
          <div className="mb-1 flex justify-between text-[11px] font-medium uppercase tracking-wide text-[var(--color-neutral-500)]">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {result.matches && result.matches.length > 1 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <p className="font-medium">Multiple matches</p>
          <ul className="mt-1 list-disc pl-5 text-[13px]">
            {result.matches.map((m) => (
              <li key={`${m.kind}-${m.reference}`}>
                {m.reference}
                {m.kind ? ` (${m.kind})` : ''}
                {m.status ? ` · ${m.status}` : ''}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[12px]">
            Showing the primary match. Refine the reference if this is not the correct shipment.
          </p>
        </div>
      ) : null}

      <div>
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
          Timeline
        </h3>
        {result.milestones.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-500)]">
            No milestones returned for this reference yet.
          </p>
        ) : (
          <ol className="relative space-y-0 border-l border-[var(--color-neutral-200)] pl-5">
            {result.milestones.map((m) => {
              const done = !m.pending && Boolean(m.completedAt || m.occurredAt);
              return (
                <li key={m.id} className="relative pb-5 last:pb-0">
                  <span
                    className={`absolute -left-[1.4rem] top-1 h-3 w-3 rounded-full border-2 ${
                      done
                        ? 'border-[var(--color-success-600,#16a34a)] bg-[var(--color-success-600,#16a34a)]'
                        : 'border-[var(--color-warning-500,#f59e0b)] bg-white'
                    }`}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-neutral-900)]">
                      {m.label}
                    </p>
                    <Badge variant={done ? 'success' : 'warning'}>
                      {done ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  {m.description ? (
                    <p className="mt-0.5 text-[13px] text-[var(--color-neutral-600)]">
                      {m.description}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-[12px] text-[var(--color-neutral-500)]">
                    {[formatWhen(m.completedAt || m.occurredAt), m.location]
                      .filter(Boolean)
                      .join(' · ') || (done ? '—' : 'Awaiting update')}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
