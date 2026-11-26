import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { OfficialMeasuredFace } from '../../templates/official/officialFace.types';

export type LayoutIssue = {
  severity: 'fail' | 'warning' | 'review';
  code: string;
  message: string;
  page?: number;
  detail?: Record<string, unknown>;
};

export type LayoutQaResult = {
  pageCount: number;
  pages: Array<{ page: number; widthPt: number; heightPt: number; textItemCount: number }>;
  issues: LayoutIssue[];
  /**
   * Text extraction cannot prove all visual overlaps (vector under text, same-ink
   * collisions without extractable glyphs). When geometry is thin, mark review.
   */
  visualInspectionRequired: boolean;
  requiredTextMissing: string[];
  fresaIdentityHits: string[];
};

function itemBBox(item: {
  str?: string;
  transform: number[];
  width?: number;
  height?: number;
}): { x: number; y: number; w: number; h: number; str: string } | null {
  const str = String(item.str || '');
  if (!str.trim()) return null;
  const t = item.transform;
  const x = t[4];
  const y = t[5];
  const fontSize = Math.hypot(t[0], t[1]) || Math.abs(t[3]) || 8;
  const w = typeof item.width === 'number' && item.width > 0 ? item.width : str.length * fontSize * 0.5;
  const h = typeof item.height === 'number' && item.height > 0 ? item.height : fontSize;
  return { x, y, w, h, str };
}

function intersects(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const w = x2 - x1;
  const h = y2 - y1;
  if (w <= 0 || h <= 0) return 0;
  return w * h;
}

export async function analyzePdfLayout(
  bytes: Uint8Array,
  options: {
    expectedWidthPt?: number;
    expectedHeightPt?: number;
    widthTolerancePt?: number;
    requiredSubstrings?: string[];
    face?: OfficialMeasuredFace | null;
    fixtureId?: string;
  } = {},
): Promise<LayoutQaResult> {
  const issues: LayoutIssue[] = [];
  const doc = await getDocument({ data: bytes }).promise;
  const pageCount = doc.numPages;
  const pages: LayoutQaResult['pages'] = [];
  const tol = options.widthTolerancePt ?? 2;
  let visualInspectionRequired = false;
  const requiredTextMissing: string[] = [];
  const fresaIdentityHits: string[] = [];
  let allText = '';

  if (pageCount === 0) {
    issues.push({ severity: 'fail', code: 'blank_document', message: 'PDF has zero pages' });
  }

  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p);
    const view = page.view; // [x0,y0,x1,y1]
    const widthPt = view[2] - view[0];
    const heightPt = view[3] - view[1];
    const content = await page.getTextContent();
    const items = content.items
      .map((it) => ('str' in it ? itemBBox(it as { str: string; transform: number[]; width?: number; height?: number }) : null))
      .filter(Boolean) as Array<{ x: number; y: number; w: number; h: number; str: string }>;

    pages.push({ page: p, widthPt, heightPt, textItemCount: items.length });
    allText += items.map((i) => i.str).join(' ') + '\n';

    if (items.length === 0 && p === 1) {
      issues.push({
        severity: 'fail',
        code: 'empty_page_text',
        message: `Page ${p} has no extractable text (possible blank or pure raster)`,
        page: p,
      });
      visualInspectionRequired = true;
    }

    if (options.expectedWidthPt != null && Math.abs(widthPt - options.expectedWidthPt) > tol) {
      issues.push({
        severity: 'fail',
        code: 'page_width_mismatch',
        message: `Page ${p} width ${widthPt} ≠ expected ${options.expectedWidthPt}`,
        page: p,
      });
    }
    if (options.expectedHeightPt != null && Math.abs(heightPt - options.expectedHeightPt) > tol) {
      issues.push({
        severity: 'fail',
        code: 'page_height_mismatch',
        message: `Page ${p} height ${heightPt} ≠ expected ${options.expectedHeightPt}`,
        page: p,
      });
    }

    // Outside page bounds (with small margin for rounding)
    for (const it of items) {
      const pad = 1;
      if (it.x < -pad || it.y < -pad || it.x + it.w > widthPt + pad || it.y + it.h > heightPt + pad) {
        issues.push({
          severity: 'warning',
          code: 'text_outside_page',
          message: `Text may leave page: "${it.str.slice(0, 40)}"`,
          page: p,
          detail: { ...it, widthPt, heightPt },
        });
      }
    }

    // Collision heuristic: same-page extractable glyphs with significant IoU and different strings.
    // Cap reports — dense forms produce many near-collisions; full proof needs visual review.
    const collisionThreshold = 8; // pt²
    let collisionCount = 0;
    const collisionCap = 25;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        if (a.str === b.str) continue;
        if (a.str.trim().length < 2 || b.str.trim().length < 2) continue;
        const area = intersects(a, b);
        if (area >= collisionThreshold) {
          collisionCount += 1;
          if (collisionCount <= collisionCap) {
            issues.push({
              severity: 'warning',
              code: 'text_bbox_collision',
              message: `Possible overlap: "${a.str.slice(0, 24)}" vs "${b.str.slice(0, 24)}"`,
              page: p,
              detail: { area, a: a.str.slice(0, 40), b: b.str.slice(0, 40) },
            });
          }
        }
      }
    }
    if (collisionCount > collisionCap) {
      issues.push({
        severity: 'review',
        code: 'text_bbox_collision_capped',
        message: `${collisionCount} possible text bbox collisions on page ${p} (reported first ${collisionCap}) — visual review required`,
        page: p,
      });
      visualInspectionRequired = true;
    }

    // Region overflow when fieldSlots exist (HAWB/invoice measured)
    const face = options.face;
    if (face?.fieldSlots?.length && p === 1) {
      for (const slot of face.fieldSlots) {
        const nearby = items.filter(
          (it) => Math.abs(it.x - slot.x) < 4 && Math.abs(it.y - slot.y) < (slot.size || 8) * 1.2,
        );
        for (const it of nearby) {
          // Soft check: stamp wider than ~280pt party band is suspicious
          if (it.w > 280 && (slot.key === 'shipper' || slot.key === 'consignee' || slot.key === 'notify')) {
            issues.push({
              severity: 'warning',
              code: 'region_overflow_heuristic',
              message: `Party-like text width ${it.w.toFixed(1)}pt near slot ${slot.key}`,
              page: p,
              detail: { slot, text: it.str.slice(0, 60) },
            });
          }
        }
      }
    } else if (!face?.fieldSlots?.length) {
      visualInspectionRequired = true;
    }

    // Text extraction cannot see underlay ink / sample images → always note for dense forms
    if (items.length > 80) {
      visualInspectionRequired = true;
    }
  }

  // Unexpected blank trailing pages: page with no text after a text page
  for (let i = 1; i < pages.length; i++) {
    if (pages[i].textItemCount === 0 && pages[i - 1].textItemCount > 0) {
      // Draft-1 has 9 copy pages all with text; blank mid-doc is suspicious
      // T&C pages may still have text — if completely empty, warn
      issues.push({
        severity: 'warning',
        code: 'unexpected_blank_page',
        message: `Page ${pages[i].page} has no extractable text after a content page`,
        page: pages[i].page,
      });
      visualInspectionRequired = true;
    }
  }

  for (const req of options.requiredSubstrings || []) {
    if (!allText.includes(req)) requiredTextMissing.push(req);
  }
  for (const miss of requiredTextMissing) {
    issues.push({
      severity: 'fail',
      code: 'missing_required_text',
      message: `Missing required text: ${miss}`,
    });
  }

  const fresaRe = /FRESA\s*DEMO|FRESA\s*TECHNOLOG|fresatechnologies\.com|BABU SECTOR|AL NASER TRADING/i;
  const hits = allText.match(new RegExp(fresaRe, 'gi')) || [];
  for (const h of [...new Set(hits)]) {
    fresaIdentityHits.push(h);
    issues.push({
      severity: 'fail',
      code: 'fresa_identity_leak',
      message: `Fresa identity text found: ${h}`,
    });
  }

  // Barcode/image presence cannot be proven from text layer alone
  issues.push({
    severity: 'review',
    code: 'image_barcode_not_proven_by_text',
    message:
      'Missing images/barcodes cannot be confirmed via text extraction alone — classify REVIEW when slots expected',
  });
  visualInspectionRequired = true;

  await doc.destroy();
  return {
    pageCount,
    pages,
    issues,
    visualInspectionRequired,
    requiredTextMissing,
    fresaIdentityHits,
  };
}

export function classifyFromLayout(
  generationOk: boolean,
  layout: LayoutQaResult | null,
  visualDiff?: { status: string; diffPct?: number },
): 'PASS' | 'WARNING' | 'FAIL' | 'REVIEW_REQUIRED' | 'GENERATION_FAILED' {
  if (!generationOk || !layout) return 'GENERATION_FAILED';
  if (layout.issues.some((i) => i.severity === 'fail')) return 'FAIL';
  if (visualDiff?.status === 'fail') return 'FAIL';
  if (visualDiff?.status === 'review' || layout.visualInspectionRequired) {
    if (layout.issues.some((i) => i.severity === 'warning')) return 'WARNING';
    return 'REVIEW_REQUIRED';
  }
  if (layout.issues.some((i) => i.severity === 'warning')) return 'WARNING';
  return 'PASS';
}
