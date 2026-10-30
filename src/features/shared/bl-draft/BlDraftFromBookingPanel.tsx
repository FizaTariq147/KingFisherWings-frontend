import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import {
  triggerBlobDownload,
  triggerBrandedPdfDownload,
} from '@/features/files/utils/triggerBlobDownload';
import { jobService } from '@/features/jobs/services/job.service';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { shipmentService } from '@/features/shipments/services/shipment.service';
import { isUuid } from '@/lib/isUuid';
import { BlDraftClassicDocument, type BlDraftClassicModel } from './BlDraftClassicDocument';
import {
  BL_DRAFT_FORMAT_CODE,
  generateBlDraftPdf,
} from './generateBlDraftPdf';
import { loadBlDraftSource } from './loadBlDraftSource';

/**
 * Staff BL draft from booking form:
 * Loads booking-form autofill → classic FG HBL HKG form (KingFisher logo) → PDF.
 * Survives missing GET …/bl-draft/preview (404) via booking-form fallback.
 */
export function BlDraftFromBookingPanel({
  jobId,
  shipmentId,
  quotationId,
  onGenerated,
}: {
  jobId?: string;
  shipmentId?: string;
  quotationId?: string;
  onGenerated?: () => void;
}) {
  const linkedJob = jobId && isUuid(jobId) ? jobId : '';
  const scopeShipment = shipmentId && isUuid(shipmentId) ? shipmentId : '';
  const scopeJob = linkedJob;
  const useShipmentGenerate = !scopeJob && Boolean(scopeShipment);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [readyOpen, setReadyOpen] = useState(false);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyFileName, setReadyFileName] = useState('HBL-draft.pdf');
  const [classicModel, setClassicModel] = useState<BlDraftClassicModel | null>(null);

  if (!scopeJob && !scopeShipment) return null;

  const fileName = readyFileName || 'HBL-draft.pdf';
  const canDownload = Boolean(readyBlob);

  const generate = async () => {
    setError(null);
    setMsg(null);
    setLoading(true);
    setReadyOpen(false);
    setReadyBlob(null);
    setClassicModel(null);
    try {
      setMsg('Loading booking-form BL draft fields…');
      const { preview: previewPayload, source } = await loadBlDraftSource({
        jobId: scopeJob || undefined,
        shipmentId: scopeShipment || undefined,
        quotationId: quotationId && isUuid(quotationId) ? quotationId : undefined,
      });

      if (source === 'booking-form') {
        setMsg('BL draft preview API unavailable — using booking form fields…');
      } else if (source === 'empty') {
        setMsg('Building HBL draft from linked job / shipment context…');
      }

      const dto: Record<string, unknown> = {
        is_original: false,
        layout_variant: BL_DRAFT_FORMAT_CODE,
        format: BL_DRAFT_FORMAT_CODE,
        ...previewPayload,
      };
      try {
        if (useShipmentGenerate) {
          await shipmentService.generateBlDraft(scopeShipment, dto);
        } else if (scopeJob) {
          await jobService.generateBlDraft(scopeJob, dto);
        }
      } catch {
        /* Classic client PDF is the visual source of truth. */
      }

      setMsg('Building classic HBL draft (KingFisher)…');
      const { blob, fileName: pdfName, model } = await generateBlDraftPdf({
        jobId: scopeJob || undefined,
        shipmentId: scopeShipment || undefined,
        quotationId: quotationId && isUuid(quotationId) ? quotationId : undefined,
        preview: previewPayload,
      });
      setClassicModel(model);
      setReadyBlob(blob);
      setReadyFileName(pdfName);
      setReadyOpen(true);
      setMsg('HBL draft ready. Use Download / Preview.');
      onGenerated?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = async () => {
    if (!readyBlob) {
      setError('Generate an HBL draft first.');
      return;
    }
    setError(null);
    setDownloadBusy(true);
    try {
      await triggerBrandedPdfDownload(readyBlob, fileName, {
        filename: fileName,
        branding: { title: 'HBL draft', documentNumber: fileName.replace(/\.pdf$/i, '') },
      });
    } catch {
      triggerBlobDownload(readyBlob, fileName);
    } finally {
      setDownloadBusy(false);
    }
  };

  return (
    <>
      <section className="space-y-3 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              BL draft
            </p>
            <p className="mt-0.5 text-[11px] text-[#64748b]">
              Classic house bill of lading (same layout as Fresa FG HBL HKG) with KingFisher
              logo — filled from the booking form.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="report"
              disabled={loading || downloadBusy}
              onClick={() => void generate()}
            >
              {loading ? 'Building…' : 'Generate HBL draft'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loading || downloadBusy || !canDownload}
              onClick={() => setReadyOpen(true)}
            >
              Preview
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loading || downloadBusy || !canDownload}
              onClick={() => void handleDirectDownload()}
            >
              {downloadBusy ? '…' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
        {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

        {classicModel ? (
          <div className="overflow-x-auto rounded-sm bg-white p-2">
            <BlDraftClassicDocument model={classicModel} />
          </div>
        ) : (
          <p className="text-[11px] text-[#94a3b8]">
            Click Generate HBL draft to fill the classic form from booking-form parties, cargo,
            and containers.
          </p>
        )}
      </section>

      <PdfReadyModal
        open={readyOpen}
        onClose={() => setReadyOpen(false)}
        url={null}
        blob={readyBlob}
        title="HBL draft ready"
        fileName={fileName}
        skipBranding
        description="Classic HBL draft (FG HBL HKG layout) with KingFisher logo."
      />
    </>
  );
}
