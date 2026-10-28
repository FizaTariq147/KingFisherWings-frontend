/**
 * Dev/CI harness: generate catalogue layout PDFs via the real app pipeline
 * without auth. Exposed at /dev/report-visual-diff?code=INVOICE_REPORT_FORMAT_1
 */
import { useEffect, useState } from 'react';
import { generateCatalogLayoutPdf } from '../utils/generateCatalogLayoutPdf';
import { resolveAnyFormatUiLayout } from '../data/resolveAnyFormatUiLayout';

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export default function ReportVisualDiffHarnessPage() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('code') || '').trim();
    if (!code) {
      setStatus('error');
      setError('Missing ?code=REPORT_CODE');
      return;
    }

    let cancelled = false;
    setStatus('generating');
    setError(null);

    void (async () => {
      try {
        const layout = resolveAnyFormatUiLayout(code);
        if (!layout) {
          throw new Error(`No local layout for ${code}`);
        }
        // Empty data → layout.demo used inside InvoiceFormatLayoutByKind (real pipeline).
        const result = await generateCatalogLayoutPdf(code, {});
        if (!result) throw new Error(`generateCatalogLayoutPdf returned null for ${code}`);
        const base64 = await blobToBase64(result.blob);
        const payload = {
          ok: true,
          code,
          name: layout.name || code,
          byteLength: result.blob.size,
          pdfBase64: base64,
          paper: layout.paper || 'A4',
          generatedAt: new Date().toISOString(),
        };
        (window as unknown as { __KF_VISUAL_DIFF__: unknown }).__KF_VISUAL_DIFF__ = payload;
        if (!cancelled) {
          setMeta({
            code: payload.code,
            name: payload.name,
            byteLength: payload.byteLength,
            paper: payload.paper,
          });
          setStatus('ready');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        (window as unknown as { __KF_VISUAL_DIFF__: unknown }).__KF_VISUAL_DIFF__ = {
          ok: false,
          code,
          error: message,
        };
        if (!cancelled) {
          setError(message);
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Report visual-diff harness</h1>
      <p>Status: {status}</p>
      {meta ? <pre>{JSON.stringify(meta, null, 2)}</pre> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <p style={{ color: '#666', fontSize: 12 }}>
        Playwright reads window.__KF_VISUAL_DIFF__ after status=ready.
      </p>
    </div>
  );
}
