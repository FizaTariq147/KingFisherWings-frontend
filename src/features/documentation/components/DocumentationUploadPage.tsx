import { useMemo, useRef, useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import type { DocumentationUploadType } from '../api/documentation.api';
import { useDocumentationUpload } from '../hooks/useDocumentation';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { pickValidatedUploadFile, SPREADSHEET_UPLOAD_OPTIONS } from '@/lib/fileUploadValidation';

interface DocumentationUploadPageProps {
  title: string;
  uploadType: DocumentationUploadType;
  description?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function extractErrorRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of ['errors', 'items', 'rows', 'data', 'failed']) {
    const arr = root[key];
    if (Array.isArray(arr)) {
      return arr.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [root];
}

export function DocumentationUploadPage({ title, uploadType, description }: DocumentationUploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const actions = useDocumentationUpload(uploadType);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState('');
  const [errorRows, setErrorRows] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<string | null>(null);

  const errorColumns = useMemo(() => {
    const keys = new Set<string>();
    for (const row of errorRows.slice(0, 20)) {
      Object.keys(row).forEach((k) => keys.add(k));
    }
    const preferred = ['row', 'row_number', 'line', 'field', 'message', 'error', 'code'];
    const ordered = [
      ...preferred.filter((k) => keys.has(k)),
      ...[...keys].filter((k) => !preferred.includes(k)).slice(0, 6),
    ];
    return ordered.slice(0, 8);
  }, [errorRows]);

  const upload = async (file: File) => {
    setError(null);
    setMessage(null);
    setErrorRows([]);
    setSummary(null);
    try {
      const result = await actions.upload.mutateAsync(file);
      const id = String(result.batch_id ?? result.id ?? '');
      if (id) setBatchId(id);
      const ok = result.success_count ?? result.succeeded ?? result.ok;
      const fail = result.error_count ?? result.failed ?? result.errors_count;
      if (ok != null || fail != null) {
        setSummary(`Succeeded: ${ok ?? '—'} · Failed: ${fail ?? '—'}`);
      }
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
              const { file, error: fileError } = pickValidatedUploadFile(
                e.target.files,
                SPREADSHEET_UPLOAD_OPTIONS,
              );
              if (fileError) {
                setError(fileError);
                setMessage(null);
              } else if (file) {
                void upload(file);
              }
              e.target.value = '';
            }}
          />
        </div>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {summary ? <p className="text-sm text-gray-600">{summary}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {batchId ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Batch: {batchId}</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={actions.batchErrors.isPending}
              onClick={async () => {
                try {
                  const errors = await actions.batchErrors.mutateAsync(batchId);
                  const rows = extractErrorRows(errors);
                  setErrorRows(rows);
                  setMessage(rows.length ? `${rows.length} error row(s).` : 'No row errors returned.');
                } catch (err) {
                  setError(extractAxiosErrorDetail(err));
                }
              }}
            >
              View errors
            </Button>
          </div>
        ) : null}

        {errorRows.length > 0 && errorColumns.length > 0 ? (
          <div className="overflow-auto rounded border border-red-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-red-50 text-xs uppercase text-red-800">
                <tr>
                  {errorColumns.map((col) => (
                    <th key={col} className="px-3 py-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {errorRows.map((row, i) => (
                  <tr key={i} className="border-t border-red-50">
                    {errorColumns.map((col) => (
                      <td key={col} className="px-3 py-2 text-gray-700">
                        {row[col] == null || typeof row[col] === 'object'
                          ? JSON.stringify(row[col] ?? '')
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
