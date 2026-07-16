import axios from 'axios';
import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { SEARCH_API } from '../api/search.api';
import {
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MAX_LIMIT,
  SEARCH_MIN_CHARS,
} from '../constants/search.constants';
import type { GlobalSearchParams, GlobalSearchResult } from '../types/search.types';
import { normalizeGlobalSearch } from '../utils/normalizeSearch';

function formatAxiosError(error: unknown): Error {
  if (axios.isCancel(error)) throw error;
  const axiosErr = error as {
    code?: string;
    name?: string;
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  if (axiosErr.code === 'ERR_CANCELED' || axiosErr.name === 'CanceledError') {
    throw error;
  }
  if (error instanceof Error && !axiosErr.response) return error;
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Search failed');
}

/** Build query object using exact Swagger param names; omit empty values. */
export function buildSearchQuery(params: GlobalSearchParams): Record<string, string | number> {
  const q = params.q.trim();
  const query: Record<string, string | number> = { q };

  let limit = params.limit ?? SEARCH_DEFAULT_LIMIT;
  if (limit < 1) limit = 1;
  if (limit > SEARCH_MAX_LIMIT) limit = SEARCH_MAX_LIMIT;
  query.limit = limit;

  const optionalKeys: Array<keyof GlobalSearchParams> = [
    'types',
    'party_id',
    'customer_id',
    'shipper_id',
    'consignee_id',
    'job_type',
    'status',
    'origin_port_id',
    'dest_port_id',
    'hawb_number',
    'mawb_number',
    'hbl_number',
    'mbl_number',
    'booking_number',
    'container_number',
    'invoice_number',
    'quotation_number',
    'etd_from',
    'etd_to',
    'eta_from',
    'eta_to',
    'created_from',
    'created_to',
    'salesperson_id',
    'branch_id',
    'hs_code',
  ];

  for (const key of optionalKeys) {
    const value = params[key];
    if (value == null) continue;
    const str = String(value).trim();
    if (!str) continue;
    query[key] = str;
  }

  return query;
}

export function assertSearchQuery(q: string): string {
  const trimmed = q.trim();
  if (!trimmed) throw new Error('Enter a search term');
  if (trimmed.length < SEARCH_MIN_CHARS) {
    throw new Error(`Enter at least ${SEARCH_MIN_CHARS} characters`);
  }
  return trimmed;
}

export const searchService = {
  async search(
    params: GlobalSearchParams,
    options?: { signal?: AbortSignal },
  ): Promise<GlobalSearchResult> {
    const q = assertSearchQuery(params.q);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(SEARCH_API.search, {
          params: buildSearchQuery({ ...params, q }),
          signal: options?.signal,
        }),
      );
      return normalizeGlobalSearch(res.data, q);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
