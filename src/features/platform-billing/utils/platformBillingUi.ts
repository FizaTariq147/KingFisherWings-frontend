import { extractCheckoutUrl } from './billingApiHelpers';

export function openBillingCheckoutUrl(raw: unknown): void {
  const url = extractCheckoutUrl(raw);
  if (url.startsWith('http')) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function formatBillingScalar(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
  if (typeof value === 'string') return value;
  return String(value);
}

const HIDDEN_FIELD_KEYS = new Set(['raw']);

export function collectDisplayFields(
  normalized: Record<string, unknown>,
  raw?: Record<string, unknown>,
): { key: string; label: string; value: string }[] {
  const seen = new Set<string>();
  const rows: { key: string; label: string; value: string }[] = [];

  const add = (key: string, value: unknown) => {
    const normKey = key.toLowerCase().replace(/_/g, '');
    if (seen.has(normKey)) return;
    if (HIDDEN_FIELD_KEYS.has(key)) return;
    if (value === undefined) return;
    if (typeof value === 'object' && value !== null) return;
    seen.add(normKey);
    rows.push({
      key,
      label: humanizeFieldKey(key),
      value: formatBillingScalar(value),
    });
  };

  for (const [key, value] of Object.entries(normalized)) {
    add(key, value);
  }

  if (raw) {
    for (const [key, value] of Object.entries(raw)) {
      add(key, value);
    }
  }

  return rows;
}

function humanizeFieldKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function statusBadgeVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = (status ?? '').toLowerCase();
  if (['paid', 'active', 'verified', 'succeeded', 'success', 'completed'].some((x) => s.includes(x))) {
    return 'success';
  }
  if (['pending', 'open', 'processing', 'draft', 'trial'].some((x) => s.includes(x))) {
    return 'warning';
  }
  if (['failed', 'rejected', 'cancelled', 'canceled', 'overdue', 'void'].some((x) => s.includes(x))) {
    return 'danger';
  }
  if (['sent', 'partial'].some((x) => s.includes(x))) {
    return 'info';
  }
  return 'neutral';
}
