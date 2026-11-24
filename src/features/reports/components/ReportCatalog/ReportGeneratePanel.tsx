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
import { overlayHtmlPilotPayload } from '../../utils/htmlPilotPayload';
import {
  generateCatalogLayoutPdf,
  hasCatalogLayoutPdf,
} from '../../utils/generateCatalogLayoutPdf';
import { isReferenceAccuratePdfCode } from '../../templates/referenceAccurate';
import { isHtmlCssPilotCode } from '../../engines/pdf/playwrightHtml/playwrightHtmlCodes';
import {
  ACTIVITY_COMPLETED_JOBS_CODE,
  ACTIVITY_COMPLETED_JOBS_HEADERS,
  generateActivityCompletedJobsWorkbook,
} from '../../templates/referenceAccurate/activityCompletedJobsWorkbook';
import { jobService } from '@/features/jobs/services/job.service';
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
import { buildFresaPackGenerateParams } from '../../utils/fresaPackGenerateParams';
import { hasOfficialSamplePdf } from '../../utils/preferOfficialSamplePdf';
import { FRESA_REFERENCE_SAMPLE_LABEL } from '../../utils/reportPdfWorkflow';
import { isReportPackReady } from '../../utils/reportPackGenerate';
import { resolveCatalogFormatStatus, catalogPreviewSourceLabel } from '../../utils/catalogFormatStatus';
import { getSharedLayoutSource } from '../../data/sharedLayoutSource';
import { FormatStatusBadge } from './FormatStatusBadge';
import { resolveReportOrgChrome } from '../../utils/resolveReportOrgChrome';
import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import { isInvoiceReportFormatCode } from '../../types/invoiceFormatPreview.types';
import { InvoiceFormatAutoPdf } from './InvoiceFormatAutoPdf';
import { ReportParameterForm } from './ReportParameterForm';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { reportsCatalogueGate, reportsEngine } from '../../engine/reportsEngine';
import { FORMAT_NOT_AVAILABLE_YET, reportsCodeGenerateBlocked, shouldUseInvoiceV2 } from '../../engine/invoiceV2Gate';
import { reportConformanceStatus } from '../../utils/reportConformanceStatus';
import { invoiceV2SpecCodes } from '../../engine/invoiceV2Codes';
import { InvoiceV2Preview } from './InvoiceV2Preview';

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

function printActivitySheet(headers: readonly string[], rows: string[][]): void {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const head = headers.map((header) => `<th>${escape(header)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join('')}</tr>`)
    .join('');
  const html = `<!doctype html><html><head><title>Activity completed jobs</title><style>
    @page { size: landscape; margin: 12mm; }
    body { font-family: Calibri, Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #999; padding: 4px 6px; font-size: 11px; }
    th { background: #d9e2f3; }
  </style></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  const frame = document.createElement('iframe');
  frame.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0');
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  window.setTimeout(() => frame.remove(), 1000);
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
  const [sheetPreview, setSheetPreview] = useState<string[][] | null>(null);
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

    if (format === 'XLSX' && resolved.code === ACTIVITY_COMPLETED_JOBS_CODE) {
      setClientGenerating(true);
      try {
        const jobId = contextIds.job_id;
        const rows = [];
        if (jobId && isUuid(jobId)) {
          const job = await jobService.getById(jobId);
          rows.push({
            jobNumber: job.job_number,
            department: job.department_name || job.job_type,
            por: job.origin_port_code,
            pod: job.dest_port_code,
            pieces: job.pieces,
            grossWeight: job.gross_weight,
            volume: job.volume_cbm,
          });
        }
        const workbook = generateActivityCompletedJobsWorkbook(rows);
        const previewRows = rows.map((row) => [
          row.jobNumber || '',
          row.department || '',
          row.por || '',
          row.pod || '',
          row.pieces != null ? String(row.pieces) : '',
          row.grossWeight != null ? String(row.grossWeight) : '',
          row.volume != null ? String(row.volume) : '',
        ]);
        setSheetPreview(previewRows);
        const blob = new Blob([workbook.bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        setPdfReadyName(workbook.fileName.endsWith('.xlsx') ? workbook.fileName : `${workbook.fileName}.xlsx`);
        setPdfReadyBlob(blob);
        setPdfReadyUrl(null);
        setPdfReadyOpen(true);
        setMessage(
          rows.length
            ? 'Workbook ready. Headers match the reference. The open job is the only row.'
            : 'Workbook ready. Headers match the reference. No job was selected, so there are no data rows.',
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not build the workbook.');
      } finally {
        setClientGenerating(false);
      }
      return;
    }

    const { parameters, error: coerceError } = coerceReportParameters(fields, params);
    if (coerceError && !hasLayout) {
      setError(coerceError);
      return;
    }

    const runLiveGenerate = async (templateForGenerate: ReportTemplate) => {
      const packHints = buildFresaPackGenerateParams(templateForGenerate.code);
      const mergedParameters = {
        ...packHints,
        ...(!coerceError ? parameters : {}),
      };
      const job = await generate.mutateAsync({
        template_id: isUuid(templateForGenerate.id) ? templateForGenerate.id : undefined,
        code: templateForGenerate.code,
        format,
        parameters: Object.keys(mergedParameters).length ? mergedParameters : undefined,
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
            ? 'Report ready (backend pack).'
            : `Pack job ${job.status}…`,
      );
    };

    const runClientSamplePdf = async () => {
      setClientGenerating(true);
      try {
        // Open job / invoice / quotation fills the document. A backend preview
        // payload may add fields, and it does not wipe values already on the record.
        const orgChrome = await resolveReportOrgChrome();
        let data = await resolveCatalogContextPdfData(contextIds, {
          formatCode: resolved.code,
        });
        if (isHtmlCssPilotCode(resolved.code)) {
          const preview = await reportCatalogService.previewHtmlPilot(resolved.code, {
            context: entityBound ? contextIds : undefined,
            parameters: !coerceError ? parameters : undefined,
          });
          if (preview.available) {
            data = entityBound ? overlayHtmlPilotPayload(data, preview.data) : preview.data;
          }
        }
        data = {
          ...data,
          companyName: data.companyName || orgChrome.company,
          companyAddress: data.companyAddress || orgChrome.address,
          companyWeb: data.companyWeb || orgChrome.web,
          companyPhone: data.companyPhone || orgChrome.phone,
          companyEmail: data.companyEmail || orgChrome.email,
          logoUrl: data.logoUrl || orgChrome.logoUrl,
        };

        if (isInvoiceFormatPdf && !isReferenceAccuratePdfCode(resolved.code)) {
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
                ? 'Freightnest invoice PDF ready (registered organization branding + live record data).'
                : 'Freightnest invoice PDF ready (registered organization branding).',
            );
            return;
          }
        }

        // Phase 3: Generate never uses Fresa sample PDFs as the final document.
        const generated = await generateCatalogLayoutPdf(resolved.code, data, {
          logoUrl: orgChrome.logoUrl,
          purpose: 'generate',
          workflow: 'freightnest_generate',
          hblMode: 'classic',
          preferHawbOfficial: true,
        });
        if (!generated) {
          setError(
            'No Freightnest generate path for this format (native / template-v2 / JSON). Browse the official Fresa reference sample separately if needed.',
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
          entityBound
            ? 'Freightnest report ready (registered organization branding + live record data).'
            : 'Freightnest report ready (registered organization branding). Official Fresa PDFs remain browse-only references.',
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not generate sample PDF.');
      } finally {
        setClientGenerating(false);
      }
    };

    // Phase 3: Generate never short-circuits to Fresa sample PDFs.
    // Official samples remain available via catalogue browse (reference only).

    // Product path: backend pack when ready (or bindable). Client shells only if pack unavailable.
    let workingPackReady = packReady;
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
        workingPackReady = isReportPackReady(working);
        if (workingPackReady) {
          await runLiveGenerate(working);
          return;
        }
      } catch (err) {
        const canClient = allowClientLayoutGenerate({
          packReady: false,
          templateActive: resolved.is_active,
          entityBound,
          hasOfficialSample: hasOfficialSamplePdf(resolved.code),
        });
        if (canClient && format === 'PDF' && (isInvoiceFormatPdf || hasLayout)) {
          await runClientSamplePdf();
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Generate failed. Bind a Fresa pack on the backend, then retry.',
        );
        return;
      }
    }

    const preferClientSample =
      format === 'PDF' &&
      (isInvoiceFormatPdf || hasLayout) &&
      allowClientLayoutGenerate({
        packReady: workingPackReady,
        templateActive: resolved.is_active,
        entityBound,
        hasOfficialSample: hasOfficialSamplePdf(resolved.code),
      });

    if (preferClientSample) {
      await runClientSamplePdf();
      return;
    }

    if (detailFailed) {
      setError(
        hasLayout
          ? 'Backend template missing — Import registry, or wait for sea.hbl_draft|original / air.hawb_draft|final. Client sample is disabled while a pack is ready.'
          : 'Template is not on the backend yet. Import registry first.',
      );
      return;
    }
    setError(
      workingPackReady
        ? 'Pack is ready but generate did not start. Retry or check /reports/generate.'
        : 'No active Fresa pack for this format yet (backend). Many codes share one shell — bind sea.hbl_draft / air.hawb_draft|final when available, or use sample browse / client fallback.',
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
  const officialSampleForUi = hasOfficialSamplePdf(resolved.code);
  const canClientLayoutPdf =
    format === 'PDF' &&
    (isInvoiceReportFormatCode(resolved.code) ||
      hasCatalogLayoutPdf(resolved.code) ||
      officialSampleForUi) &&
    allowClientLayoutGenerate({
      packReady: packReadyForGenerate,
      templateActive: resolved.is_active,
      entityBound: entityBoundForUi,
      hasOfficialSample: officialSampleForUi,
    });
  const v2HardBlocked = reportsCodeGenerateBlocked({
    gate: reportsCatalogueGate(),
    engine: reportsEngine(),
    code: resolved.code,
    status: reportConformanceStatus(resolved.code),
  });
  const generateBlocked =
    busy ||
    detail.isLoading ||
    v2HardBlocked ||
    (!packReadyForGenerate && !canClientLayoutPdf);

  const rendererStatus = reportRendererStatus(resolved);
  const activateLikely = canActivateReportTemplate(resolved);
  const needsPackBind = !detailFailed && rendererStatus !== 'ready';
  const canDeactivate = resolved.is_active && Boolean(detail.data || !discoveryMode);
  const isInvoiceFormat = isInvoiceReportFormatCode(resolved.code);
  const formatStatus = resolveCatalogFormatStatus(resolved.code);
  const sharedLayout = getSharedLayoutSource(resolved.code);
  const previewSource = catalogPreviewSourceLabel({
    entityBound: entityBoundForUi,
    preferOfficialSample: !entityBoundForUi && officialSampleForUi,
    isSharedLayout: Boolean(sharedLayout?.isSharedLayout),
    usingBackendPack: packReadyForGenerate && entityBoundForUi,
    isNativePilot: formatStatus.id === 'native_layout',
  });

  return (
    <div className="space-y-4 rounded-lg border border-[var(--color-neutral-200)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{resolved.name}</h3>
            <FormatStatusBadge status={formatStatus} size="md" />
          </div>
          <p className="font-mono text-[11px] text-[var(--color-neutral-400)]">{resolved.code}</p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            {reportFamilyLabel(resolved.family)} · {formats.join(' / ')}
            {resolved.is_active ? ' · active' : ' · inactive'}
            {isInvoiceFormat
              ? ` · Format-${getInvoiceFormatPreview(resolved.code)?.formatNumber ?? '—'}`
              : ''}
          </p>
          <p className="text-[11px] leading-snug text-[var(--color-neutral-600)]">
            {formatStatus.detail}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      <div
        role="status"
        className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-800)]"
      >
        <span className="font-semibold">Preview / generate path:</span> {previewSource.label}
        {' — '}
        {previewSource.detail}
      </div>

      {v2HardBlocked ? (
        <p className="text-xs font-semibold text-amber-800">{FORMAT_NOT_AVAILABLE_YET}</p>
      ) : null}

      {isInvoiceFormat &&
      invoiceV2SpecCodes.has(resolved.code) &&
      !v2HardBlocked &&
      shouldUseInvoiceV2({
        engine: reportsEngine(),
        entry: 'formats',
        document: 'invoice',
        style: 'classic',
        code: resolved.code,
      }) ? (
        <InvoiceV2Preview code={resolved.code} invoiceId={context?.invoice_id} />
      ) : null}

      {isInvoiceFormat &&
      !omitClientPreview &&
      allowClientLayoutGenerate({
        packReady: packReadyForGenerate,
        templateActive: resolved.is_active,
        entityBound: entityBoundForUi,
        hasOfficialSample: officialSampleForUi,
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
            ? ' Generate uses Freightnest layouts (org branding) — not Fresa sample PDFs.'
            : ''}
        </div>
      ) : null}

      {!detailFailed && officialSampleForUi ? (
        <div
          role="status"
          className="rounded-md border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-3 py-2 text-xs text-[var(--color-primary-950)]"
        >
          {FRESA_REFERENCE_SAMPLE_LABEL}. Catalogue browse may open it for layout comparison.
          Generate / download always use Freightnest native, template-v2, JSON, or a backend pack —
          never a stamped Fresa sample as the final document.
        </div>
      ) : null}

      {!detailFailed && formatStatus.id === 'shared_layout' ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"
        >
          This code reuses a shared layout
          {formatStatus.layoutSourceCode ? ` (${formatStatus.layoutSourceCode})` : ''}. It is not a
          unique visual design — do not treat it as format-specific fidelity.
        </div>
      ) : null}

      {!detailFailed && needsPackBind && !officialSampleForUi ? (
        <div
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          {canClientLayoutPdf
            ? entityBoundForUi
              ? 'Live pack not bound yet — Generate uses Freightnest client layouts with registered organization branding and live record data. Bind + Activate a pack when available.'
              : 'Generate uses Freightnest client layouts with registered organization branding. Official Fresa PDFs are browse-only references.'
            : 'Format not enabled for print yet. Bind a Puppeteer pack, then Activate to enable Generate (organization branding on packs).'}
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
        title={pdfReadyName.endsWith('.xlsx') ? 'Workbook ready' : 'Report PDF ready'}
        fileName={pdfReadyName}
        skipBranding
        description={
          pdfReadyName.endsWith('.xlsx')
            ? 'Download the Excel file. Print preview uses the same rows.'
            : 'Preview or download.'
        }
      />
      {sheetPreview ? (
        <div className="mt-3 overflow-auto rounded border border-[var(--color-neutral-200)]">
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <p className="text-xs text-[var(--color-neutral-600)]">
              Print preview of the activity-completed sheet. Download stays Excel.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => printActivitySheet(ACTIVITY_COMPLETED_JOBS_HEADERS, sheetPreview)}
            >
              Print preview
            </Button>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                {ACTIVITY_COMPLETED_JOBS_HEADERS.map((header) => (
                  <th key={header} className="border-b px-2 py-1">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetPreview.length ? (
                sheetPreview.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-2 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-2 py-2 text-[var(--color-neutral-500)]" colSpan={7}>
                    No job selected. The sheet has the header row only.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
