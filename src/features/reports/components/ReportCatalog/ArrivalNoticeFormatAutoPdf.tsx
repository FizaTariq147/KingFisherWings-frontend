import { useEffect, useRef, useState } from 'react';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { getArrivalNoticeFormatSpec } from '../../constants/arrivalNoticeFormatCatalog';
import { getArrivalNoticeFormatUiLayout } from '../../data/arrivalNoticeFormatUiLayouts';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  catalogContextCacheKey,
  resolveCatalogContextPdfData,
} from '../../utils/resolveCatalogContextPdfData';
import { generateCatalogLayoutPdf, hasCatalogLayoutPdf } from '../../utils/generateCatalogLayoutPdf';
import { resolveReportOrgChrome } from '../../utils/resolveReportOrgChrome';
import { supportsTemplateV2 } from '../../engines/preview/renderTemplateV2Pdf';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * Arrival notice preview: template-v2 specialized document (or legacy JSON).
 * Phase 4 print-CSS pilot HTML is available via engines/pdf/printCssPilot.ts.
 */
export function ArrivalNoticeFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getArrivalNoticeFormatSpec(code);
  const canOpen =
    Boolean(spec) &&
    (Boolean(getArrivalNoticeFormatUiLayout(code)) ||
      supportsTemplateV2(code) ||
      hasCatalogLayoutPdf(code));
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const [boundLabel, setBoundLabel] = useState<string | null>(null);
  const openedFor = useRef<string | null>(null);
  const contextKey = catalogContextCacheKey(context);

  useEffect(() => {
    if (!autoOpen || !canOpen || !spec) return;
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
            setBoundLabel(
              data.entityBound
                ? `arrival notice · ${data.jobNumber || data.shipmentNumber || 'bound'}`
                : 'arrival notice template',
            );
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
              logoUrl: data.logoUrl || orgChrome.logoUrl,
            },
            { logoUrl: orgChrome.logoUrl, preferTemplateV2: true },
          );
          if (!generated) throw new Error('No arrival notice template for this format.');
          return generated.blob;
        },
        {
          fileName: formatPdfFilename(
            `Arrival-${spec.sortOrder || 0}-${spec.code}`,
            'arrival-notice-format',
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
          setError(err instanceof Error ? err.message : 'Could not open arrival notice PDF.');
        }
      });

    return () => {
      cancelled = true;
      openedFor.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per code / context
  }, [autoOpen, spec?.code, contextKey, canOpen]);

  if (!canOpen || !spec) return null;

  return (
    <>
      {boundLabel ? (
        <p className="text-xs text-[var(--color-success-700)]" role="status">
          Arrival notice · {boundLabel}
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
