export const PUBLIC_TRACK_API = {
  /** GET /track?ref=… — public shipment track by reference */
  track: '/track',
  /** GET /track/{ref} — same payload via path (share links) */
  trackByRef: (ref: string) => `/track/${encodeURIComponent(ref)}`,
  /** GET /track/pdf?ref=… — server PDF (ref only; tenant_slug optional/deprecated) */
  trackPdf: '/track/pdf',
  /** GET /track/live/flight?q=… — live flight card (public) */
  liveFlight: '/track/live/flight',
  /** GET /track/live/vessel?q=… — live vessel / AIS card (public) */
  liveVessel: '/track/live/vessel',
  embed: '/track/embed',
  widget: '/track/widget.js',
} as const;
