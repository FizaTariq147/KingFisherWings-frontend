import { superAdminApiClient } from '@/lib/superAdminApiClient';
import { asList, unwrap } from '@/features/online-payments/utils/billingApiHelpers';
import { PLATFORM_FINANCE_API } from '../api/platformFinance.api';

export const platformFinanceService = {
  async getStatus(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.status, { params });
    return unwrap(res.data);
  },

  async getApAging(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.apAging, { params });
    return unwrap(res.data);
  },

  async getApOpenItems(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.apOpenItems, { params });
    return asList(res.data);
  },

  async getApStatement(partyId: string, params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.apStatement(partyId), {
      params,
    });
    return unwrap(res.data);
  },

  async getArAging(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.arAging, { params });
    return unwrap(res.data);
  },

  async getArOpenItems(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.arOpenItems, { params });
    return asList(res.data);
  },

  async getArStatement(partyId: string, params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.arStatement(partyId), {
      params,
    });
    return unwrap(res.data);
  },

  async getArTenantStatement(tenantId: string, params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(
      PLATFORM_FINANCE_API.arTenantStatement(tenantId),
      { params },
    );
    return unwrap(res.data);
  },

  async listPayments(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.payments, { params });
    return asList(res.data);
  },

  async createPayment(body: Record<string, unknown>) {
    const res = await superAdminApiClient.post(PLATFORM_FINANCE_API.payments, body);
    return unwrap(res.data);
  },

  async postPayment(id: string, body: Record<string, unknown> = {}) {
    const res = await superAdminApiClient.post(PLATFORM_FINANCE_API.paymentPost(id), body);
    return unwrap(res.data);
  },

  async getReceivables(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.receivables, { params });
    return asList(res.data);
  },

  async listVendorBills(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.vendorBills, { params });
    return asList(res.data);
  },

  async createVendorBill(body: Record<string, unknown>) {
    const res = await superAdminApiClient.post(PLATFORM_FINANCE_API.vendorBills, body);
    return unwrap(res.data);
  },

  async listVouchers(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.vouchers, { params });
    return asList(res.data);
  },

  async getVoucher(id: string, params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.voucher(id), { params });
    return unwrap(res.data);
  },

  async getBalanceSheet(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.reports.balanceSheet, {
      params,
    });
    return unwrap(res.data);
  },

  async getCashFlow(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.reports.cashFlow, { params });
    return unwrap(res.data);
  },

  async getProfitAndLoss(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.reports.profitAndLoss, {
      params,
    });
    return unwrap(res.data);
  },

  async getTrialBalance(params?: Record<string, unknown>) {
    const res = await superAdminApiClient.get(PLATFORM_FINANCE_API.reports.trialBalance, {
      params,
    });
    return unwrap(res.data);
  },
};
