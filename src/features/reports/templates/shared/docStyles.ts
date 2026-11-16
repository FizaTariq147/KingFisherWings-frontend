import type { CSSProperties } from 'react';
import {
  PAGE_A4_LANDSCAPE,
  PAGE_A4_PORTRAIT,
  resolvePageGeometry,
  type PageGeometry,
} from '../../engines/pdf/pageGeometry';
import { FREIGHTNEST_DOCUMENT_TYPOGRAPHY } from '../../engines/pdf/documentTypography';

/** Shared inline styles for template-v2 documents (html2canvas-safe; no oklab). */

export const docFont = FREIGHTNEST_DOCUMENT_TYPOGRAPHY.fontFamily.includes('Segoe')
  ? FREIGHTNEST_DOCUMENT_TYPOGRAPHY.fontFamily
  : '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';

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

function pageBoxStyle(
  geometry: PageGeometry,
  extras: Partial<CSSProperties> = {},
): CSSProperties {
  return {
    width: `${geometry.widthMm}mm`,
    minHeight: `${geometry.heightMm}mm`,
    background: colors.paper,
    color: colors.ink,
    fontFamily: docFont,
    fontSize: extras.fontSize ?? 11,
    lineHeight: extras.lineHeight ?? FREIGHTNEST_DOCUMENT_TYPOGRAPHY.lineHeights.normal,
    boxSizing: 'border-box',
    padding: `${geometry.marginsMm.top}mm ${geometry.marginsMm.right}mm ${geometry.marginsMm.bottom}mm ${geometry.marginsMm.left}mm`,
    ...extras,
  };
}

export const pageA4Portrait: CSSProperties = pageBoxStyle(PAGE_A4_PORTRAIT, {
  fontSize: 11,
  lineHeight: 1.35,
});

export const pageA4Landscape: CSSProperties = pageBoxStyle(
  resolvePageGeometry({
    paper: 'A4',
    orientation: 'landscape',
    marginsMm: { top: 10, right: 10, bottom: 10, left: 10 },
  }),
  {
    fontSize: 10,
    lineHeight: 1.3,
  },
);

/** Re-export geometry presets used by template-v2 pages. */
export { PAGE_A4_PORTRAIT, PAGE_A4_LANDSCAPE };
