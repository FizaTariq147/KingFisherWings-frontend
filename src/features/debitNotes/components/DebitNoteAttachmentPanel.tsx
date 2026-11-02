import { useRef, useState } from 'react';
import { Download, Paperclip, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ATTACHMENT_UPLOAD_OPTIONS,
  handleValidatedFileInput,
} from '@/lib/fileUploadValidation';
import {
  useDownloadDebitNoteAttachment,
  useUploadDebitNoteAttachment,
} from '../hooks/useDebitNotes';
import { getErrorMessage } from '../utils/getErrorMessage';

interface DebitNoteAttachmentPanelProps {
  debitNoteId: string;
  hasAttachment?: boolean;
  attachmentName?: string;
}

/** Debit-note native payment proof (same file customers upload from the portal). */
export function DebitNoteAttachmentPanel({
  debitNoteId,
  hasAttachment,
  attachmentName,
}: DebitNoteAttachmentPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const download = useDownloadDebitNoteAttachment();
  const upload = useUploadDebitNoteAttachment(debitNoteId);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const busy = download.isPending || upload.isPending;
  const label = attachmentName || pendingFile?.name || 'Payment proof';

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setMsg(null);
    setPendingFile(file);
    try {
      await upload.mutateAsync(file);
      setMsg(`Uploaded “${file.name}”. Visible on this debit note and the customer portal.`);
      if (fileRef.current) fileRef.current.value = '';
      setPendingFile(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <Paperclip className="h-4 w-4" aria-hidden />
          Attachment
        </CardTitle>
      </CardHeader>
      <div className="space-y-3 p-4 pt-0">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Payment proof stored on this debit note. Customer uploads from the portal appear here.
        </p>
        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {error}
          </p>
        ) : null}
        {msg ? (
          <p className="text-sm text-[var(--color-success-700)]" role="status">
            {msg}
          </p>
        ) : null}
        {hasAttachment ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-neutral-900)]">
                {label}
              </p>
              <p className="text-[11px] text-[var(--color-neutral-500)]">Attached file</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              disabled={busy}
              onClick={() => {
                setError(null);
                void download
                  .mutateAsync({ id: debitNoteId, name: label })
                  .catch((err) => setError(getErrorMessage(err)));
              }}
            >
              {download.isPending ? 'Downloading…' : 'Download'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-neutral-400)]">No attachment yet.</p>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-neutral-100)] pt-3">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) =>
              handleValidatedFileInput(
                e.target.files,
                (file) => void onUpload(file),
                undefined,
                ATTACHMENT_UPLOAD_OPTIONS,
              )
            }
          />
          <Button
            type="button"
            size="sm"
            variant="create"
            leftIcon={<Upload className="h-3.5 w-3.5" />}
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {upload.isPending ? 'Uploading…' : hasAttachment ? 'Replace file' : 'Upload file'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
