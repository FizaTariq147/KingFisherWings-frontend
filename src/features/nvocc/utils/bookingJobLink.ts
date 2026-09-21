const STORAGE_PREFIX = 'kf.nvocc.bookingJobLink.v1:';

function keyForBooking(bookingId: string): string {
  return `${STORAGE_PREFIX}${bookingId.trim()}`;
}

/** Remember job created from booking convert (API often omits job_id on booking GET). */
export function rememberBookingJobLink(opts: {
  bookingId?: string | null;
  jobId?: string | null;
  jobType?: string | null;
}): void {
  if (typeof sessionStorage === 'undefined') return;
  const bookingId = opts.bookingId?.trim();
  const jobId = opts.jobId?.trim();
  if (!bookingId || !jobId) return;
  try {
    sessionStorage.setItem(
      keyForBooking(bookingId),
      JSON.stringify({
        jobId,
        jobType: opts.jobType?.trim() || undefined,
        at: new Date().toISOString(),
      }),
    );
  } catch {
    /* ignore */
  }
}

export function readRememberedJobForBooking(bookingId?: string | null): {
  jobId: string;
  jobType?: string;
} | null {
  if (typeof sessionStorage === 'undefined' || !bookingId?.trim()) return null;
  try {
    const raw = sessionStorage.getItem(keyForBooking(bookingId.trim()));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { jobId?: string; jobType?: string };
    if (!parsed?.jobId?.trim()) return null;
    return { jobId: parsed.jobId.trim(), jobType: parsed.jobType?.trim() };
  } catch {
    return null;
  }
}
