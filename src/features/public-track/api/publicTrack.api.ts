export const PUBLIC_TRACK_API = {
  /** GET /track?ref=… — public shipment track by reference */
  track: '/track',
  /** GET /track/{ref} — same payload via path (share links) */
  trackByRef: (ref: string) => `/track/${encodeURIComponent(ref)}`,
  /** GET /track/pdf?ref=… — server PDF (ref only; tenant_slug optional/deprecated) */
  trackPdf: '/track/pdf',
  embed: '/track/embed',
  widget: '/track/widget.js',
} as const;
