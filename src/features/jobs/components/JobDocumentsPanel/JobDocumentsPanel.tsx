import { useState } from 'react';
import { StoredFileLink } from '@/features/files/components/StoredFileLink';
import { useFileDownload } from '@/features/files/hooks/useFileDownload';
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
  jobType?: string;
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
  { key: 'delivery-order', label: 'Delivery order', fn: 'generateDeliveryOrder' as const },
  { key: 'pre-can', label: 'Pre-CAN', fn: 'generatePreCan' as const },
  { key: 'can', label: 'CAN', fn: 'generateCan' as const },
  { key: 'exchange', label: 'Exchange letter', fn: 'generateExchangeLetter' as const },
  { key: 'undertake', label: 'Undertake letter', fn: 'generateUndertakeLetter' as const },
  { key: 'transport', label: 'Transport request', fn: 'generateTransportRequest' as const },
  { key: 'shipping-advice', label: 'Shipping advice', fn: 'generateShippingAdvice' as const },
  { key: 'pod-doc', label: 'Proof of delivery', fn: 'generateProofOfDelivery' as const },
  { key: 'e-awb', label: 'E-AWB', fn: 'generateEAwb' as const },
  { key: 'barcode', label: 'Barcode label', fn: 'generateBarcodeLabel' as const },
  { key: 'consignee-label', label: 'Consignee label', fn: 'generateConsigneeLabel' as const },
  { key: 'job-costing', label: 'Job costing', fn: 'generateJobCosting' as const },
  {
    key: 'freight-cert',
    label: 'Freight certificate',
    fn: 'generateFreightCertificate' as const,
  },
];

export function JobDocumentsPanel({ jobId, jobType }: JobDocumentsPanelProps) {
  const isAirImport = jobType === 'AIR_IMPORT';
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
  const [scheduleAt, setScheduleAt] = useState('');
  const [whatsAppPhone, setWhatsAppPhone] = useState('');
  const [whatsAppMsg, setWhatsAppMsg] = useState('');
  const [importNoticeEmail, setImportNoticeEmail] = useState('');
  const [importNoticeCc, setImportNoticeCc] = useState('');
  const [importNoticeMsg, setImportNoticeMsg] = useState('');
  const fileDownload = useFileDownload();

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
                file_url?: string;
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
                  <div className="flex flex-wrap gap-2">
                    {d.file_url && (
                      <>
                        <StoredFileLink
                          url={d.file_url}
                          label="View"
                          displayName={d.file_name}
                          className="text-sm text-[var(--color-primary-600)] underline"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={fileDownload.isPending}
                          onClick={() =>
                            void fileDownload.downloadStoredFile(d.file_url!, d.file_name)
                          }
                        >
                          Download
                        </Button>
                      </>
                    )}
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
                              () =>
                                docs.finalizeDocument.mutateAsync({
                                  documentId: d.id,
                                  dto: { is_finalized: true },
                                }),
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
          <Input
            type="datetime-local"
            placeholder="Schedule at"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
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
            <Button
              type="button"
              variant="secondary"
              disabled={
                !preAlertEmail || !scheduleAt || actions.schedulePreAlert.isPending
              }
              onClick={() =>
                run(
                  () =>
                    actions.schedulePreAlert.mutateAsync({
                      to_email: preAlertEmail,
                      scheduled_at: new Date(scheduleAt).toISOString(),
                      message: preAlertMsg || undefined,
                    }),
                  'Pre-alert scheduled.',
                )
              }
            >
              Schedule pre-alert
            </Button>
          </div>
        </div>
      </Card>

      {isAirImport && (
        <Card>
          <CardHeader>
            <CardTitle>Import notices (email)</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="To email (defaults to consignee)"
              value={importNoticeEmail}
              onChange={(e) => setImportNoticeEmail(e.target.value)}
            />
            <Input
              placeholder="CC"
              value={importNoticeCc}
              onChange={(e) => setImportNoticeCc(e.target.value)}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Message (optional)"
              value={importNoticeMsg}
              onChange={(e) => setImportNoticeMsg(e.target.value)}
            />
            <Button
              type="button"
              disabled={docs.sendImportNoticeCan.isPending}
              onClick={() =>
                run(
                  () =>
                    docs.sendImportNoticeCan.mutateAsync({
                      to_email: importNoticeEmail.trim() || undefined,
                      cc: importNoticeCc.trim() || undefined,
                      message: importNoticeMsg.trim() || undefined,
                    }),
                  'CAN notice sent.',
                )
              }
            >
              Email CAN PDF
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={docs.sendImportNoticeDo.isPending}
              onClick={() =>
                run(
                  () =>
                    docs.sendImportNoticeDo.mutateAsync({
                      to_email: importNoticeEmail.trim() || undefined,
                      cc: importNoticeCc.trim() || undefined,
                      message: importNoticeMsg.trim() || undefined,
                    }),
                  'Delivery order notice sent.',
                )
              }
            >
              Email delivery order PDF
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp status</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Phone (+971…)"
            value={whatsAppPhone}
            onChange={(e) => setWhatsAppPhone(e.target.value)}
          />
          <Input
            placeholder="Message *"
            value={whatsAppMsg}
            onChange={(e) => setWhatsAppMsg(e.target.value)}
          />
          <Button
            type="button"
            disabled={
              !whatsAppPhone || !whatsAppMsg || actions.sendWhatsAppStatus.isPending
            }
            onClick={() =>
              run(
                () =>
                  actions.sendWhatsAppStatus.mutateAsync({
                    to_phone: whatsAppPhone.trim(),
                    message: whatsAppMsg.trim(),
                  }),
                'WhatsApp status sent.',
              )
            }
          >
            Send WhatsApp status
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
