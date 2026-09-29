import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { jobDisplayNumber } from '@/features/jobs/utils/jobRoute';
import { prepareJobDocumentDisplayPdf } from '@/features/jobs/utils/prepareJobDocumentDisplayPdf';
import { resolveJobDocumentFileUrl } from '@/features/jobs/utils/resolveJobDocumentFileUrl';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { useJob } from '@/features/jobs/hooks/useJobs';
import { useCcJobActions } from '../hooks/useCustomsClearance';

function readPdfUrlFromPayload(
  payload: Record<string, unknown>,
  tenantId?: string,
): string | null {
  const doc = payload.document;
  if (doc && typeof doc === 'object') {
    const url = resolveJobDocumentFileUrl(doc as { file_url?: string; s3_key?: string }, tenantId);
    if (url) return url;
  }
  const direct =
    resolveJobDocumentFileUrl(
      {
        file_url: String(payload.file_url ?? payload.pdf_url ?? payload.url ?? ''),
        s3_key: String(payload.s3_key ?? ''),
      },
      tenantId,
    ) || null;
  return direct;
}

/** POST /jobs/:id/cc/documents/entry-pack — preview with invoice header/footer on API PDF. */
export function CcEntryPackCard({ jobId }: { jobId: string }) {
  const actions = useCcJobActions(jobId);
  const { data: job } = useJob(jobId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const tenantId = resolveSessionTenantIdFromAuth({ accessToken, user });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);
  const [pdfReadyName, setPdfReadyName] = useState('cc-entry-pack.pdf');

  const openEntryPackPdf = async (fileUrl?: string | null, waitForUrl = false) => {
    setPdfBusy(true);
    setPdfReadyBlob(null);
    setPdfReadyName(
      formatPdfFilename(
        `CC-ENTRY-PACK-${job ? jobDisplayNumber(job) : jobId}`,
        'cc-entry-pack',
      ),
    );
    setPdfReadyOpen(true);
    try {
      const blob = await prepareJobDocumentDisplayPdf({
        jobId,
        tenantId,
        fileUrl,
        waitForUrl,
      });
      setPdfReadyBlob(blob);
      setMsg('Entry pack PDF ready (API body + invoice header/footer).');
    } catch (e) {
      setPdfReadyOpen(false);
      setErr(getErrorMessage(e));
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CC entry pack</CardTitle>
      </CardHeader>
      <div className="space-y-2 px-4 pb-4">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Generate the customs entry pack on the API. Preview adds invoice header/footer only — inner
          PDF layout stays as returned by the server.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={actions.entryPack.isPending || pdfBusy}
            onClick={() =>
              void (async () => {
                setErr(null);
                setMsg(null);
                try {
                  const payload = await actions.entryPack.mutateAsync({});
                  setMsg('Entry pack generated.');
                  const url = readPdfUrlFromPayload(payload, tenantId);
                  await openEntryPackPdf(url, !url);
                } catch (e) {
                  setErr(getErrorMessage(e));
                }
              })()
            }
          >
            {pdfBusy ? 'Preparing PDF…' : 'Generate entry pack'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pdfBusy}
            onClick={() => void openEntryPackPdf(null, true)}
          >
            Preview PDF
          </Button>
        </div>
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
      </div>

      <PdfReadyModal
        open={pdfReadyOpen}
        onClose={() => {
          setPdfReadyOpen(false);
          setPdfReadyBlob(null);
        }}
        blob={pdfReadyBlob}
        title="CC entry pack PDF ready"
        fileName={pdfReadyName}
        skipBranding
        description="API-generated PDF with invoice header and footer applied. Inner layout is unchanged."
      />
    </Card>
  );
}
