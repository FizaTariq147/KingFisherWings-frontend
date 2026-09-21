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
  generateInvoiceFormatLayoutPdf,
  invoiceRecordToFormatPdfData,
} from '../../utils/generateInvoiceFormatLayoutPdf';
import {
  generateCatalogLayoutPdf,
  hasCatalogLayoutPdf,
} from '../../utils/generateCatalogLayoutPdf';
import { suggestReportPackKey } from '../../utils/suggestReportPackKey';
import {
  buildInitialReportParams,
  coerceReportParameters,
  downloadExtensionForFormat,
  type ReportContextIds,
} from '../../utils/reportParameterUtils';
import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import { isInvoiceReportFormatCode } from '../../types/invoiceFormatPreview.types';
import { InvoiceFormatAutoPdf } from './InvoiceFormatAutoPdf';
import { ReportParameterForm } from './ReportParameterForm';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import logoUrl from '@/assets/logo.png';

type ReportGeneratePanelProps = {
  template: ReportTemplate;
  context?: ReportContextIds;
  onClose: () => void;
  discoveryMode?: boolean;
  onTemplateUpdated?: (template: ReportTemplate) => void;
  /** Controlled pack selection (persisted in URL). */
  selectedPack?: string;
  onSelectedPackChange?: (pack: string) => void;
  /**
   * When true, skip embedding InvoiceFormatAutoPdf (catalog page already shows it).
   * Bind / activate / generate still run for live `/reports/*` PDFs.
   */
  omitClientPreview?: boolean;
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
  omitClientPreview = false,
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
  const [clientGenerating, setClientGenerating] = useState(false);
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

  const suggestedPack = useMemo(
    () => suggestReportPackKey(resolved.code, resolved.family, packOptions),
    [resolved.code, resolved.family, packOptions],
  );

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
    setPackLocal(ready || suggestedPack || '');
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
    suggestedPack,
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
    if (suggestedPack) {
      onSelectedPackChange?.(suggestedPack);
    }
  }, [resolved.renderer_key, selectedPackProp, onSelectedPackChange, suggestedPack]);

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

  const isInvoiceFormatPdf =
    isInvoiceReportFormatCode(resolved.code) && format === 'PDF';

  const onGenerate = async () => {
    setError(null);
    setMessage(null);

    const canLiveGenerate = !detailFailed && resolved.is_active;
    const hasLayout = hasCatalogLayoutPdf(resolved.code);

    // Prefer POST /reports/generate when pack is bound + active (additive FRESA path).
    // Client layout PDF is preview fallback only — never POST /invoices/:id/pdf
    // or POST /quotations/:id/pdf (see documentPdfPreserve.ts).
    if (!canLiveGenerate && format === 'PDF' && (isInvoiceFormatPdf || hasLayout)) {
      setClientGenerating(true);
      try {
        let data = {};
        if (isInvoiceFormatPdf) {
          const invoiceId =
            (params.invoice_id || context?.invoice_id || '').trim() || undefined;
          if (invoiceId && isUuid(invoiceId)) {
            try {
              const invoice = await invoiceService.getById(invoiceId);
              data = invoiceRecordToFormatPdfData(invoice);
            } catch {
              // Keep demo data if invoice fetch fails — still show layout PDF.
            }
            try {
              const payload = await invoiceService.getFormatPayload(invoiceId, resolved.code);
              if (payload) data = { ...data, ...payload };
            } catch {
              /* optional enrich */
            }
          }
          const preview = getInvoiceFormatPreview(resolved.code);
          if (preview) {
            const blob = await generateInvoiceFormatLayoutPdf(preview, data, {
              logoUrl: typeof logoUrl === 'string' ? logoUrl : undefined,
            });
            const fileName = formatPdfFilename(
              `Format-${preview.formatNumber}-${resolved.code}`,
              'invoice-format',
            );
            setPdfReadyName(fileName);
            setPdfReadyBlob(blob);
            setPdfReadyUrl(null);
            setPdfReadyOpen(true);
            setJobId(null);
            setMessage(
              'Layout preview PDF ready (client). Bind + Activate for live backend PDF.',
            );
            return;
          }
        }

        const generated = await generateCatalogLayoutPdf(resolved.code, data);
        if (!generated) {
          setError(
            detailFailed
              ? 'Template is not on the backend yet. Import registry first, or open the layout preview above.'
              : 'No KingFisher layout PDF for this code. Bind a pack and Activate for live PDF.',
          );
          return;
        }
        const fileName = formatPdfFilename(
          `Format-${generated.preview.formatNumber || 'X'}-${resolved.code}`,
          'report-format',
        );
        setPdfReadyName(fileName);
        setPdfReadyBlob(generated.blob);
        setPdfReadyUrl(null);
        setPdfReadyOpen(true);
        setJobId(null);
        setMessage(
          'Layout preview PDF ready (client). Bind + Activate for live backend PDF.',
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not generate layout PDF.');
      } finally {
        setClientGenerating(false);
      }
      return;
    }

    if (detailFailed) {
      setError('Template is not on the backend yet. Import registry first.');
      return;
    }
    if (!resolved.is_active) {
      setError(
        hasLayout
          ? 'Template is inactive for live generate. Use Generate for layout preview PDF, or Bind + Activate for live backend PDF.'
          : 'Template is inactive. Bind a Puppeteer pack and Activate first.',
      );
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
    clientGenerating ||
    jobQuery.data?.status === 'queued' ||
    jobQuery.data?.status === 'running';

  const canClientLayoutPdf =
    format === 'PDF' &&
    (isInvoiceReportFormatCode(resolved.code) || hasCatalogLayoutPdf(resolved.code));
  const generateBlocked =
    busy ||
    detail.isLoading ||
    (!canClientLayoutPdf && (detailFailed || !resolved.is_active));

  const rendererStatus = reportRendererStatus(resolved);
  const activateLikely = canActivateReportTemplate(resolved);
  const needsPackBind = !detailFailed && rendererStatus !== 'ready';
  const canDeactivate = resolved.is_active && Boolean(detail.data || !discoveryMode);
  const isInvoiceFormat = isInvoiceReportFormatCode(resolved.code);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{resolved.name}</h3>
          <p className="mt-1 font-mono text-[11px] text-[var(--color-neutral-400)]">{resolved.code}</p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {reportFamilyLabel(resolved.family)} · {formats.join(' / ')}
            {resolved.is_active ? ' · active' : ' · inactive'}
            {isInvoiceFormat
              ? ` · Format-${getInvoiceFormatPreview(resolved.code)?.formatNumber ?? '—'}`
              : ''}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      {isInvoiceFormat && !omitClientPreview ? (
        <InvoiceFormatAutoPdf code={resolved.code} invoiceId={context?.invoice_id} />
      ) : null}

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
          {canClientLayoutPdf
            ? ' Generate still opens the KingFisher layout preview PDF.'
            : ''}
        </div>
      ) : null}

      {!detailFailed && needsPackBind ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          {canClientLayoutPdf
            ? resolved.gapStatus === 'covered_document_pdf'
              ? 'Client layout PDF is available via Generate. Bind a Puppeteer pack + Activate only if you need live backend print parity (default invoice/quotation PDFs stay unchanged).'
              : 'Layout preview PDF is available via Generate. Bind a Puppeteer pack + Activate for live backend PDF (default invoice/quotation PDFs stay unchanged).'
            : 'Bind a Puppeteer pack, then Activate to enable Generate.'}
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

      {!detailFailed ? (
        <div className="space-y-1">
          <label
            className="text-xs font-medium text-[var(--color-neutral-500)]"
            htmlFor="report-renderer-pack"
          >
            Puppeteer pack
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
        </div>
      ) : null}

      {resolved.gapStatus === 'covered_document_pdf' && canClientLayoutPdf ? (
        <div
          role="status"
          className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
        >
          Client layout PDF is available via Generate (FE coverage). Binding a Puppeteer pack
          remains optional for live backend print parity — default invoice/quotation PDFs stay
          unchanged.
        </div>
      ) : null}

      {resolved.existingPath ? (
        <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-600)]">
          {resolved.gapStatus === 'covered_analytics'
            ? 'Live analytics screen (primary): '
            : 'Related screen: '}
          <span className="font-medium text-[var(--color-neutral-800)]">
            {resolved.existingPath}
          </span>
          {resolved.gapStatus === 'covered_analytics'
            ? ' — catalogue layout PDF remains additive and does not replace this screen.'
            : null}
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
          disabled={
            detail.isLoading ||
            (!canClientLayoutPdf && (detailFailed || !resolved.is_active))
          }
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
            ? `Using locked context (${lockedContextKeys.join(', ')}).`
            : 'No extra parameters.'}
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
          disabled={generateBlocked}
          onClick={() => void onGenerate()}
        >
          {busy && (generate.isPending || clientGenerating)
            ? 'Generating…'
            : !resolved.is_active && canClientLayoutPdf
              ? 'Generate layout PDF'
              : 'Generate'}
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
        description="Preview or download."
      />
    </div>
  );
}
