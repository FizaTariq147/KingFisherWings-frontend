import { useMemo, useState } from 'react';
import { Download, Radio } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { erpTable } from '@/lib/erpTypography';
import type { JobEdiSubmission, JobEdiTypeOption } from '@/features/jobs/types/job.types';
import {
  normalizeEdiSubmissions,
  normalizeEdiTypeOptions,
  openEdiDownload,
} from './normalizeEdi';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

interface GenerateEdiPanelProps {
  title?: string;
  typesRaw: unknown;
  typesLoading?: boolean;
  submissionsRaw: unknown;
  submissionsLoading?: boolean;
  generatePending?: boolean;
  downloadPending?: boolean;
  onGenerate: (ediType: string) => Promise<unknown>;
  onDownload: (submissionId: string) => Promise<unknown>;
  onChanged?: () => void;
}

export function GenerateEdiPanel({
  title = 'Generate EDI',
  typesRaw,
  typesLoading,
  submissionsRaw,
  submissionsLoading,
  generatePending,
  downloadPending,
  onGenerate,
  onDownload,
  onChanged,
}: GenerateEdiPanelProps) {
  const types = useMemo(() => normalizeEdiTypeOptions(typesRaw), [typesRaw]);
  const submissions = useMemo(
    () => normalizeEdiSubmissions(submissionsRaw),
    [submissionsRaw],
  );
  const [ediType, setEdiType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const selected = ediType || types[0]?.code || '';

  const runGenerate = async () => {
    if (!selected.trim()) {
      setError('Select an EDI type.');
      return;
    }
    setError(null);
    setMsg(null);
    try {
      await onGenerate(selected.trim());
      setMsg(`EDI “${selected.trim()}” generated.`);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const runDownload = async (row: JobEdiSubmission) => {
    setError(null);
    setMsg(null);
    setDownloadingId(row.id);
    try {
      const raw = await onDownload(row.id);
      openEdiDownload(raw);
      setMsg(`Download ready for ${row.edi_type || row.id.slice(0, 8)}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              EDI type
            </span>
            {typesLoading ? (
              <p className="text-[13px] text-[#64748b]">Loading EDI types…</p>
            ) : (
              <select
                className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                value={selected}
                onChange={(e) => setEdiType(e.target.value)}
              >
                {types.map((t: JobEdiTypeOption) => (
                  <option key={t.code} value={t.code}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </label>
          <Button
            type="button"
            variant="report"
            leftIcon={<Radio className="h-3.5 w-3.5" />}
            disabled={generatePending || !selected.trim()}
            onClick={() => void runGenerate()}
          >
            {generatePending ? 'Generating…' : 'Generate EDI'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EDI submissions</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          {submissionsLoading ? (
            <p className="text-[13px] text-[#64748b]">Loading submissions…</p>
          ) : submissions.length === 0 ? (
            <p className="text-[13px] text-[#64748b]">No EDI submissions yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
              <table className="w-full min-w-[480px] text-left text-[13px]">
                <thead>
                  <tr>
                    <th className={erpTable.th}>Type</th>
                    <th className={erpTable.th}>Status</th>
                    <th className={erpTable.th}>File</th>
                    <th className={erpTable.th}>Created</th>
                    <th className={erpTable.th} />
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((row) => (
                    <tr key={row.id} className={erpTable.row}>
                      <td className={erpTable.td}>
                        {(row.edi_type || '—').replaceAll('_', ' ')}
                      </td>
                      <td className={erpTable.td}>{row.status || '—'}</td>
                      <td className={erpTable.td}>{row.file_name || '—'}</td>
                      <td className={erpTable.td}>
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString()
                          : '—'}
                      </td>
                      <td className={erpTable.td}>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          leftIcon={<Download className="h-3.5 w-3.5" />}
                          disabled={
                            downloadPending || downloadingId === row.id
                          }
                          onClick={() => void runDownload(row)}
                        >
                          {downloadingId === row.id ? '…' : 'Download'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
