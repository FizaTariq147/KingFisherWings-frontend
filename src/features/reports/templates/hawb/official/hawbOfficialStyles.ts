import type { CSSProperties } from 'react';

/**
 * Fresa HAWB face typography.
 * Pins embed ArialUnicodeMS / Helvetica — we use metric-compatible Arial/Helvetica
 * (MASTER_PROMPT: never copy Fresa-embedded fonts).
 * Pure black ink, clipped cells (no spill/overlap), tight Jasper density.
 */
const ink = '#000000';
const fontFamily = 'Arial, Helvetica, "Helvetica Neue", sans-serif';

export const hawbInk = ink;
export const hawbFontFamily = fontFamily;

/** Shared IATA grid cell — thin black border, clip overflow (prevents text bleed). */
export const hawbCell: CSSProperties = {
  border: `1px solid ${ink}`,
  padding: '2px 3px',
  verticalAlign: 'top',
  color: ink,
  fontSize: 7.5,
  lineHeight: 1.12,
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
  overflow: 'hidden',
  fontFamily,
  background: '#ffffff',
};

/** Field caption — small mixed-case bold. */
export const hawbLabel: CSSProperties = {
  fontSize: 6,
  fontWeight: 700,
  color: ink,
  margin: 0,
  padding: 0,
  lineHeight: 1.1,
  fontFamily,
  overflow: 'hidden',
};

/** Party / value text. */
export const hawbBody: CSSProperties = {
  fontSize: 7.5,
  fontWeight: 400,
  margin: '1px 0 0',
  padding: 0,
  lineHeight: 1.12,
  color: ink,
  whiteSpace: 'pre-line',
  fontFamily,
  overflow: 'hidden',
};

/** Contract / certification microcopy — clipped so it never spills cells. */
export const hawbLegal: CSSProperties = {
  fontSize: 5,
  fontWeight: 400,
  lineHeight: 1.1,
  color: ink,
  margin: 0,
  padding: 0,
  textAlign: 'justify',
  fontFamily,
  overflow: 'hidden',
};

/** HOUSE AIR WAYBILL / Air Waybill display title. */
export const hawbTitle: CSSProperties = {
  margin: '1px 0 0',
  padding: 0,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: ink,
  lineHeight: 1.05,
  fontFamily,
  overflow: 'hidden',
};

/** Nested account-number chip — top-right of shipper/consignee only. */
export const hawbAccountChip: CSSProperties = {
  borderLeft: `1px solid ${ink}`,
  borderBottom: `1px solid ${ink}`,
  padding: '1px 3px',
  boxSizing: 'border-box',
  background: '#ffffff',
  alignSelf: 'flex-start',
  width: '30%',
  minHeight: 24,
  maxHeight: 36,
  flexShrink: 0,
  overflow: 'hidden',
};

/** Cargo / charge column header. */
export const hawbColHead: CSSProperties = {
  border: `1px solid ${ink}`,
  padding: '1px 2px',
  verticalAlign: 'top',
  color: ink,
  fontSize: 5.5,
  fontWeight: 700,
  lineHeight: 1.05,
  fontFamily,
  background: '#ffffff',
  overflow: 'hidden',
};

/** Fresa Draft-2 / Draft-1: inverted HAWB NO badge (white on black). */
export const hawbNoBadge: CSSProperties = {
  background: '#000000',
  color: '#ffffff',
  border: `1px solid ${ink}`,
  padding: '2px 8px',
  minWidth: 160,
  textAlign: 'right',
  fontFamily,
  fontWeight: 700,
  fontSize: 9,
  lineHeight: 1.2,
  letterSpacing: '0.02em',
  boxSizing: 'border-box',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
};

/** Clip a block to a fixed band height so neighbours never overlap. */
export function hawbClipBand(heightPx: number): CSSProperties {
  return {
    height: heightPx,
    maxHeight: heightPx,
    minHeight: heightPx,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };
}

export function displayOrBlank(value: string, placeholder = ''): string {
  return value.trim() ? value : placeholder;
}

/** Cap party lines so long addresses cannot blow cell height. */
export function hawbCapLines(lines: string[], max = 4): string[] {
  return lines.filter(Boolean).slice(0, max);
}

/** Fresa To/By first Carrier prints the flight designator (e.g. EK9876), not the airline name. */
export function hawbFirstFlightCode(flightDate: string, carrierFallback = ''): string {
  const m = String(flightDate || '').match(/[A-Z]{2}\d{2,4}/i);
  return m?.[0] ? m[0].toUpperCase() : carrierFallback.trim();
}

export function hawbIsPrepaid(handling: string, accounting: string): boolean {
  return /prepaid/i.test(`${handling} ${accounting}`);
}

/**
 * Nature column lines from Fresa pins: commodity + optional "CTN - …" marks.
 * TOTAL PACKAGES stays in Handling — never duplicated here.
 */
export function hawbNatureLines(nature: string, handling: string, max = 4): string[] {
  const lines = String(nature || '')
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const ctn = String(handling || '').match(/CTN\s*-?\s*([\d\-–]+)/i);
  if (ctn && !lines.some((l) => /CTN/i.test(l))) {
    lines.push(`CTN - ${ctn[1]}`);
  }
  return lines.slice(0, max);
}
