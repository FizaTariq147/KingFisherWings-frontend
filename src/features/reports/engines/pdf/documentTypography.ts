/**
 * Phase 1 — typography tokens for Freightnest report documents.
 * Client capture (html2canvas) rasterizes text; print CSS / Puppeteer keep selectable text.
 * Prefer system stacks that match freight docs (Arial/Helvetica) — never inject Fresa fonts.
 */

export type DocumentFontWeight = 400 | 500 | 600 | 700;

export type DocumentTypography = {
  /** CSS font-family stack (embedded only when the browser already has the face). */
  fontFamily: string;
  /** Fallback stack appended when callers pass a single family. */
  fallbackStack: string;
  sizesPx: {
    caption: number;
    label: number;
    body: number;
    subtitle: number;
    title: number;
    display: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    loose: number;
  };
  weights: {
    regular: DocumentFontWeight;
    medium: DocumentFontWeight;
    semibold: DocumentFontWeight;
    bold: DocumentFontWeight;
  };
  ink: string;
  muted: string;
  /** letter-spacing in em for labels */
  labelTrackingEm: number;
};

export const FREIGHTNEST_DOCUMENT_TYPOGRAPHY: DocumentTypography = {
  fontFamily: 'Arial, Helvetica, "Helvetica Neue", sans-serif',
  fallbackStack: 'Arial, Helvetica, sans-serif',
  sizesPx: {
    caption: 7,
    label: 8,
    body: 9,
    subtitle: 10,
    title: 11,
    display: 13,
  },
  lineHeights: {
    tight: 1.15,
    normal: 1.35,
    loose: 1.5,
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  ink: '#111111',
  muted: '#333333',
  labelTrackingEm: 0.02,
};

export type TypographyOverrides = Partial<{
  fontFamily: string;
  sizesPx: Partial<DocumentTypography['sizesPx']>;
  lineHeights: Partial<DocumentTypography['lineHeights']>;
  ink: string;
  muted: string;
}>;

export function resolveDocumentTypography(
  overrides: TypographyOverrides = {},
): DocumentTypography {
  return {
    ...FREIGHTNEST_DOCUMENT_TYPOGRAPHY,
    ...overrides,
    sizesPx: {
      ...FREIGHTNEST_DOCUMENT_TYPOGRAPHY.sizesPx,
      ...overrides.sizesPx,
    },
    lineHeights: {
      ...FREIGHTNEST_DOCUMENT_TYPOGRAPHY.lineHeights,
      ...overrides.lineHeights,
    },
  };
}

/** CSS custom properties + base text rules for print / capture hosts. */
export function documentTypographyToCss(
  typography: DocumentTypography = FREIGHTNEST_DOCUMENT_TYPOGRAPHY,
): string {
  const t = typography;
  return `
:root {
  --fn-font: ${t.fontFamily};
  --fn-ink: ${t.ink};
  --fn-muted: ${t.muted};
  --fn-fs-caption: ${t.sizesPx.caption}px;
  --fn-fs-label: ${t.sizesPx.label}px;
  --fn-fs-body: ${t.sizesPx.body}px;
  --fn-fs-subtitle: ${t.sizesPx.subtitle}px;
  --fn-fs-title: ${t.sizesPx.title}px;
  --fn-fs-display: ${t.sizesPx.display}px;
  --fn-lh-tight: ${t.lineHeights.tight};
  --fn-lh-normal: ${t.lineHeights.normal};
  --fn-lh-loose: ${t.lineHeights.loose};
  --fn-fw-regular: ${t.weights.regular};
  --fn-fw-medium: ${t.weights.medium};
  --fn-fw-semibold: ${t.weights.semibold};
  --fn-fw-bold: ${t.weights.bold};
  --fn-label-tracking: ${t.labelTrackingEm}em;
}
.fn-doc, .fn-doc * {
  font-family: var(--fn-font);
  color: var(--fn-ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}
.fn-doc {
  font-size: var(--fn-fs-body);
  font-weight: var(--fn-fw-regular);
  line-height: var(--fn-lh-normal);
}
.fn-doc .fn-label {
  font-size: var(--fn-fs-label);
  font-weight: var(--fn-fw-semibold);
  color: var(--fn-muted);
  letter-spacing: var(--fn-label-tracking);
  line-height: var(--fn-lh-tight);
}
.fn-doc .fn-title {
  font-size: var(--fn-fs-title);
  font-weight: var(--fn-fw-bold);
  line-height: var(--fn-lh-tight);
}
.fn-doc .fn-display {
  font-size: var(--fn-fs-display);
  font-weight: var(--fn-fw-bold);
  line-height: var(--fn-lh-tight);
}
.fn-doc .fn-caption {
  font-size: var(--fn-fs-caption);
  line-height: var(--fn-lh-tight);
}
.fn-doc .fn-align-left { text-align: left; }
.fn-doc .fn-align-center { text-align: center; }
.fn-doc .fn-align-right { text-align: right; }
.fn-doc .fn-wrap {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.fn-doc .fn-nowrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`.trim();
}
