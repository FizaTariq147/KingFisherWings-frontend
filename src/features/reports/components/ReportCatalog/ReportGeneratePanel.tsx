import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { isApiOriginUrl } from '@/lib/safeHttpUrl';
import { getOperationsReportByFormatCode } from '@/features/operations/config/operationsReports';
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
import { resolveCatalogContextPdfData } from '../../utils/resolveCatalogContextPdfData';
import {
  generateCatalogLayoutPdf,
  hasCatalogLayoutPdf,
} from '../../utils/generateCatalogLayoutPdf';
import { suggestReportPackKey } from '../../utils/suggestReportPackKey';
import {
  buildInitialReportParams,
  coerceReportParameters,
  downloadExtensionForFormat,
  hasReportEntityContext,
  mergeReportContextIds,
  type ReportContextIds,
} from '../../utils/reportParameterUtils';
import { allowClientLayoutGenerate } from '../../utils/clientLayoutFallback';
import { isReportPackReady } from '../../utils/reportPackGenerate';
import { resolveReportOrgChrome } from '../../utils/resolveReportOrgChrome';
import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import { isInvoiceReportFormatCode } from '../../types/invoiceFormatPreview.types';
import { InvoiceFormatAutoPdf } from './InvoiceFormatAutoPdf';
import { ReportParameterForm } from './ReportParameterForm';
import { invoiceService } from '@/features/invoices/services/invoice.service';

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
      (['job_id', 'quotation_id', 'invoice_id', 'party_id', 'shipment_id'] as const).filter(
        (k) => Boolean(context?.[k]),
      ),
    [context],
  );

  const suggestedPack = useMemo(
    () => suggestReportPackKey(resolved.code, resolved.family, packOptions),
    [resolved.code, resolved.family, packOptions],
  );

  useEffect(() => {
    // MY REPORTS / ops lists prefer XLSX when the template supports it.
    const preferred =
      resolved.family === 'ops_list' && formats.includes('XLSX')
        ? 'XLSX'
        : formats.includes('PDF')
          ? 'PDF'
          : (formats[0] ?? 'PDF');
    setFormat(preferred as ReportExportFormat);
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
    resolved.family,
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

    const hasLayout = hasCatalogLayoutPdf(resolved.code);
    const contextIds = mergeReportContextIds(context, params);
    const entityBound = hasReportEntityContext(contextIds);
    const packReady = isReportPackReady(resolved);

    const { parameters, error: coerceError } = coerceReportParameters(fields, params);
    if (coerceError && !hasLayout) {
      setError(coerceError);
      return;
    }

    const runLiveGenerate = async (templateForGenerate: ReportTemplate) => {
      const job = await generate.mutateAsync({
        template_id: isUuid(templateForGenerate.id) ? templateForGenerate.id : undefined,
        code: templateForGenerate.code,
        format,
        parameters:
          !coerceError && Object.keys(parameters).length ? parameters : undefined,
        context: entityBound ? contextIds : context,
      });
      handledReadyJobId.current = null;
      setPdfReadyOpen(false);
      setPdfReadyBlob(null);
      setPdfReadyUrl(null);
      setJobId(job.id);
      setMessage(
        entityBound
          ? `Generating Fresa-parity pack with this record's data… (${job.status})`
          : job.status === 'ready'
            ? 'Report ready.'
            : `Job ${job.status}…`,
      );
    };

    const runClientSamplePdf = async () => {
      setClientGenerating(true);
      try {
        // Empty / partial data keeps layout JSON `demo` (Fresa sample dummy fields).
        // Entity-bound overlays live values via mergeInvoiceFormatDemo.
        let data = await resolveCatalogContextPdfData(contextIds, {
          formatCode: resolved.code,
        });
        const orgChrome = await resolveReportOrgChrome();
        data = {
          ...data,
          companyName: data.companyName || orgChrome.company,
          companyAddress: data.companyAddress || orgChrome.address,
          companyWeb: data.companyWeb || orgChrome.web,
          companyPhone: data.companyPhone || orgChrome.phone,
          companyEmail: data.companyEmail || orgChrome.email,
        };

        if (isInvoiceFormatPdf) {
          const invoiceId = contextIds.invoice_id;
          if (invoiceId && isUuid(invoiceId)) {
            try {
              const invoice = await invoiceService.getById(invoiceId);
              data = { ...invoiceRecordToFormatPdfData(invoice), ...data, entityBound: true };
            } catch {
              /* keep demo */
            }
          }
          const preview = getInvoiceFormatPreview(resolved.code);
          if (preview) {
            const blob = await generateInvoiceFormatLayoutPdf(preview, data, {
              chrome: orgChrome,
              logoUrl: orgChrome.logoUrl,
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
              entityBound
                ? 'Report PDF ready (Fresa layout + registered company branding, live record data).'
                : 'Sample report ready — Fresa layout/colors/footer with registered company name/logo and sample data.',
            );
            return;
          }
        }

        const generated = await generateCatalogLayoutPdf(resolved.code, data, {
          logoUrl: orgChrome.logoUrl,
          hblMode: entityBound ? 'classic' : 'sample',
        });
        if (!generated) {
          setError('No Fresa sample layout registered for this format code.');
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
          entityBound
            ? 'Report PDF ready (HBL classic family / Fresa layout + live record data). Pack preferred when bound.'
            : generated.preview.samplePdfUrl
              ? 'Official Fresa HBL sample PDF ready (org branding stamped). Distinct per catalogue format.'
              : 'Sample report ready — Fresa layout/colors/footer with registered company name/logo and sample data.',
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not generate sample PDF.');
      } finally {
        setClientGenerating(false);
      }
    };

    // Default: Fresa-sample client PDF with dummy data (+ KF logo).
    // Entity + ready pack: use backend Fresa-parity pack instead.
    const preferClientSample =
      format === 'PDF' &&
      (isInvoiceFormatPdf || hasLayout) &&
      allowClientLayoutGenerate({
        packReady,
        templateActive: resolved.is_active,
        entityBound,
      });

    if (preferClientSample && (!entityBound || !packReady)) {
      await runClientSamplePdf();
      return;
    }

    if (!detailFailed) {
      let working: ReportTemplate = resolved;
      try {
        if (!isReportPackReady(working)) {
          const packKey =
            selectedPack.trim() ||
            suggestReportPackKey(working.code, working.family, packOptions) ||
            '';
          if (packKey) {
            setMessage(`Binding Fresa pack ${packKey}…`);
            try {
              working = await bindRenderer.mutateAsync({
                code: working.code,
                dto: { renderer_key: packKey, activate: true },
              });
              onTemplateUpdated?.(working);
            } catch {
              working = await activate.mutateAsync({
                template: working,
                renderer_key: packKey,
              });
              onTemplateUpdated?.(working);
            }
          }
        }
        if (isReportPackReady(working)) {
          await runLiveGenerate(working);
          return;
        }
      } catch (err) {
        if (preferClientSample) {
          await runClientSamplePdf();
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Generate failed. Open a sample layout or bind a Fresa pack.',
        );
        return;
      }
    }

    if (preferClientSample) {
      await runClientSamplePdf();
      return;
    }

    if (detailFailed) {
      setError(
        hasLayout
          ? 'Backend template missing — use Import registry, or Generate still opens the Fresa sample layout with dummy data when client layouts are enabled.'
          : 'Template is not on the backend yet. Import registry first.',
      );
      return;
    }
    setError(
      'No Fresa sample layout and no active pack for this format. Import registry / bind pack, then retry.',
    );
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

  const packReadyForGenerate = isReportPackReady(resolved);
  const entityBoundForUi = hasReportEntityContext(mergeReportContextIds(context, params));
  const canClientLayoutPdf =
    format === 'PDF' &&
    (isInvoiceReportFormatCode(resolved.code) || hasCatalogLayoutPdf(resolved.code)) &&
    allowClientLayoutGenerate({
      packReady: packReadyForGenerate,
      templateActive: resolved.is_active,
      entityBound: entityBoundForUi,
    });
  const generateBlocked =
    busy ||
    detail.isLoading ||
    (!packReadyForGenerate && !canClientLayoutPdf);

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

      {isInvoiceFormat &&
      !omitClientPreview &&
      allowClientLayoutGenerate({
        packReady: packReadyForGenerate,
        templateActive: resolved.is_active,
        entityBound: entityBoundForUi,
      }) ? (
        <InvoiceFormatAutoPdf
          code={resolved.code}
          invoiceId={context?.invoice_id}
          context={context}
        />
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
            ? ' Generate still opens the Fresa-sample PDF (dummy data + KingFisher logo).'
            : ''}
        </div>
      ) : null}

      {!detailFailed && needsPackBind ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          {canClientLayoutPdf
            ? entityBoundForUi
              ? 'Live pack not bound yet — Generate uses Fresa sample chrome with your record overlaid when possible. Bind + Activate a pack for full Fresa-parity print.'
              : 'Generate opens the Fresa sample format (same colors/header/footer as fresatechnologies.com/sample-report-formats) with KingFisher logo and dummy data.'
            : 'Format not enabled for print yet. Bind a Puppeteer pack, then Activate to enable Generate (KingFisher logo branding on packs).'}
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
          Fresa-sample layout PDF is available via Generate (sample data + registered company
          name/logo). Binding a Puppeteer pack remains optional for live backend print — default
          invoice/quotation PDFs stay unchanged.
        </div>
      ) : null}

      {resolved.gapStatus === 'covered_analytics' ? (
        <div
          role="status"
          className="rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-950"
        >
          This is a live analytics / list report — open the module hub below. No fake document
          layout is invented for KPI screens.
        </div>
      ) : null}

      {(() => {
        const opsLive = getOperationsReportByFormatCode(resolved.code);
        const hubPath = opsLive?.path || resolved.existingPath;
        if (!hubPath) return null;
        const isAppPath = hubPath.startsWith('/');
        return (
          <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-600)]">
            {resolved.gapStatus === 'covered_analytics'
              ? 'Live analytics screen (primary): '
              : 'Related screen: '}
            {isAppPath ? (
              <Link
                to={hubPath}
                className="font-medium text-[var(--color-primary-700)] underline underline-offset-2 hover:text-[var(--color-primary-900)]"
              >
                {opsLive?.title || hubPath}
              </Link>
            ) : (
              <span className="font-medium text-[var(--color-neutral-800)]">{hubPath}</span>
            )}
            {resolved.gapStatus === 'covered_analytics'
              ? ' — catalogue Generate does not replace this screen.'
              : null}
          </p>
        );
      })()}

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
            : canClientLayoutPdf && (!entityBoundForUi || !packReadyForGenerate)
              ? 'Generate sample PDF'
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
