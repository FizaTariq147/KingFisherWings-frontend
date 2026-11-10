import { useEffect, useRef, useState } from 'react';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { getHawbFormatSpec } from '../../constants/hawbFormatCatalog';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  catalogContextCacheKey,
  resolveCatalogContextPdfData,
} from '../../utils/resolveCatalogContextPdfData';
import { generateHawbSamplePdf } from '../../utils/generateHawbSamplePdf';
import { generateCatalogLayoutPdf } from '../../utils/generateCatalogLayoutPdf';
import { resolveReportOrgChrome } from '../../utils/resolveReportOrgChrome';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * HAWB catalogue preview: official Fresa sample PDF when browsing;
 * JSON IATA shell only if sample fetch fails or live entity is bound (until pack ready).
 */
export function HawbFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getHawbFormatSpec(code);
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

          if (!data.entityBound) {
            try {
              const { blob } = await generateHawbSamplePdf(spec.code, {
                chrome: orgChrome,
                appendCustomerTerms: true,
              });
              return blob;
            } catch {
              /* fall through */
            }
          }

          const generated = await generateCatalogLayoutPdf(
            spec.code,
            {
              ...data,
              companyName: data.companyName || orgChrome.company,
              companyAddress: data.companyAddress || orgChrome.address,
              companyWeb: data.companyWeb || orgChrome.web,
              companyPhone: data.companyPhone || orgChrome.phone,
              companyEmail: data.companyEmail || orgChrome.email,
            },
            { logoUrl: orgChrome.logoUrl },
          );
          if (!generated) {
            throw new Error('No HAWB sample or layout for this format.');
          }
          return generated.blob;
        },
        {
          fileName: formatPdfFilename(
            `HAWB-${spec.sortOrder || 0}-${spec.code}`,
            'hawb-format',
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
          setError(err instanceof Error ? err.message : 'Could not open HAWB PDF.');
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
          HAWB PDF · {boundLabel}
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
