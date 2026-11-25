import { useEffect, useRef, useState } from 'react';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { getHblFormatSpec } from '../../constants/hblFormatCatalog';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  catalogContextCacheKey,
  resolveCatalogContextPdfData,
} from '../../utils/resolveCatalogContextPdfData';
import { generateHblFamilyClassicPdf } from '@/features/shared/bl-draft/generateHblFamilyClassicPdf';
import { resolveReportOrgChrome } from '../../utils/resolveReportOrgChrome';
import {
  generateHblJasperPilotPdf,
  HblJasperPilotPreview,
  isHblJasperPilotCode,
} from '../../templates/hbl/jasperPilot';
import { catalogPreviewSourceLabel } from '../../utils/catalogFormatStatus';
import { getSharedLayoutSource } from '../../data/sharedLayoutSource';
import { FRESA_REFERENCE_SAMPLE_LABEL } from '../../utils/reportPdfWorkflow';
import { generateCatalogLayoutPdf } from '../../utils/generateCatalogLayoutPdf';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * HBL catalogue preview (Phase 3).
 * Always Freightnest classic / native / Jasper — never a Fresa CDN sample PDF.
 */
export function HblFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getHblFormatSpec(code);
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const [boundLabel, setBoundLabel] = useState<string | null>(null);
  const [pilotData, setPilotData] = useState<Awaited<
    ReturnType<typeof resolveCatalogContextPdfData>
  > | null>(null);
  const [pilotLoading, setPilotLoading] = useState(false);
  const openedFor = useRef<string | null>(null);
  const contextKey = catalogContextCacheKey(context);
  const isJasperPilot = isHblJasperPilotCode(code);

  useEffect(() => {
    if (!autoOpen || !spec) return;

    let cancelled = false;

    if (isJasperPilot) {
      void (async () => {
        if (!cancelled) {
          setError(null);
          setPilotLoading(true);
        }
        try {
          const [data, orgChrome] = await Promise.all([
            resolveCatalogContextPdfData(context, { formatCode: spec.code }),
            resolveReportOrgChrome(),
          ]);
          if (cancelled) return;
          const merged = {
            ...data,
            companyName: data.companyName || orgChrome.company,
            companyAddress: data.companyAddress || orgChrome.address,
            companyWeb: data.companyWeb || orgChrome.web,
            companyPhone: data.companyPhone || orgChrome.phone,
            companyEmail: data.companyEmail || orgChrome.email,
            logoUrl: data.logoUrl || orgChrome.logoUrl,
          };
          setPilotData(merged);
          {
            const source = catalogPreviewSourceLabel({
              entityBound: data.entityBound,
              isNativePilot: true,
            });
            const record =
              data.jobNumber || data.shipmentNumber || data.referenceNo || null;
            setBoundLabel(
              data.entityBound
                ? `${source.label} · bound to ${record || 'live record'}`
                : `${source.label} · A4 canvas (empty until a job/shipment is bound)`,
            );
          }

          // Also open PDF modal for print/download parity with other formats.
          const key = `${spec.code}:pilot:${contextKey}`;
          if (openedFor.current !== key) {
            await viewer.loadPreview(
              async () => {
                try {
                  const { blob } = await generateHblJasperPilotPdf(merged, {
                    appendCustomerTerms: true,
                    showPlaceholders: !merged.entityBound,
                  });
                  return blob;
                } catch {
                  // Phase 3: no Fresa sample fallback for Freightnest generate.
                  const { blob } = await generateHblFamilyClassicPdf(
                    spec.code,
                    merged,
                    { appendCustomerTerms: true },
                  );
                  if (!cancelled) {
                    setBoundLabel('Native Layout · classic HBL fallback (Freightnest generate)');
                  }
                  return blob;
                }
              },
              {
                fileName: formatPdfFilename(`HBL-Jasper-${spec.code}`, 'hbl-format'),
                title: spec.name,
              },
            );
            if (!cancelled) openedFor.current = key;
          }
        } catch (err: unknown) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Could not open HBL Jasper pilot.');
            openedFor.current = null;
          }
        } finally {
          if (!cancelled) setPilotLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    const key = `${spec.code}:${contextKey}`;
    if (openedFor.current === key) return;

    setError(null);
    setBoundLabel(null);

    void viewer
      .loadPreview(
        async () => {
          const [data, orgChrome] = await Promise.all([
            resolveCatalogContextPdfData(context, { formatCode: spec.code }),
            resolveReportOrgChrome(),
          ]);
          if (!cancelled) {
            const shared = getSharedLayoutSource(spec.code);
            const source = catalogPreviewSourceLabel({
              entityBound: data.entityBound,
              preferOfficialSample: false,
              isSharedLayout: Boolean(shared?.isSharedLayout),
            });
            const label =
              data.jobNumber ||
              data.shipmentNumber ||
              data.referenceNo ||
              (contextKey ? 'live record' : null);
            setBoundLabel(`${source.label}${label ? ` · ${label}` : ''} — ${source.detail}`);
          }

          const merged = {
            ...data,
            companyName: data.companyName || orgChrome.company,
            companyAddress: data.companyAddress || orgChrome.address,
            companyWeb: data.companyWeb || orgChrome.web,
            companyPhone: data.companyPhone || orgChrome.phone,
            companyEmail: data.companyEmail || orgChrome.email,
            logoUrl: data.logoUrl || orgChrome.logoUrl,
          };

          // Always Freightnest generate — never open a Fresa CDN sample as the document.
          const generated = await generateCatalogLayoutPdf(spec.code, merged, {
            logoUrl: orgChrome.logoUrl,
            purpose: 'generate',
            workflow: 'freightnest_generate',
            hblMode: 'classic',
          });
          if (!generated) {
            const { blob } = await generateHblFamilyClassicPdf(spec.code, merged, {
              appendCustomerTerms: true,
            });
            return blob;
          }
          if (!cancelled && !data.entityBound) {
            setBoundLabel(
              `${FRESA_REFERENCE_SAMPLE_LABEL}. Preview uses Freightnest native with your organization branding.`,
            );
          }
          return generated.blob;
        },
        {
          fileName: formatPdfFilename(
            `HBL-${spec.sortOrder || 0}-${spec.code}`,
            'hbl-format',
          ),
          title: spec.name,
        },
      )
      .then(() => {
        if (!cancelled) openedFor.current = key;
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          openedFor.current = null;
          setError(err instanceof Error ? err.message : 'Could not open HBL PDF.');
        }
      });

    return () => {
      cancelled = true;
      openedFor.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per code / context
  }, [autoOpen, spec?.code, contextKey, isJasperPilot]);

  if (!spec) return null;

  return (
    <>
      {boundLabel ? (
        <p className="text-xs text-[var(--color-success-700)]" role="status">
          HBL PDF · {boundLabel}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--color-danger-700)]" role="alert">
          {error}
        </p>
      ) : null}

      {isJasperPilot ? (
        <HblJasperPilotPreview
          data={pilotData || {}}
          loading={pilotLoading}
          error={error}
        />
      ) : null}

      <PdfViewerModal
        open={viewer.open}
        onClose={viewer.close}
        src={viewer.src}
        blob={viewer.blob}
        fileName={viewer.fileName}
        title={viewer.title || spec.name}
        loading={viewer.loading}
        error={viewer.error}
        skipBranding
      />
    </>
  );
}
