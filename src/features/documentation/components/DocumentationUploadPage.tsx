import { useRef, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import type { DocumentationUploadType } from '../api/documentation.api';
import { useDocumentationUpload } from '../hooks/useDocumentation';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

interface DocumentationUploadPageProps {
  title: string;
  uploadType: DocumentationUploadType;
  description?: string;
}

export function DocumentationUploadPage({ title, uploadType, description }: DocumentationUploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const actions = useDocumentationUpload(uploadType);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState('');

  const upload = async (file: File) => {
    setError(null);
    setMessage(null);
    try {
      const result = await actions.upload.mutateAsync(file);
      const id = String(result.batch_id ?? result.id ?? '');
      if (id) setBatchId(id);
      setMessage('Upload completed successfully.');
    } catch (err) {
      setError(extractAxiosErrorDetail(err));
    }
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white p-5 space-y-4">
        <div>
          <h2 className="text-[17px] font-medium text-gray-800">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={actions.downloadTemplate.isPending}
            onClick={() => void actions.downloadTemplate.mutateAsync()}
          >
            Download template
          </Button>
          <Button type="button" onClick={() => inputRef.current?.click()}>
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = '';
            }}
          />
        </div>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {batchId ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Batch: {batchId}</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={actions.batchErrors.isPending}
              onClick={async () => {
                try {
                  const errors = await actions.batchErrors.mutateAsync(batchId);
                  setMessage(JSON.stringify(errors, null, 2));
                } catch (err) {
                  setError(extractAxiosErrorDetail(err));
                }
              }}
            >
              View errors
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
