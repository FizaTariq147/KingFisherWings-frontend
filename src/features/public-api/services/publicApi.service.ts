import type { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/lib/axios';
import { asList, unwrap } from '@/features/online-payments/utils/billingApiHelpers';
import { PUBLIC_API_V1 } from '../api/publicApi.api';

function apiKeyConfig(apiKey?: string, params?: Record<string, unknown>): AxiosRequestConfig {
  const config: AxiosRequestConfig = { params };
  const key = apiKey?.trim();
  if (key) {
    config.headers = { 'X-Api-Key': key };
  }
  return config;
}

export const publicApiV1Service = {
  async health(config?: AxiosRequestConfig) {
    const res = await axiosInstance.get(PUBLIC_API_V1.health, config);
    return unwrap(res.data);
  },

  async listJobs(params?: Record<string, unknown>, apiKey?: string) {
    const res = await axiosInstance.get(
      PUBLIC_API_V1.jobs,
      apiKeyConfig(apiKey, params),
    );
    return asList(res.data);
  },

  async getJob(id: string, params?: Record<string, unknown>, apiKey?: string) {
    const res = await axiosInstance.get(
      PUBLIC_API_V1.job(id),
      apiKeyConfig(apiKey, params),
    );
    return unwrap(res.data);
  },

  async track(token: string, params?: Record<string, unknown>) {
    const res = await axiosInstance.get(PUBLIC_API_V1.track(token), { params });
    return unwrap(res.data);
  },
};
