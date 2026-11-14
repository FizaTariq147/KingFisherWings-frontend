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
import { generateHblSamplePdf } from '../../utils/generateHblSamplePdf';
import { generateHblFamilyClassicPdf } from '@/features/shared/bl-draft/generateHblFamilyClassicPdf';
import { resolveReportOrgChrome } from '../../utils/resolveReportOrgChrome';
import {
  generateHblJasperPilotPdf,
  HblJasperPilotPreview,
  isHblJasperPilotCode,
} from '../../templates/hbl/jasperPilot';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * HBL catalogue preview.
 * Jasper pilot (`HBL_DRAFT_REPORT_FORMAT_JASPER`): config-driven live composition + PDF.
 * Other HBL codes: official Fresa sample when browsing; classic family on sample failure.
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
          setBoundLabel(
            data.entityBound
              ? `Jasper pilot · bound to ${data.jobNumber || data.shipmentNumber || data.referenceNo || 'live record'}`
              : 'Jasper pilot · A4 canvas (empty until a job/shipment is bound)',
          );

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
                  // Preserve sample fallback until pilot PDF is verified.
                  const { blob } = await generateHblSamplePdf(spec.code, {
                    chrome: orgChrome,
                    appendCustomerTerms: true,
                  });
                  if (!cancelled) {
                    setBoundLabel('official Fresa Jasper sample (pilot PDF fallback)');
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
            const label =
              data.jobNumber ||
              data.shipmentNumber ||
              data.referenceNo ||
              (contextKey ? 'live record' : null);
            setBoundLabel(label ? `bound to ${label}` : 'official Fresa sample');
          }

          // Prefer official Fresa sample so formats stay visually distinct.
          // Classic family is only for sample-fetch failure (shared packs look identical).
          try {
            const { blob } = await generateHblSamplePdf(spec.code, {
              chrome: orgChrome,
              appendCustomerTerms: true,
            });
            if (!cancelled) {
              setBoundLabel(
                data.entityBound
                  ? `official Fresa sample · record ${data.jobNumber || data.shipmentNumber || 'bound'}`
                  : 'official Fresa sample',
              );
            }
            return blob;
          } catch {
            const { blob } = await generateHblFamilyClassicPdf(
              spec.code,
              {
                ...data,
                companyName: data.companyName || orgChrome.company,
                companyAddress: data.companyAddress || orgChrome.address,
                companyWeb: data.companyWeb || orgChrome.web,
                companyPhone: data.companyPhone || orgChrome.phone,
                companyEmail: data.companyEmail || orgChrome.email,
                logoUrl: data.logoUrl || orgChrome.logoUrl,
              },
              { appendCustomerTerms: true },
            );
            return blob;
          }
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
