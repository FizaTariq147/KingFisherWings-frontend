/**
 * Phase 1 — reusable page geometry for Freightnest catalogue / print PDFs.
 * Units: millimetres (layout/CSS) and PDF points (1 pt = 1/72 in).
 * Product packs remain backend Puppeteer; this powers client capture + print CSS.
 */

export type PagePaperPreset = 'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom';
export type PageOrientation = 'portrait' | 'landscape';

/** Margins in millimetres (CSS / @page). */
export type PageMarginsMm = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type PageGeometry = {
  paper: PagePaperPreset;
  orientation: PageOrientation;
  /** Full page width in mm (after orientation). */
  widthMm: number;
  /** Full page height in mm (after orientation). */
  heightMm: number;
  marginsMm: PageMarginsMm;
  /** Content box inside margins. */
  contentWidthMm: number;
  contentHeightMm: number;
  /** PDF points (jsPDF / MediaBox). */
  widthPt: number;
  heightPt: number;
  marginsPt: { top: number; right: number; bottom: number; left: number };
  /** CSS px at 96dpi (approx) for off-screen capture hosts. */
  widthCssPx: number;
  heightCssPx: number;
};

/** ISO / North-American base sizes in mm (portrait). */
export const PAPER_SIZE_MM: Record<Exclude<PagePaperPreset, 'Custom'>, { w: number; h: number }> =
  {
    A4: { w: 210, h: 297 },
    A5: { w: 148, h: 210 },
    Letter: { w: 215.9, h: 279.4 },
    Legal: { w: 215.9, h: 355.6 },
  };

const MM_TO_PT = 72 / 25.4;
const MM_TO_CSS_PX = 96 / 25.4;

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

export function ptToMm(pt: number): number {
  return pt / MM_TO_PT;
}

export function mmToCssPx(mm: number): number {
  return Math.round(mm * MM_TO_CSS_PX);
}

export function defaultMarginsMm(paper: PagePaperPreset = 'A4'): PageMarginsMm {
  if (paper === 'A5') return { top: 10, right: 10, bottom: 10, left: 10 };
  return { top: 12, right: 12, bottom: 12, left: 12 };
}

export type ResolvePageGeometryInput = {
  paper?: PagePaperPreset;
  orientation?: PageOrientation;
  /** Custom full-page size in mm (required when paper === 'Custom'). */
  widthMm?: number;
  heightMm?: number;
  /** Custom size in PDF points (converted when mm omitted). */
  widthPt?: number;
  heightPt?: number;
  marginsMm?: Partial<PageMarginsMm>;
};

/**
 * Resolve a full PageGeometry from preset or custom dimensions.
 * Orientation swaps width/height for non-Custom presets.
 */
export function resolvePageGeometry(input: ResolvePageGeometryInput = {}): PageGeometry {
  const paper = input.paper ?? 'A4';
  const orientation = input.orientation ?? 'portrait';
  const marginsMm: PageMarginsMm = {
    ...defaultMarginsMm(paper === 'Custom' ? 'A4' : paper),
    ...input.marginsMm,
  };

  let widthMm: number;
  let heightMm: number;

  if (paper === 'Custom') {
    if (input.widthMm != null && input.heightMm != null) {
      widthMm = input.widthMm;
      heightMm = input.heightMm;
    } else if (input.widthPt != null && input.heightPt != null) {
      widthMm = ptToMm(input.widthPt);
      heightMm = ptToMm(input.heightPt);
    } else {
      throw new Error('Custom page geometry requires widthMm/heightMm or widthPt/heightPt');
    }
  } else {
    const base = PAPER_SIZE_MM[paper];
    if (orientation === 'landscape') {
      widthMm = base.h;
      heightMm = base.w;
    } else {
      widthMm = base.w;
      heightMm = base.h;
    }
  }

  // Round to whole PDF points so MediaBox matches freight refs (A4 → 595×842).
  const widthPt = Math.round(mmToPt(widthMm));
  const heightPt = Math.round(mmToPt(heightMm));

  return {
    paper,
    orientation,
    widthMm,
    heightMm,
    marginsMm,
    contentWidthMm: Math.max(0, widthMm - marginsMm.left - marginsMm.right),
    contentHeightMm: Math.max(0, heightMm - marginsMm.top - marginsMm.bottom),
    widthPt,
    heightPt,
    marginsPt: {
      top: Math.round(mmToPt(marginsMm.top)),
      right: Math.round(mmToPt(marginsMm.right)),
      bottom: Math.round(mmToPt(marginsMm.bottom)),
      left: Math.round(mmToPt(marginsMm.left)),
    },
    widthCssPx: mmToCssPx(widthMm),
    heightCssPx: mmToCssPx(heightMm),
  };
}

/** Convenience presets. */
export const PAGE_A4_PORTRAIT = resolvePageGeometry({ paper: 'A4', orientation: 'portrait' });
export const PAGE_A4_LANDSCAPE = resolvePageGeometry({ paper: 'A4', orientation: 'landscape' });
export const PAGE_A5_PORTRAIT = resolvePageGeometry({ paper: 'A5', orientation: 'portrait' });
export const PAGE_LETTER_PORTRAIT = resolvePageGeometry({
  paper: 'Letter',
  orientation: 'portrait',
});
export const PAGE_LEGAL_PORTRAIT = resolvePageGeometry({ paper: 'Legal', orientation: 'portrait' });

/**
 * HAWB Draft / Draft-2 / Original-2 reference MediaBox ≈ 595×845 pt
 * (near-A4; taller than ISO A4 842 pt).
 */
export const PAGE_HAWB_NEAR_A4 = resolvePageGeometry({
  paper: 'Custom',
  orientation: 'portrait',
  widthPt: 595,
  heightPt: 845,
  // Tighter margins match Fresa Draft/Draft-2 content fill (~4mm vs prior 6mm).
  marginsMm: { top: 4, right: 4, bottom: 4, left: 4 },
});

/** HAWB Draft-1 reference MediaBox = ISO A4 595×842 pt (multi-page copy set). */
export const PAGE_HAWB_DRAFT1_A4 = resolvePageGeometry({
  paper: 'A4',
  orientation: 'portrait',
  marginsMm: { top: 5, right: 5, bottom: 5, left: 5 },
});

/**
 * HAWB Original Pre-Printed Format-1 reference MediaBox ≈ 737×923 pt.
 */
export const PAGE_HAWB_ORIGINAL1_CUSTOM = resolvePageGeometry({
  paper: 'Custom',
  orientation: 'portrait',
  widthPt: 737,
  heightPt: 923,
  marginsMm: { top: 8, right: 8, bottom: 8, left: 8 },
});

/** Map legacy invoice layout paper + orientation fields. */
export function pageGeometryFromInvoicePaper(
  paper: 'A4' | 'Letter' | string | undefined,
  orientation: PageOrientation | undefined,
): PageGeometry {
  const preset: PagePaperPreset =
    paper === 'Letter' ? 'Letter' : paper === 'Legal' ? 'Legal' : paper === 'A5' ? 'A5' : 'A4';
  return resolvePageGeometry({
    paper: preset,
    orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
  });
}

/** CSS `@page` rule for print pipeline. */
export function pageGeometryToAtPageCss(geometry: PageGeometry): string {
  const { widthMm, heightMm, marginsMm, paper, orientation } = geometry;
  if (paper !== 'Custom') {
    return `@page { size: ${paper} ${orientation}; margin: ${marginsMm.top}mm ${marginsMm.right}mm ${marginsMm.bottom}mm ${marginsMm.left}mm; }`;
  }
  return `@page { size: ${widthMm}mm ${heightMm}mm; margin: ${marginsMm.top}mm ${marginsMm.right}mm ${marginsMm.bottom}mm ${marginsMm.left}mm; }`;
}

/** Inline React/CSS host styles when the host owns page margins. */
export function pageGeometryToHostCss(geometry: PageGeometry): Record<string, string> {
  return {
    width: `${geometry.widthMm}mm`,
    minHeight: `${geometry.heightMm}mm`,
    boxSizing: 'border-box',
    padding: `${geometry.marginsMm.top}mm ${geometry.marginsMm.right}mm ${geometry.marginsMm.bottom}mm ${geometry.marginsMm.left}mm`,
    background: '#ffffff',
  };
}

/**
 * Capture host styles: full page box only.
 * Template-v2 documents already apply their own padding (see docStyles).
 */
export function pageGeometryToCaptureHostCss(geometry: PageGeometry): Record<string, string> {
  return {
    width: `${geometry.widthMm}mm`,
    minHeight: `${geometry.heightMm}mm`,
    boxSizing: 'border-box',
    background: '#ffffff',
  };
}

/** jsPDF constructor args derived from geometry. */
export function pageGeometryToJsPdfOptions(geometry: PageGeometry): {
  orientation: PageOrientation;
  unit: 'mm';
  format: [number, number];
} {
  return {
    orientation: geometry.orientation,
    unit: 'mm',
    format: [geometry.widthMm, geometry.heightMm],
  };
}
