import { axiosInstance } from '@/lib/axios';
import { BRAND_LOGO_API } from '../api/brandLogo.api';
import { BRAND_LOGO_ACCEPT, BRAND_LOGO_MAX_BYTES } from '../constants/brandLogo.constants';

export type BrandLogoUploadResult = {
  logo_url: string;
};

function pickLogoUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  const nested =
    r.organization && typeof r.organization === 'object'
      ? (r.organization as Record<string, unknown>)
      : r.tenant && typeof r.tenant === 'object'
        ? (r.tenant as Record<string, unknown>)
        : null;
  const raw =
    r.logo_url ??
    r.logoUrl ??
    r.url ??
    nested?.logo_url ??
    nested?.logoUrl;
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

async function postLogo(path: string, file: File): Promise<BrandLogoUploadResult> {
  const form = new FormData();
  form.append('file', file);
  // Do not set Content-Type — axios/browser must add multipart boundary.
  const { data } = await axiosInstance.post<unknown>(path, form, {
    skipErrorToast: true,
  });
  const logo_url = pickLogoUrl(data);
  if (!logo_url) {
    throw new Error('Upload succeeded but no logo_url was returned.');
  }
  return { logo_url };
}

export const brandLogoService = {
  /** POST /organization/logo */
  async uploadOrganizationLogo(file: File): Promise<BrandLogoUploadResult> {
    const err = validateBrandLogoFile(file);
    if (err) throw new Error(err);
    return postLogo(BRAND_LOGO_API.organizationLogo, file);
  },

  /** POST /tenants/:id/logo */
  async uploadTenantLogo(tenantId: string, file: File): Promise<BrandLogoUploadResult> {
    const err = validateBrandLogoFile(file);
    if (err) throw new Error(err);
    const id = tenantId.trim();
    if (!id) throw new Error('Tenant id is required to upload a logo.');
    return postLogo(BRAND_LOGO_API.tenantLogo(id), file);
  },
};
