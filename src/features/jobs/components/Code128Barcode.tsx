import { useEffect, useId, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

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

/**
 * Renders a CODE128 barcode as SVG via JsBarcode.
 * Suitable for on-screen labels, print, and PNG export from the SVG.
 */
export function Code128Barcode({
  value,
  height = 64,
  width = 2,
  className,
  onError,
}: Code128BarcodeProps) {
  const reactId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [failed, setFailed] = useState(false);
  const trimmed = value.trim();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (!trimmed) {
      setFailed(true);
      onError?.('Barcode value is empty.');
      svg.replaceChildren();
      return;
    }

    try {
      JsBarcode(svg, trimmed, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 14,
        height,
        width,
        margin: 8,
        background: '#ffffff',
        lineColor: '#0a2942',
        textMargin: 4,
      });
      setFailed(false);
    } catch (e) {
      setFailed(true);
      svg.replaceChildren();
      onError?.(e instanceof Error ? e.message : 'Could not render barcode.');
    }
    // onError is intentionally omitted — callers should keep it stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- render only when barcode geometry/value changes
  }, [trimmed, height, width]);

  if (!trimmed) {
    return (
      <p className="text-sm text-[var(--color-neutral-400)]">No barcode value to render.</p>
    );
  }

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        id={`code128-${reactId.replace(/:/g, '')}`}
        role="img"
        aria-label={`CODE128 barcode ${trimmed}`}
        className="max-w-full"
      />
      {failed ? (
        <p className="mt-1 text-xs text-[var(--color-danger-600)]">
          Could not generate CODE128 for this value.
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
    const scale = 2;
    canvas.width = Math.max(img.width * scale, 1);
    canvas.height = Math.max(img.height * scale, 1);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const png = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = png;
    a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Open a print window with an existing barcode SVG (or re-render from value). */
export function printCode128Label(opts: {
  value: string;
  title?: string;
  subtitle?: string;
  svg?: SVGSVGElement | null;
}): void {
  const { value, title, subtitle, svg } = opts;
  const w = window.open('', '_blank', 'noopener,noreferrer,width=480,height=360');
  if (!w) return;

  const svgMarkup = svg
    ? new XMLSerializer().serializeToString(svg)
    : '<svg id="bc"></svg>';
  const needsScript = !svg;

  w.document.write(`<!doctype html><html><head><title>${escapeHtml(title || value)}</title>
<style>
  @page { margin: 12mm; }
  body{font-family:system-ui,sans-serif;margin:24px;text-align:center;color:#0a2942}
  h1{font-size:14px;margin:0 0 4px;font-weight:600}
  p{font-size:12px;margin:0 0 12px;color:#445}
  svg{max-width:100%;height:auto}
</style></head><body>
${title ? `<h1>${escapeHtml(title)}</h1>` : ''}
${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
${svgMarkup}
${
  needsScript
    ? `<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<script>
  JsBarcode("#bc", ${JSON.stringify(value)}, {
    format: "CODE128", displayValue: true, fontSize: 14, height: 72, width: 2,
    margin: 8, background: "#ffffff", lineColor: "#0a2942"
  });
  setTimeout(function(){ window.focus(); window.print(); }, 250);
<\/script>`
    : `<script>setTimeout(function(){ window.focus(); window.print(); }, 150);<\/script>`
}
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
