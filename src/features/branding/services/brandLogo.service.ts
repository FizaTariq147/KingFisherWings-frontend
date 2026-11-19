import { axiosInstance } from '@/lib/axios';
import { superAdminApiClient } from '@/lib/superAdminApiClient';
import { organizationService } from '@/features/organization/services/organization.service';
import {
  fetchOrganizationLogoBytes,
  toApiRelativeLogoUrl,
} from '@/features/organization/utils/embedOrganizationPdfLogo';
import {
  isStoredFileUrl,
  toDurableFilesApiPath,
  toPersistableLogoUrl,
} from '@/features/files/utils/parseFilesApiUrl';
import { cacheOrganizationLogoFile } from '@/features/organization/utils/orgLogoCache';
import { useAuthStore } from '@/store/authStore';
import { BRAND_LOGO_API } from '../api/brandLogo.api';
import { BRAND_LOGO_ACCEPT, BRAND_LOGO_MAX_BYTES } from '../constants/brandLogo.constants';
import { normalizeBrandLogoForUpload } from '../utils/normalizeBrandLogoForUpload';

export type BrandLogoUploadResult = {
  logo_url: string;
  /** True when logo_url was written to GET /organization/profile (all devices). */
  persisted: boolean;
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
  return { logo_url, persisted: false };
}

async function persistOrgLogoUrl(
  logoUrl: string,
  fallbackAbsolute?: string,
): Promise<BrandLogoUploadResult> {
  // Backend @IsUrl rejects /files/… and localhost — only public https:// hosts.
  const logo_url =
    toPersistableLogoUrl(logoUrl) ||
    toPersistableLogoUrl(fallbackAbsolute || '') ||
    '';
  if (!logo_url) {
    throw new Error(
      'logo_url must be a public https:// address. Paste your Cloudflare R2 https link (Apply URL strips the expiry signature).',
    );
  }
  try {
    await organizationService.persistLogoUrl(logo_url);
    return { logo_url, persisted: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'Could not save logo_url on the organization profile.';
    throw new Error(message);
  }
}

export const brandLogoService = {
  /**
   * POST /organization/logo — staff JWT. WebP/SVG → PNG for PDFs.
   * Then PATCH profile.logo_url so the logo is available on every device/session
   * (not only this browser’s localStorage).
   */
  async uploadOrganizationLogo(file: File): Promise<BrandLogoUploadResult> {
    const err = validateBrandLogoFile(file);
    if (err) throw new Error(err);
    const normalized = await normalizeBrandLogoForUpload(file);
    const uploaded = await postLogo(BRAND_LOGO_API.organizationLogo, normalized, 'staff');

    // Warm this browser only after a successful server upload.
    await cacheOrganizationLogoFile(
      normalized,
      useAuthStore.getState().user?.tenantId,
    );

    // Persist absolute https from upload response — do not convert to /files/ before PATCH.
    return persistOrgLogoUrl(uploaded.logo_url);
  },

  /**
   * Apply a pasted Logo URL: download → PNG → POST /organization/logo → PATCH profile.
   * That gives every device an auth-fetchable logo for invoice/quotation/credit/debit PDFs
   * (sidebar `<img>` alone is not enough when the host blocks CORS).
   */
  async applyOrganizationLogoUrl(rawUrl: string): Promise<BrandLogoUploadResult> {
    const trimmed = String(rawUrl ?? '').trim();
    if (!trimmed) throw new Error('Paste a logo URL.');
    if (trimmed.startsWith('blob:')) {
      throw new Error('Paste a https:// or /files/… URL — local previews cannot be saved.');
    }

    // Auth fetch via /files/…; persist cleaned absolute https (R2 without X-Amz query).
    const fetchCandidate =
      toDurableFilesApiPath(trimmed) || toApiRelativeLogoUrl(trimmed) || trimmed;
    const persistFallback = toPersistableLogoUrl(trimmed);

    if (
      isStoredFileUrl(trimmed) ||
      isStoredFileUrl(fetchCandidate) ||
      fetchCandidate.startsWith('/files/') ||
      fetchCandidate.includes('/organization/logo')
    ) {
      const bytes = await fetchOrganizationLogoBytes(fetchCandidate);
      if (!bytes || bytes.byteLength < 24) {
        throw new Error(
          'Could not load that file from storage. Confirm you are signed in to the same organization, or use Choose logo.',
        );
      }
      await cacheOrganizationLogoFile(
        new Blob([bytes]),
        useAuthStore.getState().user?.tenantId,
      );
      // Re-upload PNG so GET /organization/logo works for PDFs on every device.
      try {
        const inbound = new File([bytes], 'organization-logo.png', {
          type: 'image/png',
        });
        const normalized = await normalizeBrandLogoForUpload(inbound);
        const uploaded = await postLogo(
          BRAND_LOGO_API.organizationLogo,
          normalized,
          'staff',
        );
        await cacheOrganizationLogoFile(
          normalized,
          useAuthStore.getState().user?.tenantId,
        );
        return persistOrgLogoUrl(uploaded.logo_url, persistFallback || trimmed);
      } catch {
        return persistOrgLogoUrl(persistFallback || trimmed);
      }
    }

    // Hosted / CDN URL — ingest bytes into org logo upload so PDFs work without CORS.
    const bytes = await fetchOrganizationLogoBytes(fetchCandidate);
    if (!bytes || bytes.byteLength < 24) {
      throw new Error(
        'Could not download that logo URL. Paste a Cloudflare R2 https link, a public https:// image, or use Choose logo.',
      );
    }

    const inbound = new File([bytes], 'organization-logo.png', {
      type: 'image/png',
    });
    const normalized = await normalizeBrandLogoForUpload(inbound);
    const uploaded = await postLogo(BRAND_LOGO_API.organizationLogo, normalized, 'staff');

    await cacheOrganizationLogoFile(
      normalized,
      useAuthStore.getState().user?.tenantId,
    );

    return persistOrgLogoUrl(uploaded.logo_url, persistFallback || trimmed);
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
      const uploaded = await postLogo(BRAND_LOGO_API.tenantLogo(id), normalized, 'superadmin');
      return {
        logo_url: toApiRelativeLogoUrl(uploaded.logo_url) || uploaded.logo_url,
        persisted: true,
      };
    } catch (error) {
      throw new Error(formatUploadError(error));
    }
  },
};
