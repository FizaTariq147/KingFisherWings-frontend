import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { isApiOriginUrl, openSafeApiOriginUrl } from '@/lib/safeHttpUrl';
import {
  useGenerateReport,
  useReportJob,
  useReportTemplate,
} from '../../hooks/useReportCatalog';
import { reportCatalogService } from '../../services/reportCatalog.service';
import type {
  ReportExportFormat,
  ReportTemplate,
  ReportTemplateParamField,
} from '../../types/reportCatalog.types';
import { REPORT_FAMILY_LABELS } from '../../types/reportCatalog.types';

type ReportGeneratePanelProps = {
  template: ReportTemplate;
  context?: {
    job_id?: string;
    quotation_id?: string;
    invoice_id?: string;
    party_id?: string;
  };
  onClose: () => void;
};

function buildInitialParams(
  fields: ReportTemplateParamField[] | undefined,
  context?: ReportGeneratePanelProps['context'],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of fields ?? []) {
    if (field.default != null && field.default !== '') {
      out[field.name] = String(field.default);
    }
  }
  if (context?.job_id) out.job_id = context.job_id;
  if (context?.quotation_id) out.quotation_id = context.quotation_id;
  if (context?.invoice_id) out.invoice_id = context.invoice_id;
  if (context?.party_id) out.party_id = context.party_id;
  return out;
}

export function ReportGeneratePanel({ template, context, onClose }: ReportGeneratePanelProps) {
  const detail = useReportTemplate(template.id || template.code);
  const resolved = detail.data ?? template;
  const fields = resolved.parameters ?? template.parameters ?? [];
  const formats = resolved.formats?.length ? resolved.formats : (['PDF'] as ReportExportFormat[]);

  const [format, setFormat] = useState<ReportExportFormat>(formats[0] ?? 'PDF');
  const [params, setParams] = useState<Record<string, string>>(() =>
    buildInitialParams(fields, context),
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const generate = useGenerateReport();
  const jobQuery = useReportJob(jobId ?? '', Boolean(jobId));

  useEffect(() => {
    setParams(buildInitialParams(detail.data?.parameters ?? fields, context));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when template detail loads
  }, [detail.data?.id, template.code]);

  useEffect(() => {
    const job = jobQuery.data;
    if (!job || job.status !== 'ready') return;
    void (async () => {
      try {
        if (job.download_url && isApiOriginUrl(job.download_url)) {
          const opened = openSafeApiOriginUrl(job.download_url);
          if (opened) {
            setMessage('Report ready — opened download.');
            return;
          }
        }
        const blob = await reportCatalogService.download(job.id);
        const ext = (job.format ?? format).toLowerCase() === 'pdf' ? 'pdf' : 'bin';
        triggerBlobDownload(blob, `${resolved.code}.${ext}`);
        setMessage('Report downloaded.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Download failed.');
      }
    })();
  }, [jobQuery.data, format, resolved.code]);

  const missingRequired = useMemo(() => {
    return fields.filter((f) => f.required && !String(params[f.name] ?? '').trim());
  }, [fields, params]);

  const onGenerate = async () => {
    setError(null);
    setMessage(null);
    if (missingRequired.length) {
      setError(`Required: ${missingRequired.map((f) => f.label).join(', ')}`);
      return;
    }
    try {
      const parameters: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(params)) {
        if (v.trim() === '') continue;
        parameters[k] = v;
      }
      const job = await generate.mutateAsync({
        template_id: resolved.id,
        code: resolved.code,
        format,
        parameters,
        context,
      });
      setJobId(job.id);
      if (job.status === 'ready') {
        setMessage('Report ready.');
      } else {
        setMessage(`Job ${job.status}…`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generate failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{resolved.name}</h3>
          <p className="mt-1 font-mono text-[11px] text-[var(--color-neutral-400)]">{resolved.code}</p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {REPORT_FAMILY_LABELS[resolved.family]} · {resolved.formats.join(' / ')}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      {resolved.description ? (
        <p className="text-sm text-[var(--color-neutral-600)]">{resolved.description}</p>
      ) : null}

      {resolved.existingPath ? (
        <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-600)]">
          Related screen already exists at{' '}
          <a className="font-medium text-[var(--color-primary-600)] underline" href={resolved.existingPath}>
            {resolved.existingPath}
          </a>
          . Catalog generate is additive and does not replace that screen or default document PDFs.
        </p>
      ) : null}

      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--color-neutral-500)]" htmlFor="report-format">
          Format
        </label>
        <select
          id="report-format"
          className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
          value={format}
          onChange={(e) => setFormat(e.target.value as ReportExportFormat)}
        >
          {formats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {fields.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1">
              {field.type === 'select' && field.options?.length ? (
                <>
                  <label className="text-xs font-medium text-[var(--color-neutral-500)]" htmlFor={field.name}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  <select
                    id={field.name}
                    className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
                    value={params[field.name] ?? ''}
                    onChange={(e) => setParams((p) => ({ ...p, [field.name]: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <Input
                  id={field.name}
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={params[field.name] ?? ''}
                  onChange={(e) => setParams((p) => ({ ...p, [field.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-neutral-500)]">
          No parameter schema from API yet — using context IDs when provided. Backend should return
          parameter fields on GET /reports/templates/:id.
        </p>
      )}

      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
      {jobQuery.data?.status === 'failed' ? (
        <p className="text-sm text-[var(--color-danger-600)]">
          {jobQuery.data.error || 'Report job failed.'}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={generate.isPending || jobQuery.data?.status === 'running'}
          onClick={() => void onGenerate()}
        >
          {generate.isPending || jobQuery.data?.status === 'queued' || jobQuery.data?.status === 'running'
            ? 'Generating…'
            : 'Generate'}
        </Button>
      </div>
    </div>
  );
}
