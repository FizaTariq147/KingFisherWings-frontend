/**
 * Field slots for HAWB Original-1 — percentages from Fresa pin
 * reports/specs/HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1.json (MediaBox 737×923).
 * topPct = (923 - baselineY) / 923 * 100; leftPct = x / 737 * 100.
 * No Fresa branding strings in values — only geometry.
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
  // Top AWB nos (pin: mawb left 103/895.3; hawb right 458/895.8) — size 14
  { id: 'mawbTop', topPct: 3.0, leftPct: 13.98, widthPct: 24.42, fontSizePx: 14, fontWeight: 700 },
  { id: 'hawbNoTop', topPct: 2.95, leftPct: 62.14, widthPct: 33.92, fontSizePx: 14, fontWeight: 700 },
  // Shipper / consignee (10pt)
  { id: 'shipper', topPct: 5.45, leftPct: 4.48, widthPct: 43.42, fontSizePx: 10, fontWeight: 400 },
  { id: 'consignee', topPct: 14.44, leftPct: 4.48, widthPct: 43.42, fontSizePx: 10, fontWeight: 400 },
  { id: 'hawbNoMid', topPct: 15.46, leftPct: 49.93, widthPct: 29.85, fontSizePx: 10, fontWeight: 700 },
  // Issuing carrier agent
  { id: 'agent', topPct: 24.19, leftPct: 4.48, widthPct: 35.28, fontSizePx: 10, fontWeight: 400 },
  { id: 'agentRight', topPct: 23.15, leftPct: 41.52, widthPct: 37.99, fontSizePx: 8, fontWeight: 400 },
  // Routing / declared
  { id: 'departure', topPct: 29.63, leftPct: 4.07, widthPct: 29.85, fontSizePx: 9, fontWeight: 700 },
  { id: 'toCode', topPct: 32.31, leftPct: 3.93, widthPct: 5.43, fontSizePx: 10, fontWeight: 700 },
  { id: 'flight', topPct: 32.31, leftPct: 9.36, widthPct: 13.57, fontSizePx: 10, fontWeight: 700 },
  { id: 'currency', topPct: 32.31, leftPct: 38.67, widthPct: 5.43, fontSizePx: 10, fontWeight: 700 },
  { id: 'chgsPp1', topPct: 32.36, leftPct: 42.99, widthPct: 3.39, fontSizePx: 10, fontWeight: 700 },
  { id: 'chgsPp2', topPct: 32.36, leftPct: 46.92, widthPct: 3.39, fontSizePx: 10, fontWeight: 700 },
  { id: 'declaredCarriage', topPct: 32.31, leftPct: 55.81, widthPct: 9.5, fontSizePx: 10, fontWeight: 700 },
  { id: 'declaredCustoms', topPct: 32.31, leftPct: 67.71, widthPct: 13.57, fontSizePx: 10, fontWeight: 700 },
  { id: 'destination', topPct: 35.34, leftPct: 4.07, widthPct: 21.71, fontSizePx: 10, fontWeight: 700 },
  { id: 'flightDate', topPct: 35.34, leftPct: 26.46, widthPct: 19.0, fontSizePx: 10, fontWeight: 400 },
  { id: 'insurance', topPct: 35.34, leftPct: 42.33, widthPct: 10.85, fontSizePx: 10, fontWeight: 700 },
  // Marks / accounting / packages
  { id: 'marks', topPct: 38.06, leftPct: 4.07, widthPct: 27.14, fontSizePx: 10 },
  { id: 'handling', topPct: 38.86, leftPct: 61.06, widthPct: 27.14, fontSizePx: 10, fontWeight: 700 },
  { id: 'packagesLine', topPct: 40.52, leftPct: 4.07, widthPct: 37.99, fontSizePx: 10 },
  // Weight line
  { id: 'pieces', topPct: 47.59, leftPct: 5.39, widthPct: 5.43, fontSizePx: 10, fontWeight: 700 },
  { id: 'gross', topPct: 47.59, leftPct: 10.58, widthPct: 9.5, fontSizePx: 10, fontWeight: 700 },
  { id: 'kg', topPct: 47.59, leftPct: 20.49, widthPct: 2.71, fontSizePx: 10, fontWeight: 700 },
  { id: 'chargeable', topPct: 47.59, leftPct: 25.39, widthPct: 9.5, fontSizePx: 10, fontWeight: 700 },
  { id: 'nature', topPct: 47.59, leftPct: 50.07, widthPct: 37.99, fontSizePx: 10, fontWeight: 400 },
  { id: 'rateTotal', topPct: 48.82, leftPct: 45.52, widthPct: 6.78, fontSizePx: 10, fontWeight: 700 },
  { id: 'ctnBelow', topPct: 51.73, leftPct: 4.48, widthPct: 16.28, fontSizePx: 9 },
  // Charges / signature
  // Prepaid zeros (live pdfjs on pin: x≈72.8, not the older 47.8 extract)
  { id: 'prepaid1', topPct: 67.71, leftPct: 9.88, widthPct: 6.78, fontSizePx: 10, fontWeight: 700 },
  { id: 'carrierSignName', topPct: 77.43, leftPct: 45.59, widthPct: 33.92, fontSizePx: 10, fontWeight: 700 },
  { id: 'carrierSign', topPct: 80.2, leftPct: 30.8, widthPct: 37.99, fontSizePx: 8, fontWeight: 700 },
  { id: 'prepaid2', topPct: 81.15, leftPct: 9.88, widthPct: 6.78, fontSizePx: 10, fontWeight: 700 },
  { id: 'executedOn', topPct: 83.02, leftPct: 32.29, widthPct: 10.85, fontSizePx: 10, fontWeight: 700 },
  { id: 'executedAt', topPct: 83.02, leftPct: 44.91, widthPct: 13.57, fontSizePx: 10, fontWeight: 700 },
  { id: 'hawbNoFooter', topPct: 89.19, leftPct: 62.14, widthPct: 33.92, fontSizePx: 14, fontWeight: 700 },
];
