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
import { asRecord, pickString } from '@/features/portal-shared/normalize';
import { generateCatalogLayoutPdf } from '@/features/reports/utils/generateCatalogLayoutPdf';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { resolveCatalogContextPdfData } from '@/features/reports/utils/resolveCatalogContextPdfData';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import {
  BL_DRAFT_FORMAT_CODE,
  HAWB_DRAFT_FORMAT_CODE,
  buildBlDraftClassicModel,
} from './generateBlDraftPdf';
import { loadBlDraftSource } from './loadBlDraftSource';

function firstNonEmpty(...lists: string[][]): string[] {
  for (const list of lists) {
    if (list.length) return list;
  }
  return [];
}

/** Job refs (JB…) must never be treated as HAWB/MAWB serials. */
function airWaybillSerial(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    const s = pickString(c);
    if (!s) continue;
    if (/^JB/i.test(s) || /\bJOB\b/i.test(s)) continue;
    return s;
  }
  return undefined;
}

export type TransportDraftKind = 'hbl' | 'hawb';

/**
 * Staff transport draft from booking form:
 * - hbl → FG_HBL_FORMAT_1 (HBL Draft Jasper 1) for sea Bill of Lading
 * - hawb → HAWB_DRAFT_REPORT_FORMAT for air Airway Bill
 * Survives missing GET …/bl-draft/preview (404) via booking-form fallback.
 */
export function BlDraftFromBookingPanel({
  jobId,
  shipmentId,
  quotationId,
  kind = 'hbl',
  onGenerated,
}: {
  jobId?: string;
  shipmentId?: string;
  quotationId?: string;
  /** Sea BL draft vs air HAWB draft. Default sea. */
  kind?: TransportDraftKind;
  onGenerated?: () => void;
}) {
  const isHawb = kind === 'hawb';
  const formatCode = isHawb ? HAWB_DRAFT_FORMAT_CODE : BL_DRAFT_FORMAT_CODE;
  const draftLabel = isHawb ? 'HAWB draft' : 'HBL draft';
  const formatLabel = isHawb
    ? 'HAWB Draft Report Format'
    : 'HBL Draft Jasper 1 (FG HBL Format-1)';
  const defaultFileStem = isHawb ? 'HAWB-draft' : 'HBL-draft';

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
  const [readyFileName, setReadyFileName] = useState(`${defaultFileStem}.pdf`);

  if (!scopeJob && !scopeShipment) return null;

  const fileName = readyFileName || `${defaultFileStem}.pdf`;
  const canDownload = Boolean(readyBlob);

  const generate = async () => {
    setError(null);
    setMsg(null);
    setLoading(true);
    setReadyOpen(false);
    setReadyBlob(null);
    try {
      setMsg(`Loading booking-form ${draftLabel} fields…`);
      const { preview: previewPayload, source } = await loadBlDraftSource({
        jobId: scopeJob || undefined,
        shipmentId: scopeShipment || undefined,
        quotationId: quotationId && isUuid(quotationId) ? quotationId : undefined,
      });

      if (source === 'booking-form') {
        setMsg(`${draftLabel} preview API unavailable — using booking form fields…`);
      } else if (source === 'empty') {
        setMsg(`Building ${draftLabel} from linked job / shipment context…`);
      }

      try {
        if (isHawb && scopeJob) {
          await jobService.generateHawb(scopeJob, {
            is_original: false,
            layout_variant: formatCode,
          });
        } else if (useShipmentGenerate) {
          await shipmentService.generateBlDraft(scopeShipment, {
            is_original: false,
            layout_variant: formatCode,
            format: formatCode,
            ...previewPayload,
          });
        } else if (scopeJob) {
          await jobService.generateBlDraft(scopeJob, {
            is_original: false,
            layout_variant: formatCode,
            format: formatCode,
            ...previewPayload,
          });
        }
      } catch {
        /* Client catalog PDF is the visual source of truth. */
      }

      setMsg(`Building ${formatLabel} (KingFisher)…`);
      const context = await resolveCatalogContextPdfData(
        {
          job_id: scopeJob || undefined,
          shipment_id: scopeShipment || undefined,
          quotation_id: quotationId && isUuid(quotationId) ? quotationId : undefined,
        },
        { formatCode },
      );
      const classic = buildBlDraftClassicModel(previewPayload, context);
      const previewRec = asRecord(previewPayload) ?? {};
      const commodity =
        pickString(
          previewRec.commodity,
          previewRec.goods_description,
          previewRec.goodsDescription,
          previewRec.description_of_goods,
          context.commodity,
        ) || undefined;
      const pieces =
        pickString(
          previewRec.pieces,
          previewRec.packages,
          previewRec.no_of_packages,
          classic.containerRows
            .map((r) => String(r.packages || '').replace(/[^\d.]/g, ''))
            .find(Boolean),
          context.pieces,
        ) || undefined;
      const grossWeight =
        pickString(
          previewRec.gross_weight,
          previewRec.grossWeight,
          classic.containerRows
            .map((r) => String(r.weight || '').replace(/[^\d.]/g, ''))
            .find(Boolean),
          context.grossWeight,
        ) || undefined;
      const measurement =
        pickString(
          previewRec.measurement,
          previewRec.volume_cbm,
          previewRec.chargeable_weight,
          classic.containerRows
            .map((r) => String(r.measurement || '').replace(/[^\d.]/g, ''))
            .find(Boolean),
          context.measurement,
        ) || undefined;
      const carrier =
        pickString(
          previewRec.carrier_name,
          previewRec.carrierName,
          previewRec.carrier,
          previewRec.shipping_line,
          classic.carrierName !== '—' ? classic.carrierName : '',
          context.carrier,
        ) || undefined;
      const jobRef =
        classic.jobRef !== '—' ? classic.jobRef : context.jobNumber || undefined;
      // Never park a job number (JB…) in hawbNo — top AWB strip would duplicate it.
      const hawbNo = isHawb
        ? airWaybillSerial(
            context.hawbNo,
            previewRec.hawb_number,
            previewRec.hawbNumber,
            previewRec.hawb_no,
          )
        : context.hawbNo;
      const hblNo = isHawb
        ? context.hblNo
        : pickString(
            classic.blNumber !== 'DRAFT' ? classic.blNumber : '',
            context.hblNo,
            context.referenceNo,
          ) || undefined;
      const data: InvoiceFormatPdfData = {
        ...context,
        entityBound: true,
        shipperLines: firstNonEmpty(classic.shipperLines, context.shipperLines || []),
        consigneeLines: firstNonEmpty(classic.consigneeLines, context.consigneeLines || []),
        notifyLines: firstNonEmpty(classic.notifyLines, context.notifyLines || []),
        hblNo,
        hawbNo,
        mawbNo: isHawb
          ? airWaybillSerial(
              context.mawbNo,
              previewRec.mawb_number,
              previewRec.mawbNumber,
              previewRec.mawb_no,
            )
          : context.mawbNo,
        jobNumber: jobRef,
        pol:
          classic.placeOfReceipt !== '—' ? classic.placeOfReceipt : context.pol,
        pod:
          classic.placeOfDelivery !== '—' ? classic.placeOfDelivery : context.pod,
        vesselFlight:
          classic.vesselVoyage !== '—' ? classic.vesselVoyage : context.vesselFlight,
        carrier,
        commodity,
        pieces,
        grossWeight,
        measurement,
        currencyCode:
          pickString(previewRec.currency, previewRec.currency_code, context.currencyCode) ||
          undefined,
        printedBy:
          context.printedBy ||
          pickString(previewRec.prepared_by, previewRec.preparedBy) ||
          context.companyEmail ||
          context.companyName,
      };
      const generated = await generateCatalogLayoutPdf(formatCode, data, {
        preferHawbOfficial: isHawb,
        purpose: 'generate',
      });
      if (!generated?.blob) {
        throw new Error(`Could not build ${formatLabel} PDF.`);
      }
      const pdfName = formatPdfFilename(
        hawbNo || hblNo || jobRef || defaultFileStem,
        defaultFileStem,
      );
      setReadyBlob(generated.blob);
      setReadyFileName(pdfName);
      setReadyOpen(true);
      setMsg(`${draftLabel} ready. Use Download / Preview.`);
      onGenerated?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = async () => {
    if (!readyBlob) {
      setError(`Generate a ${draftLabel} first.`);
      return;
    }
    setError(null);
    setDownloadBusy(true);
    try {
      await triggerBrandedPdfDownload(readyBlob, fileName, {
        filename: fileName,
        branding: {
          title: draftLabel,
          documentNumber: fileName.replace(/\.pdf$/i, ''),
        },
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
              {isHawb ? 'HAWB draft' : 'BL draft'}
            </p>
            <p className="mt-0.5 text-[11px] text-[#64748b]">
              {formatLabel} with KingFisher branding — filled from the booking form / job{' '}
              {isHawb ? 'Airway Bill' : 'Bill of Lading'}.
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
              {loading ? 'Building…' : `Generate ${draftLabel}`}
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

        <p className="text-[11px] text-[#94a3b8]">
          Click Generate {draftLabel} to open {formatLabel} filled from booking-form parties,
          cargo, and routing.
        </p>
      </section>

      <PdfReadyModal
        open={readyOpen}
        onClose={() => setReadyOpen(false)}
        url={null}
        blob={readyBlob}
        title={`${draftLabel} ready`}
        fileName={fileName}
        skipBranding
        description={`${formatLabel} (${formatCode}) with KingFisher branding.`}
      />
    </>
  );
}
