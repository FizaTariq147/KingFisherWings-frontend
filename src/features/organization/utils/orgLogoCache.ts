import { useAuthStore } from '@/store/authStore';

function cacheKey(tenantId: string): string {
  return `kf.orgLogoPng.v1.${tenantId}`;
}

function activeTenantId(): string {
  return String(useAuthStore.getState().user?.tenantId ?? '').trim();
}

/** Persist a PNG/JPEG data URL so PDFs can embed the org logo without re-fetch. */
export function cacheOrganizationLogoDataUrl(
  dataUrl: string,
  tenantId?: string | null,
): void {
  const id = String(tenantId ?? activeTenantId()).trim();
  const value = String(dataUrl ?? '').trim();
  if (!id || !value.startsWith('data:image/')) return;
  try {
    localStorage.setItem(cacheKey(id), value);
  } catch {
    /* quota / private mode */
  }
}

export function readCachedOrganizationLogoDataUrl(
  tenantId?: string | null,
): string | null {
  const id = String(tenantId ?? activeTenantId()).trim();
  if (!id) return null;
  try {
    const value = localStorage.getItem(cacheKey(id));
    return value?.startsWith('data:image/') ? value : null;
  } catch {
    return null;
  }
}

export async function cacheOrganizationLogoFile(
  file: Blob,
  tenantId?: string | null,
): Promise<string | null> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read logo file'));
    reader.readAsDataURL(file);
  });
  if (!dataUrl.startsWith('data:image/')) return null;
  cacheOrganizationLogoDataUrl(dataUrl, tenantId);
  return dataUrl;
}
