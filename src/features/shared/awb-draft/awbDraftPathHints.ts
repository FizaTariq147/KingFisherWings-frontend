import { isUuid } from '@/lib/isUuid';

/** True when detail `path_hints` point at HAWB/MAWB/AWB draft routes. */
export function hasAwbDraftPathHint(
  hints?: string[] | Record<string, string> | null,
): boolean {
  const list = Array.isArray(hints)
    ? hints
    : hints && typeof hints === 'object'
      ? Object.keys(hints)
      : [];
  return list.some((h) => /(?:hawb|mawb|awb)[-_/]?draft/i.test(String(h || '')));
}

/**
 * Extract linked job / shipment ids from AWB draft path hints, e.g.
 * `/jobs/{uuid}/hawb-draft/preview` or `/shipments/{uuid}/awb-draft/generate`.
 */
export function pickAwbDraftIdsFromPathHints(
  hints?: string[] | Record<string, string> | null,
): { jobId?: string; shipmentId?: string } {
  const list = Array.isArray(hints)
    ? hints
    : hints && typeof hints === 'object'
      ? [...Object.keys(hints), ...Object.values(hints).map(String)]
      : [];

  let jobId: string | undefined;
  let shipmentId: string | undefined;

  for (const raw of list) {
    const h = String(raw || '');
    const jobMatch = h.match(
      /\/jobs\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(?:hawb|mawb|awb)-draft/i,
    );
    if (jobMatch?.[1] && isUuid(jobMatch[1])) jobId = jobMatch[1];

    const shipMatch = h.match(
      /\/shipments\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(?:hawb|mawb|awb)-draft/i,
    );
    if (shipMatch?.[1] && isUuid(shipMatch[1])) shipmentId = shipMatch[1];
  }

  return { jobId, shipmentId };
}
