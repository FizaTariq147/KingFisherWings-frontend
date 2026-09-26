import { useEffect, useId, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import {
  SCANNABLE_BARCODE_OPTS,
  SCREEN_BARCODE_OPTS,
  normalizeCode128Value,
} from '../utils/scannableBarcode';

/** @deprecated Use SCANNABLE_BARCODE_OPTS — kept for existing imports. */
export const LABEL_BARCODE_OPTS = SCREEN_BARCODE_OPTS;

export type Code128BarcodeProps = {
  value: string;
  /** Display height of bars (px). */
  height?: number;
  /** Module width (px). */
  width?: number;
  className?: string;
  /** Called when render fails (invalid characters, empty, etc.). */
  onError?: (message: string) => void;
};

type JsBarcodeRenderOpts = {
  height?: number;
  width?: number;
  /** When false, bars only (text drawn separately on sticker PDF). */
  displayValue?: boolean;
  margin?: number;
};

function encodeCode128Svg(
  svg: SVGElement,
  rawValue: string,
  opts: JsBarcodeRenderOpts = {},
): string {
  const value = normalizeCode128Value(rawValue);
  if (!value) throw new Error('Barcode value is empty or not CODE128-safe.');

  JsBarcode(svg, value, {
    format: 'CODE128',
    displayValue: opts.displayValue !== false,
    fontSize: SCANNABLE_BARCODE_OPTS.fontSize,
    height: opts.height ?? SCREEN_BARCODE_OPTS.height,
    width: opts.width ?? SCREEN_BARCODE_OPTS.width,
    margin: opts.margin ?? SCREEN_BARCODE_OPTS.margin,
    background: SCANNABLE_BARCODE_OPTS.background,
    lineColor: SCANNABLE_BARCODE_OPTS.lineColor,
    textMargin: SCANNABLE_BARCODE_OPTS.textMargin,
    // Valid text improves some scanners when displayValue is on
    text: value,
  });
  return value;
}

/**
 * Renders a scannable CODE128 barcode as SVG via JsBarcode.
 */
export function Code128Barcode({
  value,
  height = SCREEN_BARCODE_OPTS.height,
  width = SCREEN_BARCODE_OPTS.width,
  className,
  onError,
}: Code128BarcodeProps) {
  const reactId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [failed, setFailed] = useState(false);
  const normalized = normalizeCode128Value(value);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (!normalized) {
      setFailed(true);
      onError?.('Barcode value is empty or not scannable.');
      svg.replaceChildren();
      return;
    }

    try {
      encodeCode128Svg(svg, normalized, { height, width, displayValue: true });
      setFailed(false);
    } catch (e) {
      setFailed(true);
      svg.replaceChildren();
      onError?.(e instanceof Error ? e.message : 'Could not render barcode.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- render only when barcode geometry/value changes
  }, [normalized, height, width]);

  if (!normalized) {
    return (
      <p className="text-sm text-[var(--color-neutral-400)]">No scannable barcode value.</p>
    );
  }

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        id={`code128-${reactId.replace(/:/g, '')}`}
        role="img"
        aria-label={`CODE128 barcode ${normalized}`}
        className="max-w-full"
      />
      {failed ? (
        <p className="mt-1 text-xs text-[var(--color-danger-600)]">
          Could not generate a scannable CODE128 for this value.
        </p>
      ) : null}
    </div>
  );
}

/** Download the rendered SVG as a PNG file. */
export async function downloadCode128Png(
  svg: SVGSVGElement,
  fileName: string,
): Promise<void> {
  const png = await code128SvgToPngDataUrl(svg, 3);
  const a = document.createElement('a');
  a.href = png;
  a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  a.click();
}

/**
 * Convert CODE128 SVG → PNG.
 * Higher scale = sharper bars in PDF / print (scanners need crisp edges).
 */
export async function code128SvgToPngDataUrl(
  svg: SVGSVGElement,
  scale = 3,
): Promise<string> {
  const xml = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load barcode image.'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(Math.round(img.width * scale), 1);
    canvas.height = Math.max(Math.round(img.height * scale), 1);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available.');
    // Crisp bars — avoid smoothing that blurs modules
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** PNG bytes suitable for pdf-lib embedPng. */
export async function code128SvgToPngBytes(
  svg: SVGSVGElement,
  scale = 3,
): Promise<Uint8Array> {
  const dataUrl = await code128SvgToPngDataUrl(svg, scale);
  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('Could not encode barcode PNG.');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Render a print-grade CODE128 (bars only) for sticker PDF embed.
 * High module width + quiet zone + pure black → reliable gate scans.
 */
export async function renderCode128PngBytes(
  value: string,
  opts?: { height?: number; width?: number; displayValue?: boolean },
): Promise<Uint8Array> {
  const normalized = normalizeCode128Value(value);
  if (!normalized) throw new Error('Barcode value is empty or not scannable.');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  encodeCode128Svg(svg, normalized, {
    height: opts?.height ?? SCANNABLE_BARCODE_OPTS.height,
    width: opts?.width ?? SCANNABLE_BARCODE_OPTS.width,
    margin: SCANNABLE_BARCODE_OPTS.margin,
    displayValue: opts?.displayValue === true,
  });
  // 4× for PDF — bars stay sharp when scaled to sticker width
  return code128SvgToPngBytes(svg, 4);
}

/** Open a print window sized for a 100×50mm sticker (print & paste on goods). */
export function printCode128Label(opts: {
  value: string;
  title?: string;
  subtitle?: string;
  svg?: SVGSVGElement | null;
  /** Extra lines under barcode (shipper, pcs, etc.). */
  lines?: string[];
}): void {
  const value = normalizeCode128Value(opts.value);
  if (!value) return;

  const { title, subtitle, lines = [] } = opts;
  const w = window.open('', '_blank', 'noopener,noreferrer,width=420,height=280');
  if (!w) return;

  // Always re-render print-grade barcode (don't reuse soft on-screen SVG).
  const extra = lines
    .filter((l) => l.trim())
    .map((l) => `<div class="line">${escapeHtml(l)}</div>`)
    .join('');

  const h = SCANNABLE_BARCODE_OPTS.height;
  const mw = SCANNABLE_BARCODE_OPTS.width;
  const margin = SCANNABLE_BARCODE_OPTS.margin;

  w.document.write(`<!doctype html><html><head><title>${escapeHtml(title || value)}</title>
<style>
  @page { size: 100mm 50mm; margin: 2mm; }
  * { box-sizing: border-box; }
  html, body {
    width: 100mm;
    height: 50mm;
    margin: 0;
    padding: 0;
    font-family: system-ui, sans-serif;
    color: #000;
    background: #fff;
  }
  .sticker {
    width: 96mm;
    height: 46mm;
    margin: 0 auto;
    padding: 2mm 3mm;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1mm;
  }
  h1 { font-size: 11pt; margin: 0; font-weight: 700; }
  .sub { font-size: 7pt; margin: 0; color: #333; }
  .code { font-size: 8pt; margin: 0; font-family: ui-monospace, monospace; letter-spacing: 0.04em; }
  .line { font-size: 7.5pt; margin: 0; line-height: 1.2; }
  #bc { max-width: 90mm; height: auto; margin: 0 auto; display: block; }
  @media print {
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style></head><body>
<div class="sticker">
${title ? `<h1>${escapeHtml(title)}</h1>` : ''}
${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
<svg id="bc"></svg>
<p class="code">${escapeHtml(value)}</p>
${extra}
</div>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<script>
  JsBarcode("#bc", ${JSON.stringify(value)}, {
    format: "CODE128",
    displayValue: false,
    height: ${h},
    width: ${mw},
    margin: ${margin},
    background: "#ffffff",
    lineColor: "#000000",
    textMargin: 0
  });
  setTimeout(function(){ window.focus(); window.print(); }, 280);
<\/script>
</body></html>`);
  w.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
