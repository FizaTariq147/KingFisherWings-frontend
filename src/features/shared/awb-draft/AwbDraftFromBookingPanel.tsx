import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { jobService } from '@/features/jobs/services/job.service';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { shipmentService } from '@/features/shipments/services/shipment.service';
import { isUuid } from '@/lib/isUuid';
import { AwbDraftClassicDocument, type AwbDraftClassicModel } from './AwbDraftClassicDocument';
import {
  HAWB_DRAFT_FORMAT_CODE,
  MAWB_DRAFT_FORMAT_CODE,
  generateAwbDraftPdf,
} from './generateAwbDraftPdf';
import { loadAwbDraftSource } from './loadAwbDraftSource';
import { resolveAwbDraftGeneratePdf } from './resolveAwbDraftGeneratePdf';

/** Live backend contract (kingfisherwings-backend Jobs / Shipments AWB draft). */
export const AWB_DRAFT_BACKEND_REQUIREMENTS = [
  'GET /jobs/:id/hawb-draft/preview · /mawb-draft/preview · /awb-draft/preview (shared fallback)',
  'POST /jobs/:id/hawb-draft/generate · /mawb-draft/generate (sync PDF + document_id / download_path)',
  'GET /shipments/:id/hawb-draft/preview · /awb-draft/preview',
  'POST /shipments/:id/hawb-draft/generate · /mawb-draft/generate',
  'Client PDF: IATA laser AWB face (no KingFisher logo); T&C appended as original fonts',
] as const;

/**
 * Staff HAWB/MAWB draft — IATA Air Waybill face (sample MAWB style), same action
 * pattern as BL draft on job / quotation / shipment.
 */
export function AwbDraftFromBookingPanel({
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
  const scopeJob = jobId && isUuid(jobId) ? jobId : '';
  const scopeShipment = shipmentId && isUuid(shipmentId) ? shipmentId : '';
  const scopeQuotation = quotationId && isUuid(quotationId) ? quotationId : '';
  const useShipmentGenerate = !scopeJob && Boolean(scopeShipment);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<'hawb' | 'mawb'>('hawb');
  const [readyOpen, setReadyOpen] = useState(false);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyFileName, setReadyFileName] = useState('HAWB-draft.pdf');
  const [classicModel, setClassicModel] = useState<AwbDraftClassicModel | null>(null);

  if (!scopeJob && !scopeShipment && !scopeQuotation) return null;

  const fileName = readyFileName || `${kind.toUpperCase()}-draft.pdf`;
  const canDownload = Boolean(readyBlob);
  const label = kind === 'mawb' ? 'MAWB' : 'HAWB';

  const generate = async () => {
    setError(null);
    setMsg(null);
    setLoading(true);
    setReadyOpen(false);
    setReadyBlob(null);
    setClassicModel(null);
    try {
      setMsg(`Loading air booking-form ${label} fields…`);
      const { preview, source, resolvedJobId } = await loadAwbDraftSource({
        jobId: scopeJob || undefined,
        shipmentId: scopeShipment || undefined,
        quotationId: scopeQuotation || undefined,
        documentKind: kind,
      });

      if (source === 'booking-form') {
        setMsg(
          `${label} draft preview API unavailable — using air booking form + air details…`,
        );
      } else if (source === 'empty') {
        setMsg(`Building ${label} draft from linked job / shipment context…`);
      }

      const pdfJobId = scopeJob || resolvedJobId || '';
      const format =
        kind === 'mawb' ? MAWB_DRAFT_FORMAT_CODE : HAWB_DRAFT_FORMAT_CODE;
      const dto: Record<string, unknown> = { format, ...preview };

      try {
        if (useShipmentGenerate) {
          await shipmentService.generateAwbDraft(scopeShipment, kind, dto);
        } else if (scopeJob) {
          await jobService.generateAwbDraft(scopeJob, kind, dto);
        }
      } catch {
        /* Classic IATA client PDF is the visual source of truth. */
      }

      setMsg(`Building IATA ${label} draft…`);
      try {
        const { blob, fileName: pdfName, model } = await generateAwbDraftPdf({
          jobId: pdfJobId || undefined,
          shipmentId: scopeShipment || undefined,
          quotationId: scopeQuotation || undefined,
          preview,
          documentKind: kind,
        });
        setClassicModel(model);
        setReadyBlob(blob);
        setReadyFileName(pdfName);
        setReadyOpen(true);
        setMsg(`${label} draft ready. Use Download / Preview.`);
        onGenerated?.();
        return;
      } catch (classicErr) {
        /* Fall back to sync BE PDF when classic render fails. */
        try {
          const generated = useShipmentGenerate
            ? await shipmentService.generateAwbDraft(scopeShipment, kind, dto)
            : scopeJob
              ? await jobService.generateAwbDraft(scopeJob, kind, dto)
              : null;
          const bePdf = generated
            ? await resolveAwbDraftGeneratePdf(generated, {
                jobId: pdfJobId || undefined,
                typeHint: kind === 'mawb' ? 'mawb' : 'hawb|awb',
              })
            : null;
          if (bePdf?.blob) {
            setReadyBlob(bePdf.blob);
            setReadyFileName(
              bePdf.fileName ||
                `${label}-draft-${(pdfJobId || scopeShipment || 'draft').slice(0, 8)}.pdf`,
            );
            setReadyOpen(true);
            setMsg(`${label} draft ready from server.`);
            onGenerated?.();
            return;
          }
        } catch {
          /* rethrow classic error below */
        }
        throw classicErr;
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = () => {
    if (!readyBlob) {
      setError(`Generate a ${label} draft first.`);
      return;
    }
    setError(null);
    // Same bytes as Preview (PdfReadyModal skipBranding) — no branded stamp.
    triggerBlobDownload(readyBlob, fileName);
  };

  return (
    <>
      <section className="space-y-3 rounded-sm border border-[var(--fresa-border,#C9D3DF)] p-3 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              AWB draft
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-8 rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-xs"
              value={kind}
              onChange={(e) => setKind(e.target.value === 'mawb' ? 'mawb' : 'hawb')}
              aria-label="AWB document kind"
            >
              <option value="hawb">HAWB</option>
              <option value="mawb">MAWB</option>
            </select>
            <Button
              type="button"
              size="sm"
              variant="report"
              disabled={loading}
              onClick={() => void generate()}
            >
              {loading ? 'Building…' : `Generate ${label} draft`}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loading || !canDownload}
              onClick={() => setReadyOpen(true)}
            >
              Preview
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loading || !canDownload}
              onClick={handleDirectDownload}
            >
              Download PDF
            </Button>
          </div>
        </div>

        {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
        {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

        {classicModel ? (
          <div className="overflow-x-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white p-2">
            <AwbDraftClassicDocument model={classicModel} />
          </div>
        ) : null}
      </section>

      <PdfReadyModal
        open={readyOpen}
        onClose={() => setReadyOpen(false)}
        url={null}
        blob={readyBlob}
        title={`${label} draft ready`}
        fileName={fileName}
        skipBranding
        description={`${label} draft PDF`}
      />
    </>
  );
}
