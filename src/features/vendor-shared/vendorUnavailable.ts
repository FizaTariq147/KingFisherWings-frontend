import { VendorApiError } from '@/lib/vendorApiClient';

const GENERIC_VENDOR_MESSAGES = new Set([
  'vendor apis are not available yet.',
  'something went wrong.',
  'the requested vendor resource was not found.',
]);

function isGenericVendorMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  if (GENERIC_VENDOR_MESSAGES.has(trimmed.toLowerCase())) return true;
  return /^request failed with status code \d+$/i.test(trimmed);
}

export function isVendorApiUnavailable(err: unknown): boolean {
  if (!(err instanceof VendorApiError)) return false;
  return err.status === 404 || err.status === 501;
}

export function vendorErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof VendorApiError || err instanceof Error) {
    const msg = err.message.trim();
    if (msg && !isGenericVendorMessage(msg)) return msg;
  }
  if (isVendorApiUnavailable(err)) return 'Vendor APIs are not available yet.';
  if (err instanceof VendorApiError || err instanceof Error) {
    const msg = err.message.trim();
    if (msg) return msg;
  }
  return fallback;
}

/** Purchase invoice PDF — clearer than the generic vendor 404 copy. */
export function vendorInvoicePdfErrorMessage(
  err: unknown,
  fallback = 'Could not download invoice PDF.',
): string {
  if (err instanceof VendorApiError) {
    const msg = err.message.trim();
    if (/invoice pdf not available/i.test(msg)) {
      return (
        'No PDF is attached to this invoice yet. Draft or newly submitted invoices may not have a file until ' +
        'your forwarder posts the purchase invoice in ERP and generates the PDF. If you uploaded a PDF on submit, ' +
        'ask your forwarder to link it on the purchase invoice record.'
      );
    }
    if (err.status === 403) {
      return isGenericVendorMessage(msg)
        ? 'You do not have permission to download this invoice PDF. Ask your forwarder to enable Purchase invoice download under Vendor rights.'
        : msg;
    }
    if (err.status === 404 || err.status >= 500) {
      return isGenericVendorMessage(msg)
        ? 'PDF is not ready for this invoice yet. Your forwarder must generate or post the purchase invoice in ERP first.'
        : msg;
    }
    if (msg && !isGenericVendorMessage(msg)) return msg;
  }
  return vendorErrorMessage(err, fallback);
}
