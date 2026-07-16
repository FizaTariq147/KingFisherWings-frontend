import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { isUuid } from '@/lib/isUuid';
import { GL_FINANCIAL_REPORTS_API } from '../api/financialReports.api';
import type { FinancialReportResult, ReportCommonParams, VatReturnParams } from '../types/financialReports.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw.filter((x): x is Record<string, unknown> => !!asRecord(x));
  const r = asRecord(raw);
  if (!r) return [];
  for (const key of ['rows', 'items', 'lines', 'data', 'results']) {
    if (Array.isArray(r[key])) {
      return (r[key] as unknown[]).filter((x): x is Record<string, unknown> => !!asRecord(x));
    }
  }
  const nested = asRecord(r.data);
  if (nested) {
    for (const key of ['rows', 'items', 'lines']) {
      if (Array.isArray(nested[key])) {
        return (nested[key] as unknown[]).filter((x): x is Record<string, unknown> => !!asRecord(x));
      }
    }
  }
  return r ? [r] : [];
}

function queryCommon(params: ReportCommonParams): Record<string, string | boolean> {
  const q: Record<string, string | boolean> = {};
  if (params.from_date?.trim()) q.from_date = params.from_date.trim();
  if (params.to_date?.trim()) q.to_date = params.to_date.trim();
  if (params.as_of?.trim()) q.as_of = params.as_of.trim();
  if (params.company_id && isUuid(params.company_id)) q.company_id = params.company_id;
  if (typeof params.hide_zero === 'boolean') q.hide_zero = params.hide_zero;
  return q;
}

async function getReport(path: string, params: Record<string, string | boolean>): Promise<FinancialReportResult> {
  const { data } = await withGatewayRetry(() => axiosInstance.get(path, { params }));
  return { rows: unwrapRows(data), raw: data };
}

export const financialReportsService = {
  trialBalance(params: ReportCommonParams = {}) {
    return getReport(GL_FINANCIAL_REPORTS_API.trialBalance, queryCommon(params));
  },
  balanceSheet(params: ReportCommonParams = {}) {
    return getReport(GL_FINANCIAL_REPORTS_API.balanceSheet, queryCommon(params));
  },
  profitAndLoss(params: ReportCommonParams = {}) {
    return getReport(GL_FINANCIAL_REPORTS_API.profitAndLoss, queryCommon(params));
  },
  cashFlow(params: ReportCommonParams = {}) {
    return getReport(GL_FINANCIAL_REPORTS_API.cashFlow, queryCommon(params));
  },
  vatReturn(params: VatReturnParams) {
    const q: Record<string, string> = {
      from_date: params.from_date,
      to_date: params.to_date,
    };
    if (params.company_id && isUuid(params.company_id)) q.company_id = params.company_id;
    return getReport(GL_FINANCIAL_REPORTS_API.vatReturn, q);
  },
};
