import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { superAdminApiClient } from '@/lib/superAdminApiClient';
import { ApiError } from '@/lib/superAdminApiClient';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
}

export interface SerializedApiError {
  status: number;
  message: string;
  data?: unknown;
}

export function serializeApiError(error: unknown): SerializedApiError {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message };
  }

  const axiosError = error as AxiosError;
  if (axiosError.response) {
    const data = axiosError.response.data;
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : axiosError.message;

    return {
      status: axiosError.response.status,
      message,
      data,
    };
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : 'Request failed',
  };
}

/** RTK Query base query — delegates to superAdminApiClient (JWT interceptors built-in). */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, SerializedApiError> =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await superAdminApiClient({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (error) {
      return { error: serializeApiError(error) };
    }
  };
