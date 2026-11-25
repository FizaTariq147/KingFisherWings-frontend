import type { CSSProperties } from 'react';

/**
 * Fresa HAWB face typography (Jasper / ArialUnicodeMS on pins).
 * Metric-compatible stack: Arial/Helvetica — never Fresa-embedded fonts.
 * Pins are pure black-on-white, thin 1px grid, mixed-case labels (not all-caps).
 */
const ink = '#000000';
const fontFamily = 'Arial, Helvetica, "Helvetica Neue", sans-serif';

export const hawbInk = ink;

/** Shared IATA grid cell — thin black border, no fill (Fresa Jasper). */
export const hawbCell: CSSProperties = {
  border: `1px solid ${ink}`,
  padding: '1px 3px',
  verticalAlign: 'top',
  color: ink,
  fontSize: 8,
  lineHeight: 1.15,
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
  fontFamily,
  background: '#ffffff',
};

/** Field caption — small mixed-case bold (Fresa: "Shipper's Name and Address"). */
export const hawbLabel: CSSProperties = {
  fontSize: 6.5,
  fontWeight: 700,
  color: ink,
  margin: 0,
  lineHeight: 1.1,
  fontFamily,
};

/** Party / value text. */
export const hawbBody: CSSProperties = {
  fontSize: 8,
  fontWeight: 400,
  margin: '1px 0 0',
  lineHeight: 1.15,
  color: ink,
  whiteSpace: 'pre-line',
  fontFamily,
};

/** Contract / certification microcopy. */
export const hawbLegal: CSSProperties = {
  fontSize: 5.25,
  fontWeight: 400,
  lineHeight: 1.12,
  color: ink,
  margin: '1px 0 0',
  textAlign: 'justify',
  fontFamily,
};

/** HOUSE AIR WAYBILL / Air Waybill display title. */
export const hawbTitle: CSSProperties = {
  margin: '2px 0 0',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: ink,
  lineHeight: 1.05,
  fontFamily,
};

/** Nested account-number chip inside shipper/consignee (Fresa draft). */
export const hawbAccountChip: CSSProperties = {
  borderLeft: `1px solid ${ink}`,
  borderBottom: `1px solid ${ink}`,
  padding: '1px 3px',
  boxSizing: 'border-box',
  background: '#ffffff',
  alignSelf: 'flex-start',
  width: '38%',
  minHeight: 28,
};

/** Cargo / charge column header — no gray fill. */
export const hawbColHead: CSSProperties = {
  ...({
    border: `1px solid ${ink}`,
    padding: '1px 2px',
    verticalAlign: 'top',
    color: ink,
    fontSize: 6,
    fontWeight: 700,
    lineHeight: 1.1,
    fontFamily,
    background: '#ffffff',
  } as CSSProperties),
};

/**
 * Fresa Draft-2 / Draft-1: inverted HAWB NO badge (white on black).
 * Used at top-right and bottom-right of the face.
 */
export const hawbNoBadge: CSSProperties = {
  background: '#000000',
  color: '#ffffff',
  border: `1px solid ${ink}`,
  padding: '3px 10px',
  minWidth: 170,
  textAlign: 'right',
  fontFamily,
  fontWeight: 700,
  fontSize: 10,
  lineHeight: 1.2,
  letterSpacing: '0.02em',
  boxSizing: 'border-box',
};

export function displayOrBlank(value: string, placeholder = ''): string {
  return value.trim() ? value : placeholder;
}
