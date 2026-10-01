import { pickBoolean } from '@/features/portal-shared/normalize';
import { openBillingCheckoutUrl } from '@/features/platform-billing/utils/platformBillingUi';
import type { PortalStripeConfigView } from '../types/portalPayments.types';

export { openBillingCheckoutUrl };

/** Gate Pay Now from GET /portal/payments/stripe/config (and invoice-scoped equivalent). */
export function isPortalOnlinePayAvailable(config?: PortalStripeConfigView | null): boolean {
  if (!config) return false;
  const r = config.raw ?? {};
  const enabled = pickBoolean(
    r.enabled,
    r.is_enabled,
    r.isEnabled,
    r.online_payments_enabled,
    r.onlinePaymentsEnabled,
    r.stripe_enabled,
    r.stripeEnabled,
  );
  const available = pickBoolean(
    r.online_pay_available,
    r.onlinePayAvailable,
    r.online_pay_enabled,
    r.onlinePayEnabled,
  );
  if (enabled === false || available === false) return false;
  const hasKey = Boolean(config.publishableKey?.trim());
  if (enabled === true || available === true) return hasKey || available === true;
  return hasKey;
}

export function isPendingLikePaymentStatus(status?: string): boolean {
  const s = (status ?? '').toLowerCase();
  if (!s) return false;
  return ['pending', 'processing', 'open', 'requires', 'awaiting', 'initiated', 'incomplete'].some(
    (x) => s.includes(x),
  );
}

export function canCancelPortalOnlinePayment(status?: string): boolean {
  const s = (status ?? '').toLowerCase();
  if (!s) return false;
  if (
    ['paid', 'succeeded', 'success', 'completed', 'cancelled', 'canceled', 'failed', 'refunded', 'void'].some(
      (x) => s.includes(x),
    )
  ) {
    return false;
  }
  return isPendingLikePaymentStatus(status);
}

export function canRetryPortalOnlinePayment(status?: string): boolean {
  const s = (status ?? '').toLowerCase();
  if (!s) return false;
  return ['failed', 'cancelled', 'canceled', 'expired', 'declined'].some((x) => s.includes(x));
}

export function portalPaymentStatusBadgeVariant(
  status?: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = (status ?? '').toLowerCase();
  if (['paid', 'succeeded', 'success', 'completed'].some((x) => s.includes(x))) return 'success';
  if (isPendingLikePaymentStatus(status)) return 'warning';
  if (['failed', 'rejected', 'cancelled', 'canceled', 'void', 'expired'].some((x) => s.includes(x))) {
    return 'danger';
  }
  return 'neutral';
}

export function invoiceEligibleForOnlinePay(invoice: {
  status?: string;
  outstandingBalance?: number;
}): boolean {
  const st = (invoice.status ?? '').toUpperCase();
  if (['PAID', 'CANCELLED', 'VOID'].includes(st)) return false;
  if (invoice.outstandingBalance != null && invoice.outstandingBalance <= 0) return false;
  return true;
}
