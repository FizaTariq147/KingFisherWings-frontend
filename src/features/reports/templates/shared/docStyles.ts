import type { CSSProperties } from 'react';

/** Shared inline styles for template-v2 documents (html2canvas-safe; no oklab). */

export const docFont =
  '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';

export const colors = {
  ink: '#0f172a',
  muted: '#475569',
  line: '#cbd5e1',
  band: '#0f3d5e',
  bandAlt: '#1e4d3a',
  bandWarn: '#7c2d12',
  paper: '#ffffff',
  wash: '#f8fafc',
  accent: '#0e7490',
  danger: '#991b1b',
} as const;

export const pageA4Portrait: CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  background: colors.paper,
  color: colors.ink,
  fontFamily: docFont,
  fontSize: 11,
  lineHeight: 1.35,
  boxSizing: 'border-box',
  padding: '12mm',
};

export const pageA4Landscape: CSSProperties = {
  width: '297mm',
  minHeight: '210mm',
  background: colors.paper,
  color: colors.ink,
  fontFamily: docFont,
  fontSize: 10,
  lineHeight: 1.3,
  boxSizing: 'border-box',
  padding: '10mm',
};
