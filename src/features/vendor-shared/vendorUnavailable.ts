import { VendorApiError } from '@/lib/vendorApiClient';

export function isVendorApiUnavailable(err: unknown): boolean {
  if (!(err instanceof VendorApiError)) return false;
  return err.status === 404 || err.status === 501;
}

export function vendorErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (isVendorApiUnavailable(err)) return 'Vendor APIs are not available yet.';
  if (err instanceof VendorApiError || err instanceof Error) {
    const msg = err.message.trim();
    if (msg) return msg;
  }
  return fallback;
}
