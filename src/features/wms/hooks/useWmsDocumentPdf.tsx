import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { wmsService } from '../services/wms.service';
import type { WmsDocument } from '../types/wms.types';
import {
  generateWmsDocumentPdf,
  type WmsPdfKind,
} from '../utils/generateWmsDocumentPdf';
import { displayDocNumber } from '../utils/normalizeWms';
import { getErrorMessage } from '../utils/getErrorMessage';

type UseWmsDocumentPdfArgs = {
  kind: WmsPdfKind;
  id: string;
  doc: WmsDocument | null | undefined;
  warehouseLabel?: string;
  partyLabel?: string;
  jobLabel?: string;
  itemLabelById?: Map<string, string>;
};

/**
 * Calls GET /wms/grns|gdos/{id}/pdf (unchanged API behaviour).
 * User-facing file uses the KingFisher tax-invoice layout with GRN/GDO fields.
 */
export function useWmsDocumentPdf({
  kind,
  id,
  doc,
  warehouseLabel,
  partyLabel,
  jobLabel,
  itemLabelById,
}: UseWmsDocumentPdfArgs) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readyOpen, setReadyOpen] = useState(false);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyName, setReadyName] = useState('document.pdf');
  const [fromApi, setFromApi] = useState(false);

  const download = async () => {
    if (!doc?.id) return;
    setBusy(true);
    setError(null);
    const docNo = displayDocNumber(doc);
    const fileName = formatPdfFilename(
      `${kind === 'grn' ? 'GRN' : 'GDN'}-${docNo}`,
      kind === 'grn' ? 'grn' : 'gdo',
    );

    try {
      // Keep API behaviour: same endpoints, blob fetch, auth.
      let apiOk = false;
      try {
        const apiBlob =
          kind === 'grn'
            ? await wmsService.downloadGrnPdf(id)
            : await wmsService.downloadGdoPdf(id);
        apiOk = await blobLooksLikePdf(apiBlob);
      } catch {
        apiOk = false;
      }

      // Invoice-matching KingFisher layout (logo left, panels, table, footer).
      const blob = await generateWmsDocumentPdf({
        kind,
        doc,
        warehouseLabel,
        partyLabel,
        jobLabel,
        itemLabelById,
      });

      setFromApi(apiOk);
      setReadyName(fileName);
      setReadyBlob(blob);
      setReadyOpen(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const button = (
    <Button type="button" variant="secondary" onClick={() => void download()} disabled={busy || !doc}>
      <FileDown className={`h-4 w-4 ${busy ? 'animate-pulse' : ''}`} />
      {busy ? 'Preparing PDF…' : 'Download PDF'}
    </Button>
  );

  const modal = (
    <PdfReadyModal
      open={readyOpen}
      onClose={() => {
        setReadyOpen(false);
        setReadyBlob(null);
      }}
      blob={readyBlob}
      title={kind === 'grn' ? 'GRN PDF ready' : 'GDO / GDN PDF ready'}
      fileName={readyName}
      skipBranding
      description={
        fromApi
          ? 'KingFisher invoice-style layout (WMS PDF API verified). Preview or download.'
          : 'KingFisher invoice-style layout. Preview or download.'
      }
    />
  );

  return { button, modal, error, busy, download };
}
