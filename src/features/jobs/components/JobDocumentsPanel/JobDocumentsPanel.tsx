import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { JOB_DOCUMENT_TYPES } from '../../constants/job.constants';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobDocumentGenerationStatus, useJobDocuments } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobDocumentsPanelProps {
  jobId: string;
}

const GENERATORS = [
  { key: 'hawb', label: 'HAWB', fn: 'generateHawb' as const },
  { key: 'mawb', label: 'MAWB', fn: 'generateMawb' as const },
  { key: 'hbl', label: 'HBL', fn: 'generateHbl' as const },
  { key: 'hbl-er', label: 'HBL Express', fn: 'generateHblExpressRelease' as const },
  { key: 'mbl', label: 'MBL', fn: 'generateMbl' as const },
  { key: 'fiata', label: 'FIATA BL', fn: 'generateFiataBl' as const },
  { key: 'rider', label: 'Rider BL', fn: 'generateRiderBl' as const },
  { key: 'switch', label: 'Switch BL', fn: 'generateSwitchBl' as const },
  { key: 'proxy', label: 'Proxy BL', fn: 'generateProxyBl' as const },
  { key: 'b2b', label: 'Back-to-back BL', fn: 'generateBackToBackBl' as const },
  { key: 'surrender', label: 'Surrender notice', fn: 'generateSurrenderNotice' as const },
  { key: 'si', label: 'SI', fn: 'generateSi' as const },
  { key: 'stuffing', label: 'Stuffing report', fn: 'generateStuffingReport' as const },
  { key: 'sailing', label: 'Sailing confirmation', fn: 'generateSailingConfirmation' as const },
  {
    key: 'tranship',
    label: 'Transhipment confirmation',
    fn: 'generateTranshipmentConfirmation' as const,
  },
  { key: 'cargo-mf', label: 'Cargo manifest', fn: 'generateCargoManifest' as const },
  { key: 'freight-mf', label: 'Freight manifest', fn: 'generateFreightManifest' as const },
  { key: 'pre-alert', label: 'Pre-alert PDF', fn: 'generatePreAlertDoc' as const },
  { key: 'job-card', label: 'Job card', fn: 'generateJobCard' as const },
  { key: 'job-pnl', label: 'Job P&L', fn: 'generateJobPnl' as const },
  { key: 'proforma', label: 'Proforma invoice', fn: 'generateProformaInvoice' as const },
];

export function JobDocumentsPanel({ jobId }: JobDocumentsPanelProps) {
  const { data: documents = [], refetch } = useJobDocuments(jobId);
  const [poll, setPoll] = useState(false);
  const { data: genStatus } = useJobDocumentGenerationStatus(jobId, poll);
  const actions = useJobActions(jobId);
  const docs = useJobSubresourceMutations(jobId);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [docType, setDocType] = useState('OTHER');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [preAlertEmail, setPreAlertEmail] = useState('');
  const [preAlertMsg, setPreAlertMsg] = useState('');

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

  const generate = async (fn: (typeof GENERATORS)[number]['fn']) => {
    await run(async () => {
      await actions[fn].mutateAsync({});
      setPoll(true);
    }, 'Document generation queued.');
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      {message && <p className="text-sm text-[var(--color-success-700)]">{message}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
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
                status?: string;
                is_finalized?: boolean;
              };
              return (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm py-2 border-b border-[var(--color-neutral-100)]"
                >
                  <div>
                    <p className="font-medium">{d.file_name || d.document_type}</p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      {d.document_type} · {d.status || '—'}
                      {d.is_finalized ? ' · Final' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!d.is_finalized && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            run(
                              () =>
                                docs.updateDocument.mutateAsync({
                                  documentId: d.id,
                                  dto: { file_name: d.file_name },
                                }),
                              'Document updated.',
                            )
                          }
                        >
                          Touch update
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            run(
                              () => docs.finalizeDocument.mutateAsync(d.id),
                              'Document finalized.',
                            )
                          }
                        >
                          Finalize
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            run(
                              () => docs.deleteDocument.mutateAsync(d.id),
                              'Document removed.',
                            )
                          }
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Register document</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {JOB_DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Input
            placeholder="File name *"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <Input
            placeholder="File URL *"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            className="sm:col-span-2"
          />
          <Button
            type="button"
            disabled={!fileName || !fileUrl || docs.createDocument.isPending}
            onClick={() =>
              run(async () => {
                await docs.createDocument.mutateAsync({
                  document_type: docType,
                  file_name: fileName,
                  file_url: fileUrl,
                });
                setFileName('');
                setFileUrl('');
              }, 'Document registered.')
            }
          >
            Register
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
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {GENERATORS.map((g) => (
            <Button
              key={g.key}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => generate(g.fn)}
            >
              {g.label}
            </Button>
          ))}
        </div>
      </Card>

      {poll && genStatus != null && (
        <Card>
          <CardHeader>
            <CardTitle>Generation status</CardTitle>
          </CardHeader>
          <pre className="px-4 pb-4 text-xs overflow-auto max-h-40">
            {JSON.stringify(genStatus, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
