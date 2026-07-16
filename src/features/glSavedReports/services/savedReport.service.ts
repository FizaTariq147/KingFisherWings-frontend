import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { isUuid } from '@/lib/isUuid';
import { SAVED_REPORT_API } from '../api/savedReport.api';
import {
  normalizeSavedReport,
  normalizeSavedReports,
} from '../utils/normalizeSavedReport';
import {
  prepareCreateSavedReportPayload,
  prepareUpdateSavedReportPayload,
} from '../utils/prepareSavedReportPayload';
import type {
  CreateSavedReportDto,
  SavedReport,
  SavedReportListParams,
  UpdateSavedReportDto,
} from '../types/savedReport.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const r = asRecord(raw);
  if (!r) return [];
  if (Array.isArray(r.items)) return r.items;
  if (Array.isArray(r.data)) return r.data;
  const nested = asRecord(r.data);
  if (nested && Array.isArray(nested.items)) return nested.items;
  return [];
}

function unwrapEntity(raw: unknown): unknown {
  const r = asRecord(raw);
  if (!r) return raw;
  if (r.data) return r.data;
  if (r.saved_report) return r.saved_report;
  return raw;
}

function extractId(raw: unknown): string | null {
  const r = asRecord(unwrapEntity(raw));
  if (!r) return null;
  const id = r.id;
  if (typeof id === 'string' && isUuid(id.trim())) return id.trim();
  return null;
}

function formatAxiosError(error: unknown): Error {
  const e = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const msg = e.response?.data?.message;
  const parsed =
    (Array.isArray(msg) ? msg.map(String).join('; ') : undefined) ||
    (typeof msg === 'string' ? msg : undefined) ||
    e.response?.data?.error ||
    e.message ||
    'Request failed';
  return new Error(parsed);
}

function assertId(id: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid saved report id.');
}

function buildListQuery(params: SavedReportListParams): Record<string, string | boolean> {
  const q: Record<string, string | boolean> = {};
  if (params.report_type) q.report_type = params.report_type;
  if (params.shared_only != null) q.shared_only = params.shared_only;
  return q;
}

export const savedReportService = {
  async list(params: SavedReportListParams = {}): Promise<SavedReport[]> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get(SAVED_REPORT_API.list, { params: buildListQuery(params) }),
      );
      return normalizeSavedReports(unwrapList(data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<SavedReport> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get(SAVED_REPORT_API.byId(id)),
      );
      const entity = normalizeSavedReport(unwrapEntity(data));
      if (!entity) throw new Error('Saved report not found.');
      return entity;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateSavedReportDto): Promise<SavedReport> {
    const payload = prepareCreateSavedReportPayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post(SAVED_REPORT_API.create, payload),
      );
      const created = normalizeSavedReport(unwrapEntity(data));
      if (created) return created;
      const id = extractId(data);
      if (id) return savedReportService.getById(id);
      throw new Error('Create succeeded but saved report could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateSavedReportDto): Promise<SavedReport> {
    assertId(id);
    const payload = prepareUpdateSavedReportPayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch(SAVED_REPORT_API.byId(id), payload),
      );
      const updated = normalizeSavedReport(unwrapEntity(data));
      if (updated) return updated;
      return savedReportService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async remove(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(SAVED_REPORT_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
