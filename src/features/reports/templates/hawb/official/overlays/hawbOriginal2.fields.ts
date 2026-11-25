import type { HawbOverlaySlot } from './hawbOriginal1.fields';

/**
 * Field slots for HAWB Original-2 — MediaBox 595×845.
 * Percents from Fresa reference text extraction. No Fresa branding.
 */
export const HAWB_ORIGINAL2_OVERLAY_SLOTS: HawbOverlaySlot[] = [
  // Percents matched to Fresa Original-2 pdfjs text geometry (see reference-text-coords.json).
  { id: 'hawbNoTop', topPct: 4.9, leftPct: 72, widthPct: 25, fontSizePx: 11, fontWeight: 800, align: 'right' },
  { id: 'shipper', topPct: 8.8, leftPct: 3.4, widthPct: 48, fontSizePx: 8, fontWeight: 600 },
  { id: 'consignee', topPct: 17.1, leftPct: 3.4, widthPct: 48, fontSizePx: 8, fontWeight: 600 },
  { id: 'agent', topPct: 25.6, leftPct: 3.4, widthPct: 40, fontSizePx: 8, fontWeight: 600 },
  { id: 'handling', topPct: 30.5, leftPct: 70, widthPct: 26, fontSizePx: 8, fontWeight: 700, align: 'right' },
  { id: 'departure', topPct: 33.9, leftPct: 3.4, widthPct: 30, fontSizePx: 8, fontWeight: 700 },
  { id: 'mawbMid', topPct: 34.6, leftPct: 68, widthPct: 28, fontSizePx: 11, fontWeight: 800, align: 'right' },
  { id: 'toCode', topPct: 37.2, leftPct: 3.5, widthPct: 6, fontSizePx: 8, fontWeight: 700 },
  { id: 'flight', topPct: 37.1, leftPct: 7.4, widthPct: 16, fontSizePx: 8, fontWeight: 700 },
  { id: 'currency', topPct: 37.1, leftPct: 50.6, widthPct: 8, fontSizePx: 8, fontWeight: 700 },
  { id: 'declaredCarriage', topPct: 37.3, leftPct: 74, widthPct: 10, fontSizePx: 8, fontWeight: 700 },
  { id: 'declaredCustoms', topPct: 37.3, leftPct: 88, widthPct: 10, fontSizePx: 8, fontWeight: 700 },
  { id: 'destination', topPct: 39.9, leftPct: 3.4, widthPct: 32, fontSizePx: 8, fontWeight: 700 },
  { id: 'flightDate', topPct: 40.2, leftPct: 29, widthPct: 24, fontSizePx: 8, fontWeight: 600 },
  { id: 'insurance', topPct: 40.1, leftPct: 56.4, widthPct: 12, fontSizePx: 8, fontWeight: 700 },
  { id: 'marks', topPct: 42.9, leftPct: 3.4, widthPct: 30, fontSizePx: 8 },
  { id: 'packagesLine', topPct: 45.4, leftPct: 3.4, widthPct: 40, fontSizePx: 8 },
  { id: 'pieces', topPct: 50.6, leftPct: 3.7, widthPct: 6, fontSizePx: 9, fontWeight: 700 },
  { id: 'gross', topPct: 50.6, leftPct: 9.9, widthPct: 10, fontSizePx: 9, fontWeight: 700 },
  { id: 'kg', topPct: 50.6, leftPct: 16.8, widthPct: 4, fontSizePx: 9, fontWeight: 700 },
  { id: 'rateClass', topPct: 50.6, leftPct: 19.6, widthPct: 4, fontSizePx: 9, fontWeight: 700 },
  { id: 'chargeable', topPct: 50.6, leftPct: 34.8, widthPct: 10, fontSizePx: 9, fontWeight: 700 },
  { id: 'nature', topPct: 50.5, leftPct: 72.6, widthPct: 24, fontSizePx: 8, fontWeight: 600 },
  { id: 'carrierSign', topPct: 82.0, leftPct: 60.5, widthPct: 35, fontSizePx: 8, fontWeight: 700 },
  { id: 'executedOn', topPct: 89.1, leftPct: 46.2, widthPct: 12, fontSizePx: 8, fontWeight: 700 },
  { id: 'executedAt', topPct: 89.1, leftPct: 59.7, widthPct: 14, fontSizePx: 8, fontWeight: 700 },
  { id: 'hawbNoFooter', topPct: 93.3, leftPct: 72, widthPct: 25, fontSizePx: 11, fontWeight: 800, align: 'right' },
  // Issued-by band (right of shipper) — never over shipper name/address.
  { id: 'branding', topPct: 7.0, leftPct: 49, widthPct: 30, fontSizePx: 8, fontWeight: 700 },
];
