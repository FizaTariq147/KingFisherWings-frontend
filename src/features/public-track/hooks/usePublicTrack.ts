import { useMutation, useQuery } from '@tanstack/react-query';
import { publicTrackService } from '../services/publicTrack.service';

export function usePublicTrackEmbed(tenantSlug?: string) {
  return useQuery({
    queryKey: ['public-track', 'embed', tenantSlug ?? ''],
    queryFn: () => publicTrackService.embed(tenantSlug),
    staleTime: 5 * 60_000,
  });
}

export function usePublicTrackLookup() {
  return useMutation({
    mutationFn: ({ tenantSlug, ref }: { tenantSlug: string; ref: string }) =>
      publicTrackService.track(tenantSlug, ref),
  });
}
