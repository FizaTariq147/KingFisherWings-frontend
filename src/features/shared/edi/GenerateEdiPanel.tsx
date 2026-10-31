import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Radio, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { erpTable } from '@/lib/erpTypography';
import type { JobEdiSubmission, JobEdiTypeOption } from '@/features/jobs/types/job.types';
import {
  normalizeEdiSubmissions,
  normalizeEdiTypeOptions,
  pickEdiFileNameFromGenerate,
  pickEdiSubmissionId,
  saveEdiDownload,
} from './normalizeEdi';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

export type GenerateEdiRequest = {
  edi_type: string;
  company_codes?: string[];
};

interface GenerateEdiPanelProps {
  title?: string;
  typesRaw: unknown;
  typesLoading?: boolean;
  submissionsRaw: unknown;
  submissionsLoading?: boolean;
  generatePending?: boolean;
  downloadPending?: boolean;
  /** Prefill from job show_all / edi_company_code when present. */
  initialCompanyCodes?: string[];
  onGenerate: (dto: GenerateEdiRequest) => Promise<unknown>;
  onDownload: (submissionId: string) => Promise<unknown>;
  onChanged?: () => void;
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function GenerateEdiPanel({
  title = 'Generate EDI',
  typesRaw,
  typesLoading,
  submissionsRaw,
  submissionsLoading,
  generatePending,
  downloadPending,
  initialCompanyCodes,
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
  const [companyCodes, setCompanyCodes] = useState<string[]>([]);
  const [codeDraft, setCodeDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCompanyCodes?.length) return;
    setCompanyCodes((prev) => {
      if (prev.length) return prev;
      const next: string[] = [];
      for (const raw of initialCompanyCodes) {
        const code = normalizeCode(raw);
        if (!code || code.length > 40) continue;
        if (next.some((c) => normalizeCode(c) === code)) continue;
        next.push(code);
      }
      return next;
    });
  }, [initialCompanyCodes]);

  const selected = ediType || types[0]?.code || '';
  const isManifestTxt = /MANIFEST_CSDP|CSDP/i.test(selected);

  const addCompanyCode = () => {
    const code = normalizeCode(codeDraft);
    if (!code) {
      setError('Enter a company code.');
      return;
    }
    if (code.length > 40) {
      setError('Company code must be at most 40 characters.');
      return;
    }
    if (companyCodes.some((c) => normalizeCode(c) === code)) {
      setError(`Company code “${code}” is already added.`);
      return;
    }
    setCompanyCodes((prev) => [...prev, code]);
    setCodeDraft('');
    setError(null);
  };

  const removeCompanyCode = (code: string) => {
    setCompanyCodes((prev) => prev.filter((c) => c !== code));
  };

  const runGenerate = async () => {
    if (!selected.trim()) {
      setError('Select an EDI type.');
      return;
    }
    if (isManifestTxt && companyCodes.length === 0) {
      setError('At least one company code is required for MANIFEST_CSDP.');
      return;
    }
    setError(null);
    setMsg(null);
    try {
      const generated = await onGenerate({
        edi_type: selected.trim(),
        ...(isManifestTxt ? { company_codes: companyCodes } : {}),
      });
      onChanged?.();
      const submissionId = pickEdiSubmissionId(generated);
      // Primary demo path: MANIFEST_CSDP → stream official .txt immediately.
      if (submissionId && isManifestTxt) {
        setDownloadingId(submissionId);
        try {
          const raw = await onDownload(submissionId);
          const fileBase =
            pickEdiFileNameFromGenerate(generated, selected) ||
            pickEdiFileNameFromGenerate(raw, selected) ||
            'MENIFIEST.txt';
          await saveEdiDownload(raw, fileBase);
          setMsg(`EDI “${selected.trim()}” generated — downloaded TXT.`);
          return;
        } catch {
          /* fall through — still show generated; user can Download from list */
        } finally {
          setDownloadingId(null);
        }
      }
      setMsg(
        isManifestTxt
          ? `EDI “${selected.trim()}” generated. Download the .txt from submissions.`
          : `EDI “${selected.trim()}” generated.`,
      );
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
      const isTxt =
        row.mime_type?.includes('text/plain') ||
        /\.txt$/i.test(row.file_name || '') ||
        /MANIFEST_CSDP|CSDP/i.test(row.edi_type || '');
      const base =
        row.file_name ||
        (isTxt
          ? `${(row.edi_type || 'MANIFEST').replace(/\s+/g, '_')}.txt`
          : `${(row.edi_type || 'edi').toLowerCase()}-${row.id.slice(0, 8)}`);
      const fileBase = /\.\w+$/i.test(base)
        ? base
        : isTxt
          ? `${base}.txt`
          : row.mime_type?.includes('pdf')
            ? `${base}.pdf`
            : `${base}.pdf`;
      await saveEdiDownload(raw, fileBase);
      setMsg(
        `Downloaded ${row.edi_type || 'EDI'} ${isTxt ? 'TXT' : 'file'}.`,
      );
    } catch (err) {
      const message = getErrorMessage(err);
      setError(
        /failed to fetch|cors|external file url/i.test(message)
          ? 'Download failed. EDI must stream from the API (Bearer text/plain or PDF) — retry or regenerate.'
          : message,
      );
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
                onChange={(e) => {
                  setEdiType(e.target.value);
                  setError(null);
                  setMsg(null);
                }}
              >
                {types.map((t: JobEdiTypeOption) => (
                  <option key={t.code} value={t.code}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </label>

          {isManifestTxt ? (
            <div className="space-y-2 rounded-md bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2.5">
              <p className="text-xs font-medium text-[var(--color-neutral-700)]">
                Company codes <span className="text-[var(--color-danger-500)]">*</span>
              </p>
              <p className="text-[11px] text-[var(--color-neutral-500)]">
                Required for MANIFEST_CSDP. Each code produces a VOY/BOL block in one TXT file.
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[10rem] flex-1">
                  <Input
                    label="Add code"
                    value={codeDraft}
                    placeholder="e.g. 64085L"
                    maxLength={40}
                    onChange={(e) => setCodeDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompanyCode();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={addCompanyCode}
                >
                  Add
                </Button>
              </div>
              {companyCodes.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {companyCodes.map((code) => (
                    <li
                      key={code}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[var(--color-neutral-800)] ring-1 ring-[var(--color-neutral-200)]"
                    >
                      {code}
                      <button
                        type="button"
                        className="rounded-full p-0.5 text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]"
                        aria-label={`Remove ${code}`}
                        onClick={() => removeCompanyCode(code)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] text-[var(--color-neutral-500)]">
                  No company codes added yet.
                </p>
              )}
            </div>
          ) : null}

          <Button
            type="button"
            variant="report"
            leftIcon={<Radio className="h-3.5 w-3.5" />}
            disabled={
              generatePending ||
              !selected.trim() ||
              (isManifestTxt && companyCodes.length === 0)
            }
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
            <div className="overflow-x-auto rounded-sm">
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
