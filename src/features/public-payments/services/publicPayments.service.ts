import axios from 'axios';
import { PUBLIC_PAYMENTS_API } from '../api/publicPayments.api';
import type { PublicPayCheckoutDto } from '../types/publicPayments.types';
import {
  normalizePublicPayCheckout,
  normalizePublicPaySummary,
} from '../utils/normalizePublicPayments';

/** Unauthenticated client — Bearer tokens must not be sent on public pay links. */
const publicPayClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 120_000,
});

export const publicPaymentsService = {
  async getSummary(token: string) {
    const res = await publicPayClient.get(PUBLIC_PAYMENTS_API.summary(token));
    return normalizePublicPaySummary(res.data, token);
  },

  async checkout(token: string, dto: PublicPayCheckoutDto = {}) {
    const body =
      dto.amount != null && Number.isFinite(dto.amount) ? { amount: dto.amount } : {};
    const res = await publicPayClient.post(PUBLIC_PAYMENTS_API.checkout(token), body);
    return normalizePublicPayCheckout(res.data);
  },
};
