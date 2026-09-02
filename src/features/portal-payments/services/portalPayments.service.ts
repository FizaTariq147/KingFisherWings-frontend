import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_PAYMENTS_API } from '../api/portalPayments.api';
import type { PortalPaymentListParams, PortalPaymentListResult } from '../types/portalPayments.types';
import { normalizePaymentList } from '../utils/normalizePortalPayments';
import { normalizeFinancePaymentsSummary } from '@/features/payment-proofs/utils/normalizePaymentProof';
import type { FinanceOpenItemsSummary } from '@/features/payment-proofs/types/paymentProof.types';

export const portalPaymentsService = {
  async list(params: PortalPaymentListParams = {}): Promise<PortalPaymentListResult> {
    const res = await portalApiClient.get(PORTAL_PAYMENTS_API.list, { params });
    return normalizePaymentList(res.data, params);
  },
  async summary(): Promise<FinanceOpenItemsSummary> {
    const res = await portalApiClient.get(PORTAL_PAYMENTS_API.summary);
    return normalizeFinancePaymentsSummary(res.data);
  },
};
