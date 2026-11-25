import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { appType } from '@/lib/erpTypography';
import { CatalogFormatAutoOpen } from '../components/ReportCatalog/CatalogFormatAutoOpen';
import { ReportGeneratePanel } from '../components/ReportCatalog/ReportGeneratePanel';
import { useReportingDashboardCatalog } from '../hooks/useReportingDashboardCatalog';
import { hasFreightnestGeneratePath } from '../utils/generateCatalogLayoutPdf';
import { isClientFlowInvoiceCode } from '../flow/invoiceFlowOptions';
import type { ReportContextIds } from '../utils/reportParameterUtils';

/**
 * One format, on its own screen. Opened from the sample-style index.
 * PDF opens automatically when a client layout / flow path exists — no
 * Import, Bind, Activate, or Generate click required.
 */
export default function ReportFormatPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const catalog = useReportingDashboardCatalog();
  const needle = decodeURIComponent(code).trim().toUpperCase();
  const [searchParams] = useSearchParams();
  const context = useMemo<ReportContextIds>(() => {
    const pick = (key: keyof ReportContextIds) => searchParams.get(key) || undefined;
    return {
      job_id: pick('job_id'),
      quotation_id: pick('quotation_id'),
      invoice_id: pick('invoice_id'),
      party_id: pick('party_id'),
      shipment_id: pick('shipment_id'),
    };
  }, [searchParams]);

  const template = useMemo(
    () => catalog.rows.find((row) => row.code.toUpperCase() === needle)?.template ?? null,
    [catalog.rows, needle],
  );

  const autoOpens = Boolean(
    template &&
      (isClientFlowInvoiceCode(template.code) || hasFreightnestGeneratePath(template.code)),
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <PageBackLink to="/reports/dashboard" label="Back to report formats" />

      {catalog.isLoading && catalog.rows.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading format…</p>
      ) : !template ? (
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-4 py-6">
          <h2 className={appType.pageTitle}>Format not in this list</h2>
          <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
            {needle || 'No format code'} is not available for this organization.
          </p>
        </div>
      ) : (
        <>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>{template.name}</h2>
            <p className="mt-1 font-mono text-xs text-[var(--color-neutral-500)]">{template.code}</p>
            {autoOpens ? (
              <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
                Opening the Freightnest PDF with organization branding
                {context.job_id || context.invoice_id || context.quotation_id
                  ? ' and the linked record'
                  : ''}
                . No pack bind or activate step is required.
              </p>
            ) : null}
          </div>
          <CatalogFormatAutoOpen code={template.code} context={context} />
          <ReportGeneratePanel
            template={template}
            context={context}
            presentation="page"
            discoveryMode
            omitClientPreview
            onClose={() => navigate('/reports/dashboard')}
          />
        </>
      )}
    </div>
  );
}
