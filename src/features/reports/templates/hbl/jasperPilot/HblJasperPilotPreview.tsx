import { useMemo, useState } from 'react';
import { Download, Loader2, Minus, Plus, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { HBL_JASPER_PILOT_CONFIG } from './hblJasperPilot.config';
import { HblJasperPilotDocument } from './HblJasperPilotDocument';
import { mapToHblJasperPilotModel } from './mapToHblJasperPilotModel';
import { generateHblJasperPilotPdf } from './generateHblJasperPilotPdf';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';

type Props = {
  data?: InvoiceFormatPdfData;
  loading?: boolean;
  error?: string | null;
  className?: string;
};

const ZOOM_STEPS = [0.6, 0.75, 0.9, 1, 1.15, 1.3];

/**
 * Professional on-canvas HBL Jasper preview (A4).
 * Application chrome (zoom / download / print) stays outside document print CSS.
 */
export function HblJasperPilotPreview({
  data = {},
  loading = false,
  error = null,
  className = '',
}: Props) {
  const [zoomIdx, setZoomIdx] = useState(3);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const zoom = ZOOM_STEPS[zoomIdx] ?? 1;
  const config = HBL_JASPER_PILOT_CONFIG;

  const model = useMemo(
    () =>
      mapToHblJasperPilotModel(data, {
        showPlaceholders: !data.entityBound,
      }),
    [data],
  );

  const pageW = config.page.widthCssPx;
  const pageH = Math.round(config.page.heightCssPx * 0.92);

  const handleDownload = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const { blob, fileName } = await generateHblJasperPilotPdf(data, {
        appendCustomerTerms: config.appendCustomerTerms,
        showPlaceholders: !data.entityBound,
      });
      triggerBlobDownload(blob, fileName);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'PDF download failed.');
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const { blob } = await generateHblJasperPilotPdf(data, {
        appendCustomerTerms: false,
        showPlaceholders: !data.entityBound,
      });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (win) {
        win.addEventListener('load', () => {
          try {
            win.print();
          } catch {
            /* browser may block */
          }
        });
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Print preview failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="hbl-jasper-pilot-preview-chrome flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2">
        <p className="text-xs text-[var(--color-neutral-600)]">
          A4 · {config.page.widthPt}×{config.page.heightPt} pt · portrait · page 1 / 1
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={zoomIdx <= 0 || loading}
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
            aria-label="Zoom out"
          >
            <Minus size={14} aria-hidden />
          </Button>
          <span className="min-w-[3rem] text-center text-xs tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={zoomIdx >= ZOOM_STEPS.length - 1 || loading}
            onClick={() => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            aria-label="Zoom in"
          >
            <Plus size={14} aria-hidden />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading || busy}
            onClick={() => void handlePrint()}
          >
            <Printer size={14} aria-hidden />
            Print
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading || busy}
            onClick={() => void handleDownload()}
          >
            {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Download size={14} aria-hidden />}
            PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--color-neutral-500)]" role="status">
          Loading HBL Jasper data…
        </p>
      ) : null}

      {error || actionError ? (
        <p role="alert" className="text-sm text-[var(--color-danger-700)]">
          {error || actionError}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="max-h-[min(75vh,920px)] overflow-auto rounded border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-4">
          <div
            className="mx-auto origin-top"
            style={{
              width: pageW * zoom,
              minHeight: pageH * zoom,
            }}
          >
            <div
              style={{
                width: pageW,
                minHeight: pageH,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                background: '#fff',
              }}
            >
              <HblJasperPilotDocument model={model} config={config} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
