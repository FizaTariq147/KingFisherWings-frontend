import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePublicTrackEmbed, usePublicTrackWidget } from '../hooks/usePublicTrack';
import { resolveTenantSlugFromLocation } from '../utils/publicTrackContext';

const WIDGET_ROOT_ID = 'kf-track-widget-root';

export default function PublicTrackWidgetPage() {
  const [searchParams] = useSearchParams();
  const tenantFromUrl = useMemo(
    () => resolveTenantSlugFromLocation(searchParams.toString()),
    [searchParams],
  );

  const embed = usePublicTrackEmbed(tenantFromUrl || undefined);
  const tenantSlug = embed.data?.tenantSlug || tenantFromUrl || undefined;

  usePublicTrackWidget(tenantSlug, WIDGET_ROOT_ID);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] px-4 py-10">
      <div className="mx-auto max-w-xl">
        {embed.data?.logoUrl ? (
          <img
            src={embed.data.logoUrl}
            alt={embed.data.companyName ?? 'Company logo'}
            className="mb-4 h-10 w-auto object-contain"
          />
        ) : null}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
          Track widget
        </p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--color-neutral-900)]">
          {embed.data?.companyName ? `${embed.data.companyName} tracking` : 'Shipment tracking'}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Drop-in widget served from <code className="text-xs">GET /track/widget.js</code>.
        </p>
        <div
          id={WIDGET_ROOT_ID}
          className="mt-8 min-h-[220px] rounded-xl border border-[var(--color-neutral-200)] bg-white p-5"
        />
      </div>
    </div>
  );
}
