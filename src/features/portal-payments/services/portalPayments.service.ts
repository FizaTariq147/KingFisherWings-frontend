import { portalApiClient } from '@/lib/portalApiClient';
import { asRecord, pickString, unwrapData } from '@/features/portal-shared/normalize';
import { unwrap } from '@/features/platform-billing/utils/billingApiHelpers';
import { PORTAL_PAYMENTS_API } from '../api/portalPayments.api';
import type {
  PortalOnlinePaymentListResult,
  PortalPaymentListParams,
  PortalPaymentListResult,
  PortalStripeConfigView,
} from '../types/portalPayments.types';
import {
  normalizeOnlinePaymentItem,
  normalizeOnlinePaymentList,
  normalizePaymentList,
} from '../utils/normalizePortalPayments';
import { normalizeFinancePaymentsSummary } from '@/features/payment-proofs/utils/normalizePaymentProof';
import type { FinanceOpenItemsSummary } from '@/features/payment-proofs/types/paymentProof.types';

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: number }).status;
  return status === 404 || status === 501;
}

export const portalPaymentsService = {
  async list(params: PortalPaymentListParams = {}): Promise<PortalPaymentListResult> {
    try {
      const res = await portalApiClient.get(PORTAL_PAYMENTS_API.list, { params });
      return normalizePaymentList(res.data, params);
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      try {
        const online = await this.listOnline(params);
        return {
          items: online.items.map(({ raw: _raw, checkoutUrl: _url, invoiceId, ...item }) => item),
          meta: online.meta,
        };
      } catch {
        return { items: [], meta: { page: 1, limit: params.limit ?? 20, total: 0, totalPages: 1 } };
      }
    }
  },

  async summary(): Promise<FinanceOpenItemsSummary> {
    try {
      const res = await portalApiClient.get(PORTAL_PAYMENTS_API.summary);
      return normalizeFinancePaymentsSummary(res.data);
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      return normalizeFinancePaymentsSummary({});
    }
  },

  async listOnline(params: PortalPaymentListParams = {}): Promise<PortalOnlinePaymentListResult> {
    const res = await portalApiClient.get(PORTAL_PAYMENTS_API.online, { params });
    return normalizeOnlinePaymentList(res.data, params);
  },

  async getOnline(id: string) {
    const res = await portalApiClient.get(PORTAL_PAYMENTS_API.onlineDetail(id));
    const item = normalizeOnlinePaymentItem(unwrap(res.data));
    if (!item) throw new Error('Online payment not found.');
    return item;
  },

  async cancel(id: string, body: Record<string, unknown> = {}) {
    const res = await portalApiClient.post(PORTAL_PAYMENTS_API.cancel(id), body);
    return unwrap(res.data);
  },

  async retry(id: string, body: Record<string, unknown> = {}) {
    const res = await portalApiClient.post(PORTAL_PAYMENTS_API.retry(id), body);
    return unwrap(res.data);
  },

  async getStripeConfig(): Promise<PortalStripeConfigView> {
    const res = await portalApiClient.get(PORTAL_PAYMENTS_API.stripeConfig);
    const r = asRecord(unwrapData(res.data)) ?? {};
    return {
      publishableKey: pickString(r.publishable_key, r.publishableKey) || undefined,
      mode: pickString(r.mode, r.environment) || undefined,
      raw: r,
    };
  },
};
