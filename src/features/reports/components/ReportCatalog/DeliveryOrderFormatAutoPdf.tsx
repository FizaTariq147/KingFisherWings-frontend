import { useEffect, useRef, useState } from 'react';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { getDeliveryOrderFormatSpec } from '../../constants/deliveryOrderFormatCatalog';
import { getDeliveryOrderFormatUiLayout } from '../../data/deliveryOrderFormatUiLayouts';
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

export function DeliveryOrderFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getDeliveryOrderFormatSpec(code);
  const canOpen =
    Boolean(spec) &&
    (Boolean(getDeliveryOrderFormatUiLayout(code)) ||
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
                ? `delivery order · ${data.jobNumber || data.shipmentNumber || 'bound'}`
                : 'delivery order template',
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
            },
            { logoUrl: orgChrome.logoUrl, preferTemplateV2: true },
          );
          if (!generated) throw new Error('No delivery order template for this format.');
          return generated.blob;
        },
        {
          fileName: formatPdfFilename(
            `DeliveryOrder-${spec.sortOrder || 0}-${spec.code}`,
            'delivery-order-format',
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
          setError(err instanceof Error ? err.message : 'Could not open delivery order PDF.');
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
          Delivery order · {boundLabel}
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
