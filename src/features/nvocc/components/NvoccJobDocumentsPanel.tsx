import { useState } from 'react';
import { StoredFileLink } from '@/features/files/components/StoredFileLink';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJob, useJobDocuments } from '@/features/jobs/hooks/useJobs';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { resolveJobDocumentPdfMeta } from '@/features/jobs/utils/jobDocumentPdfMeta';
import { prepareJobDocumentDisplayPdf } from '@/features/jobs/utils/prepareJobDocumentDisplayPdf';
import { jobDisplayNumber } from '@/features/jobs/utils/jobRoute';
import { resolveJobDocumentFileUrl } from '@/features/jobs/utils/resolveJobDocumentFileUrl';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import {
  useNvoccJobActions,
  useNvoccJobGenerationStatus,
} from '../hooks/useNvoccJobs';
import { JobDocumentGenerationStatusCard } from '@/features/jobs/components/JobDocumentGenerationStatusCard';

const DOCUMENT_GENERATORS = [
  { key: 'hblDraft', label: 'HBL draft', pdfKey: 'hbl', copyLabel: 'DRAFT' },
  { key: 'hblOriginal', label: 'HBL original', pdfKey: 'hbl' },
  { key: 'hblDraftGated', label: 'HBL draft (gated)', pdfKey: 'hbl', copyLabel: 'DRAFT' },
  { key: 'hblOriginalGated', label: 'HBL original (gated)', pdfKey: 'hbl' },
  { key: 'hblExpressRelease', label: 'HBL express release', pdfKey: 'hbl-er' },
  { key: 'surrenderNotice', label: 'Surrender notice', pdfKey: 'surrender' },
  { key: 'mbl', label: 'MBL', pdfKey: 'mbl' },
  { key: 'preCan', label: 'Pre-CAN', pdfKey: 'pre-can' },
  { key: 'can', label: 'CAN', pdfKey: 'can' },
  { key: 'deliveryOrder', label: 'Delivery order', pdfKey: 'delivery-order' },
  { key: 'preAlertPdf', label: 'Pre-alert PDF', pdfKey: 'pre-alert' },
  { key: 'bookingConfirmation', label: 'Booking confirmation', pdfKey: 'job-card' },
  { key: 'stuffingReport', label: 'Stuffing report', pdfKey: 'stuffing' },
  { key: 'cargoManifest', label: 'Cargo manifest', pdfKey: 'cargo-mf' },
  { key: 'jobCard', label: 'Job card', pdfKey: 'job-card' },
  { key: 'jobPnl', label: 'Job P&L PDF', pdfKey: 'job-pnl' },
  { key: 'proformaInvoice', label: 'Proforma invoice', pdfKey: 'proforma' },
] as const;

type GeneratorKey = (typeof DOCUMENT_GENERATORS)[number]['key'];

interface NvoccJobDocumentsPanelProps {
  jobId: string;
}

export function NvoccJobDocumentsPanel({ jobId }: NvoccJobDocumentsPanelProps) {
  const { data: job } = useJob(jobId);
  const { data: documents = [], refetch } = useJobDocuments(jobId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const tenantId = resolveSessionTenantIdFromAuth({ accessToken, user });
  const actions = useNvoccJobActions(jobId);
  const [poll, setPoll] = useState(false);
  const { data: genStatus } = useNvoccJobGenerationStatus(jobId, poll);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preAlertEmail, setPreAlertEmail] = useState('');
  const [preAlertMsg, setPreAlertMsg] = useState('');
  const [mblNumber, setMblNumber] = useState('');

  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);
  const [pdfReadyName, setPdfReadyName] = useState('document.pdf');
  const [pdfReadyTitle, setPdfReadyTitle] = useState('Document PDF ready');

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openKingFisherPdf = async (
    documentKey: string,
    documentLabel?: string,
    fileUrl?: string | null,
    waitForUrl = false,
  ) => {
    setError(null);
    setPdfBusy(true);
    setPdfReadyBlob(null);
    const meta = resolveJobDocumentPdfMeta(documentKey, documentLabel);
    const file = formatPdfFilename(
      `${meta.documentTitle}-${job ? jobDisplayNumber(job) : jobId}`,
      meta.documentTitle.toLowerCase().replace(/\s+/g, '-'),
    );
    setPdfReadyName(file);
    setPdfReadyTitle(`${meta.documentTitle} PDF ready`);
    setPdfReadyOpen(true);
    try {
      const blob = await prepareJobDocumentDisplayPdf({
        jobId,
        tenantId,
        fileUrl,
        waitForUrl,
      });
      setPdfReadyBlob(blob);
      setMessage(`${meta.documentTitle} PDF ready (API body + invoice header/footer).`);
    } catch (err) {
      setPdfReadyOpen(false);
      setError(getErrorMessage(err));
    } finally {
      setPdfBusy(false);
    }
  };

  const generate = async (key: GeneratorKey, pdfKey: string, label: string) => {
    setError(null);
    setMessage(null);
    try {
      await actions[key].mutateAsync({});
      setPoll(true);
      setMessage('Document generation queued.');
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
    await openKingFisherPdf(pdfKey, label, null, true);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-neutral-500)]">
        CRO / loading / payment / close report live on the <strong>Ops / Mode</strong> tab.
        Invoice header/footer on API PDFs only. Prefer gated HBL after portal draft + payment.
      </p>

      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      {message && <p className="text-sm text-[var(--color-success-700)]">{message}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Registered documents</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2">
          {documents.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No documents yet.</p>
          ) : (
            documents.map((raw) => {
              const d = raw as {
                id: string;
                document_type?: string;
                file_name?: string;
                file_url?: string;
                s3_key?: string;
                status?: string;
              };
              const storedUrl = resolveJobDocumentFileUrl(d, tenantId);
              return (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm py-2 border-b border-[var(--color-neutral-100)]"
                >
                  <div>
                    <p className="font-medium">{d.file_name || d.document_type}</p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      {d.document_type} · {d.status || '—'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={pdfBusy}
                      onClick={() =>
                        void openKingFisherPdf(
                          d.document_type || 'DOCUMENT',
                          d.file_name || d.document_type,
                          storedUrl,
                        )
                      }
                    >
                      {pdfBusy ? 'Building…' : 'View PDF'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={pdfBusy}
                      onClick={() =>
                        void openKingFisherPdf(
                          d.document_type || 'DOCUMENT',
                          d.file_name || d.document_type,
                          storedUrl,
                        )
                      }
                    >
                      Download PDF
                    </Button>
                    {storedUrl ? (
                      <StoredFileLink
                        url={storedUrl}
                        label="Stored file"
                        displayName={d.file_name}
                        className="text-sm text-[var(--color-neutral-500)] underline"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => run(() => actions.submitSi.mutateAsync(), 'SI submitted.')}
          >
            Submit SI
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => run(() => actions.submitVgm.mutateAsync(), 'VGM submitted.')}
          >
            Submit VGM
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => run(() => actions.podReceived.mutateAsync(), 'POD received recorded.')}
          >
            POD received
          </Button>
        </div>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            placeholder="MBL number (optional)"
            value={mblNumber}
            onChange={(e) => setMblNumber(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              run(
                () =>
                  actions.mblReceived.mutateAsync({
                    ...(mblNumber.trim() ? { mbl_number: mblNumber.trim() } : {}),
                  }),
                'MBL received recorded.',
              )
            }
          >
            Record MBL received
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send pre-alert</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            type="email"
            placeholder="To email *"
            value={preAlertEmail}
            onChange={(e) => setPreAlertEmail(e.target.value)}
          />
          <Input
            placeholder="Message"
            value={preAlertMsg}
            onChange={(e) => setPreAlertMsg(e.target.value)}
          />
          <Button
            type="button"
            disabled={!preAlertEmail || actions.sendPreAlert.isPending}
            onClick={() =>
              run(
                () =>
                  actions.sendPreAlert.mutateAsync({
                    to_email: preAlertEmail,
                    message: preAlertMsg || undefined,
                  }),
                'Pre-alert sent.',
              )
            }
          >
            Send pre-alert
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate PDF</CardTitle>
        </CardHeader>
        <p className="px-4 text-xs text-[var(--color-neutral-500)] -mt-2 mb-2">
          Invoice header/footer on API PDF content.
        </p>
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {DOCUMENT_GENERATORS.map((g) => (
            <Button
              key={g.key}
              type="button"
              variant="secondary"
              size="sm"
              disabled={actions[g.key].isPending || pdfBusy}
              onClick={() => void generate(g.key, g.pdfKey, g.label)}
            >
              {g.label}
            </Button>
          ))}
        </div>
      </Card>

      {poll && genStatus != null && (
        <JobDocumentGenerationStatusCard status={genStatus} polling />
      )}

      <PdfReadyModal
        open={pdfReadyOpen}
        onClose={() => {
          setPdfReadyOpen(false);
          setPdfReadyBlob(null);
        }}
        blob={pdfReadyBlob}
        title={pdfReadyTitle}
        fileName={pdfReadyName}
        skipBranding
        description="API-generated PDF with invoice header and footer applied. Inner layout is unchanged."
      />
    </div>
  );
}
