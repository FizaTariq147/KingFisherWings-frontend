export type VendorDashboardPeriod = 'today' | 'week' | 'month';

export function firstName(fullName?: string, email?: string): string {
  const part = fullName?.trim().split(/\s+/)[0];
  if (part) return part;
  if (email?.includes('@')) return email.split('@')[0] ?? 'there';
  return 'there';
}

export function formatVendorDashboardDate(now = new Date()): string {
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
  const day = now.getDate();
  const month = now.toLocaleDateString(undefined, { month: 'long' }).toUpperCase();
  const year = now.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatShortDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function compactVendorAmount(value?: number, currency?: string): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const code = currency ? `${currency} ` : '';
  if (abs >= 1_000_000) return `${code}${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${code}${(value / 1_000).toFixed(1)}k`;
  return `${code}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatVendorAmount(value?: number): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export interface VendorTaskItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
}
