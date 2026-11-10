import axios from 'axios';
import { PUBLIC_TRACK_API } from '../api/publicTrack.api';
import type { LiveTrackingCard } from '../types/liveTracking.types';
import type { PublicTrackEmbedConfig, PublicTrackResult } from '../types/publicTrack.types';
import { buildPublicTrackHeaders } from '../utils/publicTrackContext';
import { getPublicTrackErrorMessage } from '../utils/publicTrackErrors';
import { normalizeLiveTracking } from '../utils/normalizeLiveTracking';
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
   * OpenAPI: resolve tenant via Host / `x-tenant-domain`, optional `tenant_slug`
   * (URL / subdomain / remembered login). Callers do not collect a username.
   */
  async trackRaw(tenantSlug: string | undefined, ref: string): Promise<unknown> {
    const reference = ref.trim();
    if (!reference) throw new Error('Reference is required.');
    const slug = tenantSlug?.trim() || undefined;
    const headers = buildPublicTrackHeaders(slug);
    try {
      const res = await publicClient.get(PUBLIC_TRACK_API.track, {
        params: trackParams(slug, reference),
        headers,
      });
      return res.data;
    } catch (firstError) {
      try {
        const res = await publicClient.get(PUBLIC_TRACK_API.trackByRef(reference), {
          params: slug ? { tenant_slug: slug } : undefined,
          headers,
        });
        return res.data;
      } catch {
        throw new Error(
          getPublicTrackErrorMessage(
            firstError,
            'Shipment not found for that reference. Check the job, shipment, container, or BL number.',
          ),
        );
      }
    }
  },

  async track(tenantSlug: string | undefined, ref: string): Promise<PublicTrackResult> {
    try {
      const raw = await this.trackRaw(tenantSlug, ref);
      const result = normalizePublicTrack(raw, { fallbackRef: ref.trim() });
      if (!result) {
        throw new Error(
          'Tracking data returned but could not be read. Ask ops if public track is enabled for this job.',
        );
      }
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : getPublicTrackErrorMessage(error, 'Track lookup failed.'),
      );
    }
  },

  /**
   * GET /track/pdf?ref=… — server PDF. Ref only (container / BL / AWB); tenant_slug optional.
   */
  async downloadPdf(ref: string, tenantSlug?: string): Promise<Blob> {
    const reference = ref.trim();
    if (!reference) throw new Error('Reference is required.');
    const slug = tenantSlug?.trim() || undefined;
    try {
      const res = await publicClient.get<Blob>(PUBLIC_TRACK_API.trackPdf, {
        params: trackParams(slug, reference),
        headers: {
          ...buildPublicTrackHeaders(slug),
          Accept: 'application/pdf, application/octet-stream, */*',
        },
        responseType: 'blob',
      });
      return res.data;
    } catch (error) {
      throw new Error(
        getPublicTrackErrorMessage(error, 'Could not download track PDF.'),
      );
    }
  },

  /** GET /track/live/flight?q=… */
  async liveFlight(query: string, tenantSlug?: string): Promise<LiveTrackingCard | null> {
    const q = query.trim();
    if (!q) throw new Error('Flight query is required.');
    try {
      const res = await publicClient.get(PUBLIC_TRACK_API.liveFlight, {
        params: { q, ...(tenantSlug?.trim() ? { tenant_slug: tenantSlug.trim() } : {}) },
        headers: buildPublicTrackHeaders(tenantSlug),
      });
      return normalizeLiveTracking(res.data, { kind: 'flight', query: q });
    } catch (error) {
      throw new Error(
        getPublicTrackErrorMessage(error, 'Live flight lookup failed.'),
      );
    }
  },

  /** GET /track/live/vessel?q=… */
  async liveVessel(query: string, tenantSlug?: string): Promise<LiveTrackingCard | null> {
    const q = query.trim();
    if (!q) throw new Error('Vessel query is required.');
    try {
      const res = await publicClient.get(PUBLIC_TRACK_API.liveVessel, {
        params: { q, ...(tenantSlug?.trim() ? { tenant_slug: tenantSlug.trim() } : {}) },
        headers: buildPublicTrackHeaders(tenantSlug),
      });
      return normalizeLiveTracking(res.data, { kind: 'vessel', query: q });
    } catch (error) {
      throw new Error(
        getPublicTrackErrorMessage(error, 'Live vessel lookup failed.'),
      );
    }
  },

  async embed(tenantSlug?: string): Promise<PublicTrackEmbedConfig> {
    try {
      const res = await publicClient.get(PUBLIC_TRACK_API.embed, {
        params: tenantSlug?.trim() ? { tenant_slug: tenantSlug.trim() } : undefined,
        headers: buildPublicTrackHeaders(tenantSlug),
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
