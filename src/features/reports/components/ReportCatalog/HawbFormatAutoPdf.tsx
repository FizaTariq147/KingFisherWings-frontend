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
import { catalogPreviewSourceLabel } from '../../utils/catalogFormatStatus';
import { getSharedLayoutSource } from '../../data/sharedLayoutSource';
import { FRESA_REFERENCE_SAMPLE_LABEL } from '../../utils/reportPdfWorkflow';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * HAWB catalogue preview.
 * Unbound browse: unmodified official Fresa reference sample (labelled).
 * Entity-bound: Freightnest native layout + org branding — never a Fresa sample PDF.
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
            const shared = getSharedLayoutSource(spec.code);
            const source = catalogPreviewSourceLabel({
              entityBound: data.entityBound,
              preferOfficialSample: !data.entityBound,
              isNativePilot: Boolean(data.entityBound),
              isSharedLayout: Boolean(shared?.isSharedLayout),
            });
            const record =
              data.jobNumber ||
              data.shipmentNumber ||
              data.referenceNo ||
              (contextKey ? 'live record' : null);
            setBoundLabel(
              data.entityBound
                ? `${source.label}${record ? ` · ${record}` : ''} — ${source.detail}`
                : FRESA_REFERENCE_SAMPLE_LABEL,
            );
          }

          // Phase 3 browse: unmodified Fresa reference (skip org stamp).
          if (!data.entityBound) {
            try {
              const { blob } = await generateHawbSamplePdf(spec.code, {
                skipOrgStamp: true,
                appendCustomerTerms: false,
              });
              return blob;
            } catch {
              /* fall through to Freightnest native */
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
              logoUrl: data.logoUrl || orgChrome.logoUrl,
            },
            {
              logoUrl: orgChrome.logoUrl,
              preferTemplateV2: false,
              preferHawbOfficial: true,
              purpose: 'generate',
              workflow: 'freightnest_generate',
            },
          );
          if (!generated) {
            throw new Error(
              data.entityBound
                ? 'No Freightnest HAWB generate path for this format.'
                : 'Could not load official HAWB reference sample or Freightnest layout.',
            );
          }
          if (!cancelled && data.entityBound) {
            setBoundLabel(
              `Native Layout · Freightnest generate — registered organization branding`,
            );
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
