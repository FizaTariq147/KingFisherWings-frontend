import { asRecord, pickString, unwrapData } from '@/features/portal-shared/normalize';

export { asRecord, pickString, unwrapData };

export function unwrap(raw: unknown): unknown {
  return unwrapData(raw);
}

export function asList(data: unknown, listKeys: string[] = ['items', 'results', 'data', 'plans', 'invoices', 'payments', 'events']): Record<string, unknown>[] {
  const value = unwrap(data);
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  const record = asRecord(value);
  if (!record) return [];
  for (const key of listKeys) {
    if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
  }
  return [];
}

export function extractCheckoutUrl(raw: unknown): string {
  const root = asRecord(raw) ?? {};
  const data = asRecord(unwrap(raw)) ?? root;
  return pickString(
    data.checkout_url,
    data.checkoutUrl,
    data.url,
    data.session_url,
    data.sessionUrl,
    root.checkout_url,
    root.checkoutUrl,
    root.url,
  );
}

export interface CheckoutSessionResult {
  raw: Record<string, unknown>;
  checkoutUrl: string;
}

export function normalizeCheckoutSession(raw: unknown): CheckoutSessionResult {
  const record = asRecord(unwrap(raw)) ?? asRecord(raw) ?? {};
  return { raw: record, checkoutUrl: extractCheckoutUrl(raw) };
}
