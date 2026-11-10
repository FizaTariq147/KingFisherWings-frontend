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

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * HBL catalogue preview: official Fresa sample PDF (stamped) when browsing;
 * classic family print doc when a live entity context is bound.
 * Does not use hblBlShell / JSON html2canvas layouts.
 */
export function HblFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getHblFormatSpec(code);
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const [boundLabel, setBoundLabel] = useState<string | null>(null);
  const openedFor = useRef<string | null>(null);
  const contextKey = catalogContextCacheKey(context);

  useEffect(() => {
    if (!autoOpen || !spec) return;
    const key = `${spec.code}:${contextKey}`;
    if (openedFor.current === key) return;

    let cancelled = false;
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
  }, [autoOpen, spec?.code, contextKey]);

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
