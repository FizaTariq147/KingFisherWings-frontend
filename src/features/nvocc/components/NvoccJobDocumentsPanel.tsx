import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJobDocuments } from '@/features/jobs/hooks/useJobs';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  useNvoccJobActions,
  useNvoccJobGenerationStatus,
} from '../hooks/useNvoccJobs';

const DOCUMENT_GENERATORS = [
  { key: 'hblDraft', label: 'HBL draft' },
  { key: 'hblOriginal', label: 'HBL original' },
  { key: 'hblExpressRelease', label: 'HBL express release' },
  { key: 'surrenderNotice', label: 'Surrender notice' },
  { key: 'mbl', label: 'MBL' },
  { key: 'preCan', label: 'Pre-CAN' },
  { key: 'can', label: 'CAN' },
  { key: 'deliveryOrder', label: 'Delivery order' },
  { key: 'preAlertPdf', label: 'Pre-alert PDF' },
  { key: 'bookingConfirmation', label: 'Booking confirmation' },
  { key: 'stuffingReport', label: 'Stuffing report' },
  { key: 'cargoManifest', label: 'Cargo manifest' },
  { key: 'jobCard', label: 'Job card' },
  { key: 'jobPnl', label: 'Job P&L PDF' },
  { key: 'proformaInvoice', label: 'Proforma invoice' },
] as const;

type GeneratorKey = (typeof DOCUMENT_GENERATORS)[number]['key'];

interface NvoccJobDocumentsPanelProps {
  jobId: string;
}

export function NvoccJobDocumentsPanel({ jobId }: NvoccJobDocumentsPanelProps) {
  const { data: documents = [], refetch } = useJobDocuments(jobId);
  const actions = useNvoccJobActions(jobId);
  const [poll, setPoll] = useState(false);
  const { data: genStatus } = useNvoccJobGenerationStatus(jobId, poll);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preAlertEmail, setPreAlertEmail] = useState('');
  const [preAlertMsg, setPreAlertMsg] = useState('');
  const [mblNumber, setMblNumber] = useState('');

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

  const generate = (key: GeneratorKey) => {
    void run(async () => {
      await actions[key].mutateAsync({});
      setPoll(true);
    }, 'Document generation queued.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-neutral-500)]">
        NVOCC job documents use <code className="text-xs">/nvocc/jobs/{'{id}'}/documents/*</code> endpoints.
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
                status?: string;
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
                    </p>
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
          <Button type="button" variant="secondary" size="sm" onClick={() => run(() => actions.submitSi.mutateAsync(), 'SI submitted.')}>
            Submit SI
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => run(() => actions.submitVgm.mutateAsync(), 'VGM submitted.')}>
            Submit VGM
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => run(() => actions.podReceived.mutateAsync(), 'POD received recorded.')}>
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
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {DOCUMENT_GENERATORS.map((g) => (
            <Button
              key={g.key}
              type="button"
              variant="secondary"
              size="sm"
              disabled={actions[g.key].isPending}
              onClick={() => generate(g.key)}
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
