/**
 * html2canvas 1.x cannot parse modern CSS color functions (oklab/oklch/lab/lch)
 * that Tailwind v4 and Chromium emit via getComputedStyle.
 * Convert them to rgb/hex on the cloned tree before capture.
 */

const COLOR_PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'column-rule-color',
  'caret-color',
  '-webkit-text-fill-color',
  '-webkit-text-stroke-color',
] as const;

const COMPLEX_PROPS = ['box-shadow', 'text-shadow', 'background-image', 'border-image-source'] as const;

const MODERN_COLOR_RE = /(?:oklab|oklch|lab|lch|color)\([^)]*\)/gi;
const NEEDS_SANITIZE_RE = /oklab|oklch|lab\(|lch\(|color\(/i;

let canvasCtx: CanvasRenderingContext2D | null = null;

function getCtx(): CanvasRenderingContext2D | null {
  if (canvasCtx) return canvasCtx;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  canvasCtx = canvas.getContext('2d', { willReadFrequently: true });
  return canvasCtx;
}

/** Convert a single CSS color (possibly oklab) to something html2canvas accepts. */
export function normalizeCssColor(value: string): string {
  const raw = String(value || '').trim();
  if (!raw || raw === 'transparent' || raw === 'none' || raw === 'currentcolor') return raw;
  if (!NEEDS_SANITIZE_RE.test(raw)) return raw;

  const ctx = getCtx();
  if (!ctx) return '#000000';
  try {
    ctx.fillStyle = '#000000';
    ctx.fillStyle = raw;
    const normalized = String(ctx.fillStyle || '').trim();
    if (normalized && !NEEDS_SANITIZE_RE.test(normalized)) return normalized;
  } catch {
    /* fall through */
  }
  return '#000000';
}

function sanitizeColorBearingValue(value: string): string {
  if (!NEEDS_SANITIZE_RE.test(value)) return value;
  return value.replace(MODERN_COLOR_RE, (match) => normalizeCssColor(match));
}

function sanitizeElementColors(el: HTMLElement): void {
  const cs = getComputedStyle(el);
  for (const prop of COLOR_PROPS) {
    const val = cs.getPropertyValue(prop);
    if (!val || !NEEDS_SANITIZE_RE.test(val)) continue;
    el.style.setProperty(prop, normalizeCssColor(val), 'important');
  }
  for (const prop of COMPLEX_PROPS) {
    const val = cs.getPropertyValue(prop);
    if (!val || !NEEDS_SANITIZE_RE.test(val)) continue;
    el.style.setProperty(prop, sanitizeColorBearingValue(val), 'important');
  }
  // Border shorthand colors sometimes only appear via individual sides — handled above.
  const borderColor = cs.borderColor;
  if (borderColor && NEEDS_SANITIZE_RE.test(borderColor)) {
    el.style.setProperty('border-color', sanitizeColorBearingValue(borderColor), 'important');
  }
}

/**
 * html2canvas `onclone` hook: walk the cloned capture root and rewrite modern colors.
 */
export function sanitizeHtml2CanvasClone(_clonedDoc: Document, clonedElement: HTMLElement): void {
  const walk = (node: Element) => {
    if (node instanceof HTMLElement) sanitizeElementColors(node);
    if (node instanceof SVGElement) {
      const fill = node.getAttribute('fill');
      if (fill && NEEDS_SANITIZE_RE.test(fill)) {
        node.setAttribute('fill', normalizeCssColor(fill));
      }
      const stroke = node.getAttribute('stroke');
      if (stroke && NEEDS_SANITIZE_RE.test(stroke)) {
        node.setAttribute('stroke', normalizeCssColor(stroke));
      }
    }
    for (let i = 0; i < node.children.length; i += 1) {
      walk(node.children[i]!);
    }
  };
  walk(clonedElement);
}
