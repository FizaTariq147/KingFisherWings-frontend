import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { isApiOriginUrl } from '@/lib/safeHttpUrl';
import {
  useActivateReportTemplate,
  useBindReportRenderer,
  useDeactivateReportTemplate,
  useGenerateReport,
  useReportJob,
  useReportRenderers,
  useReportTemplate,
} from '../../hooks/useReportCatalog';
import { reportCatalogService } from '../../services/reportCatalog.service';
import type { ReportExportFormat, ReportTemplate } from '../../types/reportCatalog.types';
import {
  canActivateReportTemplate,
  reportFamilyLabel,
  reportRendererStatus,
} from '../../types/reportCatalog.types';
import { formatReportActivateError } from '../../utils/normalizeReportCatalog';
import {
  buildInitialReportParams,
  coerceReportParameters,
  downloadExtensionForFormat,
  type ReportContextIds,
} from '../../utils/reportParameterUtils';
import { ReportParameterForm } from './ReportParameterForm';

type ReportGeneratePanelProps = {
  template: ReportTemplate;
  context?: ReportContextIds;
  onClose: () => void;
  discoveryMode?: boolean;
  onTemplateUpdated?: (template: ReportTemplate) => void;
  /** Controlled pack selection (persisted in URL). */
  selectedPack?: string;
  onSelectedPackChange?: (pack: string) => void;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

export function ReportGeneratePanel({
  template,
  context,
  onClose,
  discoveryMode = false,
  onTemplateUpdated,
  selectedPack: selectedPackProp,
  onSelectedPackChange,
}: ReportGeneratePanelProps) {
  const detailKey = isUuid(template.id) ? template.id : template.code;
  const detail = useReportTemplate(detailKey, Boolean(detailKey));
  const detailFailed =
    discoveryMode && detail.isError && !detail.isLoading && !detail.data;
  const resolved = detail.data ?? template;
  const fields = resolved.parameters ?? template.parameters ?? [];
  const formats = resolved.formats?.length ? resolved.formats : (['PDF'] as ReportExportFormat[]);

  const renderersQuery = useReportRenderers(!detailFailed);
  const packOptions = renderersQuery.data ?? [];

  const [format, setFormat] = useState<ReportExportFormat>(formats[0] ?? 'PDF');
  const [params, setParams] = useState<Record<string, string>>(() =>
    buildInitialReportParams(fields, context),
  );
  const [packLocal, setPackLocal] = useState('');
  const selectedPack =
    selectedPackProp !== undefined ? selectedPackProp : packLocal;
  const setSelectedPack = (value: string) => {
    if (onSelectedPackChange) onSelectedPackChange(value);
    else setPackLocal(value);
  };
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyUrl, setPdfReadyUrl] = useState<string | null>(null);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);
  const [pdfReadyName, setPdfReadyName] = useState('report.pdf');
  const handledReadyJobId = useRef<string | null>(null);

  const generate = useGenerateReport();
  const bindRenderer = useBindReportRenderer();
  const activate = useActivateReportTemplate();
  const deactivate = useDeactivateReportTemplate();
  const jobQuery = useReportJob(jobId ?? '', Boolean(jobId));

  const lockedContextKeys = useMemo(
    () =>
      (['job_id', 'quotation_id', 'invoice_id', 'party_id'] as const).filter(
        (k) => Boolean(context?.[k]),
      ),
    [context],
  );

  const isCommercialInvoiceFormat =
    resolved.family === 'commercial' &&
    (resolved.contexts?.includes('invoice') ||
      /^INVOICE_REPORT_FORMAT_/i.test(resolved.code) ||
      Boolean(context?.invoice_id));

  const suggestedCommercialPack = useMemo(() => {
    if (!isCommercialInvoiceFormat) return null;
    const match = packOptions.find(
      (opt) =>
        opt.key === 'commercial.invoice_tax_india_1' ||
        /invoice_tax_india_1|invoice.*india/i.test(opt.key),
    );
    return match?.key ?? null;
  }, [isCommercialInvoiceFormat, packOptions]);

  useEffect(() => {
    setFormat((formats[0] ?? 'PDF') as ReportExportFormat);
    setParams(buildInitialReportParams(detail.data?.parameters ?? fields, context));
    setJobId(null);
    setError(null);
    setMessage(null);
    setPdfReadyOpen(false);
    setPdfReadyUrl(null);
    setPdfReadyBlob(null);
    handledReadyJobId.current = null;
    if (selectedPackProp !== undefined) return;
    const current = resolved.renderer_key?.trim() || '';
    const ready =
      current &&
      !/^pending($|[_.-])/i.test(current) &&
      current.toLowerCase() !== 'pending'
        ? current
        : '';
    setPackLocal(ready || suggestedCommercialPack || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when template/detail/context changes
  }, [
    detail.data?.id,
    template.code,
    template.id,
    resolved.renderer_key,
    selectedPackProp,
    context?.invoice_id,
    context?.job_id,
    context?.quotation_id,
    context?.party_id,
    suggestedCommercialPack,
  ]);

  // When URL has no pack yet but template already has a ready key, seed it once.
  useEffect(() => {
    if (selectedPackProp === undefined || selectedPackProp) return;
    const current = resolved.renderer_key?.trim() || '';
    if (
      current &&
      !/^pending($|[_.-])/i.test(current) &&
      current.toLowerCase() !== 'pending'
    ) {
      onSelectedPackChange?.(current);
      return;
    }
    if (suggestedCommercialPack) {
      onSelectedPackChange?.(suggestedCommercialPack);
    }
  }, [resolved.renderer_key, selectedPackProp, onSelectedPackChange, suggestedCommercialPack]);

  // When job is ready: show invoice-style PDF popup (no redirect / window.open).
  useEffect(() => {
    const job = jobQuery.data;
    if (!job || job.status !== 'ready') return;
    if (handledReadyJobId.current === job.id) return;
    handledReadyJobId.current = job.id;

    void (async () => {
      setError(null);
      const ext = downloadExtensionForFormat(job.format ?? format);
      const fileName = formatPdfFilename(resolved.code, 'report').replace(/\.pdf$/i, `.${ext}`);
      setPdfReadyName(fileName);
      setPdfReadyOpen(true);
      setPdfReadyBlob(null);
      setPdfReadyUrl(null);
      setMessage('Report ready.');

      try {
        const blob = await reportCatalogService.download(job.id);
        setPdfReadyBlob(blob);
      } catch {
        const url = job.download_url?.trim();
        if (url && isApiOriginUrl(url)) {
          setPdfReadyUrl(url);
        } else {
          setPdfReadyOpen(false);
          setError('Report ready but download failed.');
        }
      }
    })();
  }, [jobQuery.data, format, resolved.code]);

  const onGenerate = async () => {
    setError(null);
    setMessage(null);
    if (detailFailed) {
      setError('Template is not on the backend yet. Import registry first.');
      return;
    }
    if (!resolved.is_active) {
      setError('Template is inactive. Bind a Puppeteer pack and Activate first.');
      return;
    }
    const { parameters, error: coerceError } = coerceReportParameters(fields, params);
    if (coerceError) {
      setError(coerceError);
      return;
    }
    try {
      const job = await generate.mutateAsync({
        template_id: isUuid(resolved.id) ? resolved.id : undefined,
        code: resolved.code,
        format,
        parameters: Object.keys(parameters).length ? parameters : undefined,
        context,
      });
      handledReadyJobId.current = null;
      setPdfReadyOpen(false);
      setPdfReadyBlob(null);
      setPdfReadyUrl(null);
      setJobId(job.id);
      setMessage(job.status === 'ready' ? 'Report ready.' : `Job ${job.status}…`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generate failed.');
    }
  };

  /** Bind pack + activate in one shot (bind-renderer activate=true). */
  const onBindAndActivate = async () => {
    setError(null);
    setMessage(null);
    const key = selectedPack.trim();
    if (!key) {
      setError('Select a Puppeteer pack from the list (GET /reports/templates/renderers).');
      return;
    }
    if (packOptions.length > 0 && !packOptions.some((opt) => opt.key === key)) {
      setError(
        'Pack must be a key returned by GET /reports/templates/renderers. Exact FRESA PDF look requires that pack on the backend.',
      );
      return;
    }
    try {
      const updated = await bindRenderer.mutateAsync({
        code: resolved.code,
        dto: { renderer_key: key, activate: true },
      });
      onTemplateUpdated?.(updated);
      setMessage(
        updated.is_active
          ? `Bound ${key} and activated ${updated.code}. You can Generate now.`
          : `Bound ${key} to ${updated.code}.`,
      );
    } catch (err) {
      // Fallback: activate with renderer_key in body
      try {
        const updated = await activate.mutateAsync({
          template: resolved,
          renderer_key: key,
        });
        onTemplateUpdated?.(updated);
        setMessage(
          updated.is_active
            ? `Activated ${updated.code} with ${key}. You can Generate now.`
            : `Activate returned for ${updated.code}.`,
        );
      } catch {
        setError(formatReportActivateError(err, resolved.code));
      }
    }
  };

  const onActivateOnly = async () => {
    setError(null);
    setMessage(null);
    try {
      const updated = await activate.mutateAsync({
        template: resolved,
        renderer_key: selectedPack.trim() || undefined,
      });
      onTemplateUpdated?.(updated);
      setMessage(
        updated.is_active
          ? `Activated ${updated.code}. You can Generate now.`
          : `Activate returned for ${updated.code} but it is still inactive.`,
      );
    } catch (err) {
      setError(formatReportActivateError(err, resolved.code));
    }
  };

  const onDeactivate = async () => {
    setError(null);
    setMessage(null);
    try {
      const updated = await deactivate.mutateAsync(resolved.code);
      onTemplateUpdated?.(updated);
      setMessage(`Deactivated ${updated.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deactivate failed.');
    }
  };

  const busy =
    generate.isPending ||
    bindRenderer.isPending ||
    activate.isPending ||
    deactivate.isPending ||
    jobQuery.data?.status === 'queued' ||
    jobQuery.data?.status === 'running';

  const rendererStatus = reportRendererStatus(resolved);
  const activateLikely = canActivateReportTemplate(resolved);
  const needsPackBind = !detailFailed && rendererStatus !== 'ready';
  const canDeactivate = resolved.is_active && Boolean(detail.data || !discoveryMode);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{resolved.name}</h3>
          <p className="mt-1 font-mono text-[11px] text-[var(--color-neutral-400)]">{resolved.code}</p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {reportFamilyLabel(resolved.family)} · {formats.join(' / ')}
            {resolved.is_active ? ' · active' : ' · inactive'}
            {discoveryMode ? ' · discovery' : ''}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {!resolved.is_active ? (
              <span className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] text-[var(--color-neutral-500)]">
                inactive
              </span>
            ) : (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-800">
                active
              </span>
            )}
            {rendererStatus === 'pending' ? (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-900">
                pending pack
              </span>
            ) : null}
            {rendererStatus === 'ready' ? (
              <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-900">
                pack ready — FRESA-like PDF via backend
              </span>
            ) : null}
            {rendererStatus === 'missing' ? (
              <span className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] text-[var(--color-neutral-500)]">
                no pack
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-mono text-[10px] text-[var(--color-neutral-400)]">
            renderer:{' '}
            {rendererStatus === 'missing'
              ? '(not set)'
              : rendererStatus === 'pending'
                ? `${resolved.renderer_key} (pending)`
                : resolved.renderer_key}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      {resolved.description ? (
        <p className="text-sm text-[var(--color-neutral-600)]">{resolved.description}</p>
      ) : null}

      {detail.isLoading ? (
        <p className="text-xs text-[var(--color-neutral-500)]">Loading parameter schema…</p>
      ) : null}

      {detailFailed ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          Template not on API yet. Use <strong>Import registry</strong>, then Live API + Include
          inactive.
        </div>
      ) : null}

      {!detailFailed && needsPackBind ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          PDF layout is <strong>not</strong> built in the frontend. Bind one of the implemented{' '}
          <strong>Puppeteer packs</strong> ({packOptions.length || '…'} keys from{' '}
          <span className="font-mono">GET /reports/templates/renderers</span>), then Activate.
          FRESA visual parity for this format requires a matching pack on the backend.
        </div>
      ) : null}

      {!detailFailed && !resolved.is_active && activateLikely ? (
        <div
          role="status"
          className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
        >
          Pack already bound. Click <strong>Activate</strong> to enable Generate.
        </div>
      ) : null}

      {isCommercialInvoiceFormat && context?.invoice_id ? (
        <div
          role="status"
          className="rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-950"
        >
          Invoice context locked:{' '}
          <span className="font-mono">{context.invoice_id}</span>
          {params.invoice_id ? (
            <>
              {' '}
              · param <span className="font-mono">invoice_id</span> pre-filled
            </>
          ) : null}
          . Layout is a backend Puppeteer pack (Format-1 key{' '}
          <span className="font-mono">commercial.invoice_tax_india_1</span>) — not the default
          invoice PDF button.
        </div>
      ) : null}

      {isCommercialInvoiceFormat && needsPackBind ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          Commercial invoice formats need a matching pack on{' '}
          <span className="font-mono">GET /reports/templates/renderers</span>
          {suggestedCommercialPack
            ? ` (suggested: ${suggestedCommercialPack})`
            : ' (expected: commercial.invoice_tax_india_1 for Format-1)'}. Bind + Activate before
          Generate. GST columns (SAC, SGST/CGST/IGST) come from the backend payload — FE does not
          invent them.
        </div>
      ) : null}

      {!detailFailed ? (
        <div className="space-y-1">
          <label
            className="text-xs font-medium text-[var(--color-neutral-500)]"
            htmlFor="report-renderer-pack"
          >
            Puppeteer pack (renderer_key)
          </label>
          <select
            id="report-renderer-pack"
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 font-mono text-sm"
            value={selectedPack}
            onChange={(e) => setSelectedPack(e.target.value)}
            disabled={renderersQuery.isLoading || packOptions.length === 0}
          >
            <option value="">
              {renderersQuery.isLoading
                ? 'Loading packs…'
                : packOptions.length
                  ? 'Select a pack…'
                  : 'No packs returned from API'}
            </option>
            {packOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
                {opt.description ? ` — ${opt.description}` : ''}
              </option>
            ))}
          </select>
          {renderersQuery.isError ? (
            <p className="text-xs text-[var(--color-danger-600)]">
              Could not load renderers. Restart API so Swagger/routes include{' '}
              <span className="font-mono">/reports/templates/renderers</span>.
            </p>
          ) : null}
        </div>
      ) : null}

      {resolved.existingPath ? (
        <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-600)]">
          Related screen:{' '}
          <a
            className="font-medium text-[var(--color-primary-600)] underline"
            href={resolved.existingPath}
          >
            {resolved.existingPath}
          </a>
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
          disabled={detailFailed || !resolved.is_active}
        >
          {formats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {fields.length > 0 ? (
        <ReportParameterForm
          fields={fields}
          values={params}
          lockedContextKeys={[...lockedContextKeys]}
          onChange={(name, value) => setParams((p) => ({ ...p, [name]: value }))}
        />
      ) : !detail.isLoading && !detailFailed ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          {lockedContextKeys.length
            ? `No extra parameters — using locked context (${lockedContextKeys.join(', ')}).`
            : 'No parameter schema from API — generate will send context IDs only (if any).'}
        </p>
      ) : null}

      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
      {jobQuery.data?.status === 'failed' ? (
        <p className="text-sm text-[var(--color-danger-600)]">
          {jobQuery.data.error || 'Report job failed.'}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {!detailFailed && needsPackBind ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy || !selectedPack || detail.isLoading}
            onClick={() => void onBindAndActivate()}
          >
            {bindRenderer.isPending || activate.isPending
              ? 'Binding…'
              : 'Bind pack + Activate'}
          </Button>
        ) : null}
        {!detailFailed && !resolved.is_active && activateLikely ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy || detail.isLoading}
            onClick={() => void onActivateOnly()}
          >
            {activate.isPending ? 'Activating…' : 'Activate'}
          </Button>
        ) : null}
        {canDeactivate ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy || detail.isLoading}
            onClick={() => void onDeactivate()}
          >
            {deactivate.isPending ? 'Deactivating…' : 'Deactivate'}
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={busy || detailFailed || detail.isLoading || !resolved.is_active}
          onClick={() => void onGenerate()}
        >
          {busy && generate.isPending ? 'Generating…' : 'Generate'}
        </Button>
      </div>

      <PdfReadyModal
        open={pdfReadyOpen}
        onClose={() => {
          setPdfReadyOpen(false);
          setPdfReadyBlob(null);
          setPdfReadyUrl(null);
        }}
        blob={pdfReadyBlob}
        url={pdfReadyBlob ? null : pdfReadyUrl}
        title="Report PDF ready"
        fileName={pdfReadyName}
        skipBranding
        description="Your report PDF was created successfully. Preview or download — no page redirect."
      />
    </div>
  );
}
