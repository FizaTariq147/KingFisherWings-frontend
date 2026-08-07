import axios from 'axios';
import { PUBLIC_TRACK_API } from '../api/publicTrack.api';
import type { PublicTrackEmbedConfig, PublicTrackResult } from '../types/publicTrack.types';
import { normalizeEmbedConfig, normalizePublicTrack } from '../utils/normalizePublicTrack';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 60_000,
});

export const publicTrackService = {
  async track(tenantSlug: string, ref: string): Promise<PublicTrackResult> {
    const res = await publicClient.get(PUBLIC_TRACK_API.track, {
      params: { tenant_slug: tenantSlug.trim(), ref: ref.trim() },
    });
    const result = normalizePublicTrack(res.data);
    if (!result) throw new Error('Shipment not found for that reference.');
    return result;
  },
  async embed(tenantSlug?: string): Promise<PublicTrackEmbedConfig> {
    const res = await publicClient.get(PUBLIC_TRACK_API.embed, {
      params: tenantSlug ? { tenant_slug: tenantSlug } : undefined,
    });
    return normalizeEmbedConfig(res.data);
  },
};
