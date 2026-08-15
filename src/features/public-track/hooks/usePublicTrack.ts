import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { publicTrackService } from '../services/publicTrack.service';

export function usePublicTrackEmbed(tenantSlug?: string) {
  return useQuery({
    queryKey: ['public-track', 'embed', tenantSlug ?? '', publicTrackService.headers()],
    queryFn: () => publicTrackService.embed(tenantSlug),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function usePublicTrackLookup() {
  return useMutation({
    mutationFn: ({ tenantSlug, ref }: { tenantSlug?: string; ref: string }) =>
      publicTrackService.track(tenantSlug, ref),
  });
}

const WIDGET_SCRIPT_ID = 'kf-public-track-widget';

/** Load GET /track/widget.js into a container (drop-in embed script from Swagger). */
export function usePublicTrackWidget(tenantSlug?: string, containerId = 'kf-track-widget-root') {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || typeof document === 'undefined') return;
    loadedRef.current = true;

    const existing = document.getElementById(WIDGET_SCRIPT_ID);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = WIDGET_SCRIPT_ID;
    script.src = publicTrackService.widgetScriptUrl(tenantSlug);
    script.async = true;
    script.dataset.container = containerId;
    if (tenantSlug?.trim()) script.dataset.tenantSlug = tenantSlug.trim();
    document.body.appendChild(script);

    return () => {
      script.remove();
      loadedRef.current = false;
    };
  }, [containerId, tenantSlug]);
}
