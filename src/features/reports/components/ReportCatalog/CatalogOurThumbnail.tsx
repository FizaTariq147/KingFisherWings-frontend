import { useEffect, useRef, useState } from 'react';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import { hasReportEntityContext } from '../../utils/reportParameterUtils';
import {
  catalogContextCacheKey,
  resolveCatalogContextPdfData,
} from '../../utils/resolveCatalogContextPdfData';
import { resolveReportOrgChrome } from '../../utils/resolveReportOrgChrome';
import { generateCatalogLayoutPdf } from '../../utils/generateCatalogLayoutPdf';
import { REPORT_PDF_WORKFLOW } from '../../utils/reportPdfWorkflow';
import {
  catalogThumbnailCacheKey,
  getCachedCatalogThumbnail,
  getOrCreateCatalogThumbnailJob,
} from '../../utils/catalogThumbnailCache';

const THUMB_WIDTH_PX = 120;

async function renderPdfBlobToDataUrl(blob: Blob, targetWidth: number): Promise<string | null> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(await blob.arrayBuffer());
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const scale = targetWidth / base.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

type CatalogOurThumbnailProps = {
  code: string;
  context?: ReportContextIds | null;
  /** When false, skip network work (row not visible). */
  active?: boolean;
};

/**
 * Lazy ~120px preview of OUR Freightnest output for the open record.
 * Never loads Fresa reference samples. Cached per code + context.
 */
export function CatalogOurThumbnail({
  code,
  context,
  active = true,
}: CatalogOurThumbnailProps) {
  const contextKey = catalogContextCacheKey(context);
  const cacheKey = catalogThumbnailCacheKey(code, contextKey);
  const [src, setSrc] = useState<string | null>(() => getCachedCatalogThumbnail(cacheKey));
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!active || !code) return;
    const cached = getCachedCatalogThumbnail(cacheKey);
    if (cached) {
      setSrc(cached);
      return;
    }
    // Only attempt OUR generate when a live record is open.
    if (!hasReportEntityContext(context)) {
      setFailed(false);
      setSrc(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    void getOrCreateCatalogThumbnailJob(cacheKey, async () => {
      const [data, orgChrome] = await Promise.all([
        resolveCatalogContextPdfData(context, { formatCode: code }),
        resolveReportOrgChrome(),
      ]);
      if (!data.entityBound) return null;
      const merged = {
        ...data,
        companyName: data.companyName || orgChrome.company,
        companyAddress: data.companyAddress || orgChrome.address,
        companyWeb: data.companyWeb || orgChrome.web,
        companyPhone: data.companyPhone || orgChrome.phone,
        companyEmail: data.companyEmail || orgChrome.email,
        logoUrl: data.logoUrl || orgChrome.logoUrl,
      };
      const generated = await generateCatalogLayoutPdf(code, merged, {
        logoUrl: orgChrome.logoUrl,
        preferTemplateV2: false,
        purpose: 'generate',
        workflow: REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE,
      });
      if (!generated?.blob) return null;
      return renderPdfBlobToDataUrl(generated.blob, THUMB_WIDTH_PX);
    })
      .then((url) => {
        if (cancelled || !mounted.current) return;
        if (url) setSrc(url);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled && mounted.current) setFailed(true);
      })
      .finally(() => {
        if (!cancelled && mounted.current) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active, cacheKey, code, context]);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]"
      style={{ width: THUMB_WIDTH_PX, height: Math.round(THUMB_WIDTH_PX * 1.414) }}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <img
          src={src}
          alt=""
          width={THUMB_WIDTH_PX}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] leading-snug text-[var(--color-neutral-400)]">
          {loading ? 'Preview…' : failed ? 'No preview' : '—'}
        </div>
      )}
    </div>
  );
}
