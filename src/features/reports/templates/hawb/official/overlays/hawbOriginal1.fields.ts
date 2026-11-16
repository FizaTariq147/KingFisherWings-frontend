/**
 * Field slots for HAWB Original-1 — percentages derived from Fresa reference
 * text extraction (pdfjs), MediaBox 737×923. No Fresa branding strings.
 */
export type HawbOverlaySlot = {
  id: string;
  topPct: number;
  leftPct: number;
  widthPct: number;
  fontSizePx?: number;
  fontWeight?: number;
  align?: 'left' | 'right' | 'center';
};

export const HAWB_ORIGINAL1_OVERLAY_SLOTS: HawbOverlaySlot[] = [
  // Percents matched to Fresa Original-1 pdfjs text geometry (see reference-text-coords.json).
  { id: 'hawbNoTop', topPct: 2.9, leftPct: 58, widthPct: 38, fontSizePx: 11, fontWeight: 800, align: 'right' },
  { id: 'mawbTop', topPct: 3.0, leftPct: 14, widthPct: 30, fontSizePx: 9, fontWeight: 700 },
  { id: 'shipper', topPct: 5.4, leftPct: 4.5, widthPct: 42, fontSizePx: 8, fontWeight: 600 },
  { id: 'consignee', topPct: 14.4, leftPct: 4.5, widthPct: 42, fontSizePx: 8, fontWeight: 600 },
  { id: 'hawbNoMid', topPct: 15.5, leftPct: 49.9, widthPct: 28, fontSizePx: 9, fontWeight: 700 },
  { id: 'agent', topPct: 24.2, leftPct: 4.5, widthPct: 36, fontSizePx: 8, fontWeight: 600 },
  { id: 'agentRight', topPct: 23.2, leftPct: 41.5, widthPct: 36, fontSizePx: 8, fontWeight: 600 },
  { id: 'departure', topPct: 29.6, leftPct: 4.1, widthPct: 30, fontSizePx: 8, fontWeight: 700 },
  { id: 'toCode', topPct: 31.8, leftPct: 3.5, widthPct: 6, fontSizePx: 8, fontWeight: 700 },
  { id: 'flight', topPct: 31.8, leftPct: 9.0, widthPct: 18, fontSizePx: 8, fontWeight: 700 },
  { id: 'currency', topPct: 31.8, leftPct: 36, widthPct: 8, fontSizePx: 8, fontWeight: 700 },
  { id: 'declaredCarriage', topPct: 31.8, leftPct: 52, widthPct: 12, fontSizePx: 8, fontWeight: 700 },
  { id: 'declaredCustoms', topPct: 31.8, leftPct: 65, widthPct: 14, fontSizePx: 8, fontWeight: 700 },
  { id: 'destination', topPct: 35.3, leftPct: 4.1, widthPct: 28, fontSizePx: 8, fontWeight: 700 },
  { id: 'flightDate', topPct: 35.3, leftPct: 26.5, widthPct: 22, fontSizePx: 8, fontWeight: 600 },
  { id: 'insurance', topPct: 35.3, leftPct: 42.3, widthPct: 12, fontSizePx: 8, fontWeight: 700 },
  { id: 'marks', topPct: 38.1, leftPct: 4.1, widthPct: 28, fontSizePx: 8 },
  { id: 'handling', topPct: 38.9, leftPct: 61.1, widthPct: 28, fontSizePx: 8, fontWeight: 700 },
  { id: 'packagesLine', topPct: 40.5, leftPct: 4.1, widthPct: 40, fontSizePx: 8 },
  { id: 'pieces', topPct: 47.6, leftPct: 5.4, widthPct: 6, fontSizePx: 9, fontWeight: 700 },
  { id: 'gross', topPct: 47.6, leftPct: 10.6, widthPct: 10, fontSizePx: 9, fontWeight: 700 },
  { id: 'chargeable', topPct: 47.6, leftPct: 25.4, widthPct: 10, fontSizePx: 9, fontWeight: 700 },
  { id: 'nature', topPct: 47.6, leftPct: 50.1, widthPct: 38, fontSizePx: 8, fontWeight: 600 },
  { id: 'carrierSign', topPct: 77.4, leftPct: 30.8, widthPct: 38, fontSizePx: 8, fontWeight: 700 },
  { id: 'executedOn', topPct: 83.0, leftPct: 32.3, widthPct: 12, fontSizePx: 8, fontWeight: 700 },
  { id: 'executedAt', topPct: 83.0, leftPct: 44.9, widthPct: 14, fontSizePx: 8, fontWeight: 700 },
  { id: 'hawbNoFooter', topPct: 89.2, leftPct: 58, widthPct: 38, fontSizePx: 11, fontWeight: 800, align: 'right' },
  { id: 'branding', topPct: 1.0, leftPct: 2, widthPct: 40, fontSizePx: 7, fontWeight: 700 },
];
