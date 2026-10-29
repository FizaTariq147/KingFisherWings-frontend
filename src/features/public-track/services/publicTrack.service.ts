import axios from 'axios';
import { PUBLIC_TRACK_API } from '../api/publicTrack.api';
import type { PublicTrackEmbedConfig, PublicTrackResult } from '../types/publicTrack.types';
import { buildPublicTrackHeaders } from '../utils/publicTrackContext';
import { getPublicTrackErrorMessage } from '../utils/publicTrackErrors';
import { normalizeEmbedConfig, normalizePublicTrack } from '../utils/normalizePublicTrack';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 60_000,
});

function trackParams(tenantSlug?: string, ref?: string) {
  const params: Record<string, string> = {};
  const slug = tenantSlug?.trim();
  const reference = ref?.trim();
  if (slug) params.tenant_slug = slug;
  if (reference) params.ref = reference;
  return params;
}

function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL || '';
  return raw.replace(/\/$/, '');
}

export const publicTrackService = {
  headers(): Record<string, string> {
    return buildPublicTrackHeaders();
  },

  widgetScriptUrl(tenantSlug?: string): string {
    const url = new URL(`${apiBaseUrl()}${PUBLIC_TRACK_API.widget}`, window.location.origin);
    const slug = tenantSlug?.trim();
    if (slug) url.searchParams.set('tenant_slug', slug);
    return url.toString();
  },

  /**
   * Raw GET /track?ref=… (or GET /track/{ref} fallback) for staff panels that
   * render the API payload as-is.
   *
   * OpenAPI: resolve tenant via `tenant_slug` or Host/domain. On localhost /
   * Vite proxy, `tenant_slug` is required because Host is the API origin.
   */
  async trackRaw(tenantSlug: string | undefined, ref: string): Promise<unknown> {
    const reference = ref.trim();
    if (!reference) throw new Error('Reference is required.');
    const slug = tenantSlug?.trim();
    if (!slug) {
      throw new Error(
        'Username is required for Track & Trace when not on your company domain.',
      );
    }
    const headers = buildPublicTrackHeaders();
    try {
      const res = await publicClient.get(PUBLIC_TRACK_API.track, {
        params: trackParams(slug, reference),
        headers,
      });
      return res.data;
    } catch (firstError) {
      try {
        const res = await publicClient.get(PUBLIC_TRACK_API.trackByRef(reference), {
          params: { tenant_slug: slug },
          headers,
        });
        return res.data;
      } catch {
        throw new Error(
          getPublicTrackErrorMessage(firstError, 'Track lookup failed.'),
        );
      }
    }
  },

  async track(tenantSlug: string | undefined, ref: string): Promise<PublicTrackResult> {
    try {
      const raw = await this.trackRaw(tenantSlug, ref);
      const result = normalizePublicTrack(raw);
      if (!result) throw new Error('Shipment not found for that reference.');
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : getPublicTrackErrorMessage(error, 'Track lookup failed.'),
      );
    }
  },

  async embed(tenantSlug?: string): Promise<PublicTrackEmbedConfig> {
    try {
      const res = await publicClient.get(PUBLIC_TRACK_API.embed, {
        params: tenantSlug?.trim() ? { tenant_slug: tenantSlug.trim() } : undefined,
        headers: buildPublicTrackHeaders(),
      });
      const config = normalizeEmbedConfig(res.data);
      return {
        ...config,
        widgetScriptUrl:
          config.widgetScriptUrl ||
          publicTrackService.widgetScriptUrl(config.tenantSlug ?? tenantSlug),
      };
    } catch (error) {
      throw new Error(getPublicTrackErrorMessage(error, 'Unable to load track widget settings.'));
    }
  },
};
