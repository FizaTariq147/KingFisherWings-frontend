import { axiosInstance } from '@/lib/axios';
import { superAdminApiClient } from '@/lib/superAdminApiClient';
import { cacheOrganizationLogoFile } from '@/features/organization/utils/orgLogoCache';
import { useAuthStore } from '@/store/authStore';
import { BRAND_LOGO_API } from '../api/brandLogo.api';
import { BRAND_LOGO_ACCEPT, BRAND_LOGO_MAX_BYTES } from '../constants/brandLogo.constants';
import { normalizeBrandLogoForUpload } from '../utils/normalizeBrandLogoForUpload';

export type BrandLogoUploadResult = {
  logo_url: string;
};

function pickLogoUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  const nested =
    r.data && typeof r.data === 'object'
      ? (r.data as Record<string, unknown>)
      : r.organization && typeof r.organization === 'object'
        ? (r.organization as Record<string, unknown>)
        : r.tenant && typeof r.tenant === 'object'
          ? (r.tenant as Record<string, unknown>)
          : null;
  const raw =
    r.logo_url ??
    r.logoUrl ??
    r.url ??
    nested?.logo_url ??
    nested?.logoUrl ??
    nested?.url;
  const url = String(raw ?? '').trim();
  return url || null;
}

export function validateBrandLogoFile(file: File): string | null {
  if (!file) return 'Choose a logo file.';
  if (file.size > BRAND_LOGO_MAX_BYTES) {
    return 'Logo must be 2 MB or smaller.';
  }
  const okType =
    !file.type ||
    BRAND_LOGO_ACCEPT.split(',').some((t) => t.trim() === file.type) ||
    /\.(png|jpe?g|webp|svg)$/i.test(file.name);
  if (!okType) return 'Use PNG, JPG, WebP, or SVG.';
  return null;
}

function formatUploadError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Logo upload failed. You can still paste a logo URL.';
  }
  const ax = error as {
    response?: { status?: number; data?: { message?: string | string[] } };
    message?: string;
  };
  const status = ax.response?.status;
  if (status === 401) {
    return 'Not authorized to upload this logo. Sign in again as Super Admin and retry.';
  }
  if (status === 404) {
    return 'Logo upload API is not available yet. Paste a hosted logo URL instead.';
  }
  const msg = ax.response?.data?.message;
  if (Array.isArray(msg) && msg.length) return msg.map(String).join('; ');
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (typeof ax.message === 'string' && ax.message.trim()) return ax.message;
  return 'Logo upload failed. You can still paste a logo URL.';
}

async function postLogo(
  path: string,
  file: File,
  client: 'staff' | 'superadmin',
): Promise<BrandLogoUploadResult> {
  const form = new FormData();
  form.append('file', file);
  // Do not set Content-Type — axios/browser must add multipart boundary.
  const http = client === 'superadmin' ? superAdminApiClient : axiosInstance;
  const { data } = await http.post<unknown>(path, form, {
    skipErrorToast: true,
  } as Parameters<typeof http.post>[2]);
  const logo_url = pickLogoUrl(data);
  if (!logo_url) {
    throw new Error('Upload succeeded but no logo_url was returned.');
  }
  return { logo_url };
}

export const brandLogoService = {
  /** POST /organization/logo — staff JWT. WebP/SVG → PNG for PDFs. */
  async uploadOrganizationLogo(file: File): Promise<BrandLogoUploadResult> {
    const err = validateBrandLogoFile(file);
    if (err) throw new Error(err);
    const normalized = await normalizeBrandLogoForUpload(file);
    // Cache PNG locally so invoice/quotation PDFs embed this logo even if CDN/files fetch fails.
    await cacheOrganizationLogoFile(
      normalized,
      useAuthStore.getState().user?.tenantId,
    );
    return postLogo(BRAND_LOGO_API.organizationLogo, normalized, 'staff');
  },

  /**
   * POST /tenants/:id/logo — Super Admin JWT (not staff axios).
   * WebP/SVG → PNG for PDF compatibility.
   */
  async uploadTenantLogo(tenantId: string, file: File): Promise<BrandLogoUploadResult> {
    const err = validateBrandLogoFile(file);
    if (err) throw new Error(err);
    const id = tenantId.trim();
    if (!id) throw new Error('Tenant id is required to upload a logo.');
    const normalized = await normalizeBrandLogoForUpload(file);
    try {
      return await postLogo(BRAND_LOGO_API.tenantLogo(id), normalized, 'superadmin');
    } catch (error) {
      throw new Error(formatUploadError(error));
    }
  },
};
