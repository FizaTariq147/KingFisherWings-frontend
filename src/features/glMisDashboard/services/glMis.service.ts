import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { isUuid } from '@/lib/isUuid';
import { GL_MIS_API } from '../api/glMis.api';
import type { MisParams, MisProfitabilityParams, MisResult } from '../types/glMis.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw.filter((x): x is Record<string, unknown> => !!asRecord(x));
  const r = asRecord(raw);
  if (!r) return [];
  for (const key of ['rows', 'items', 'data', 'results']) {
    if (Array.isArray(r[key])) {
      return (r[key] as unknown[]).filter((x): x is Record<string, unknown> => !!asRecord(x));
    }
  }
  const nested = asRecord(r.data);
  if (nested) {
    for (const key of ['rows', 'items']) {
      if (Array.isArray(nested[key])) {
        return (nested[key] as unknown[]).filter((x): x is Record<string, unknown> => !!asRecord(x));
      }
    }
  }
  return r ? [r] : [];
}

function queryParams(params: MisParams): Record<string, string> {
  const q: Record<string, string> = {};
  if (params.from_date?.trim()) q.from_date = params.from_date.trim();
  if (params.to_date?.trim()) q.to_date = params.to_date.trim();
  if (params.company_id && isUuid(params.company_id)) q.company_id = params.company_id;
  if (params.branch_id && isUuid(params.branch_id)) q.branch_id = params.branch_id;
  return q;
}

async function load(path: string, params: Record<string, string>) {
  const { data } = await withGatewayRetry(() => axiosInstance.get(path, { params }));
  const rows = unwrapRows(data);
  return { rows, raw: data } satisfies MisResult;
}

export const glMisService = {
  dashboard(params: MisParams = {}) {
    return load(GL_MIS_API.dashboard, queryParams(params));
  },
  profitability(params: MisProfitabilityParams = {}) {
    const q = queryParams(params);
    if (params.group_by) q.group_by = params.group_by;
    return load(GL_MIS_API.profitability, q);
  },
  operational(params: MisParams = {}) {
    return load(GL_MIS_API.operational, queryParams(params));
  },
};
