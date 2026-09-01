import { axiosInstance } from '@/lib/axios';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { withGatewayRetry } from '@/lib/wakeApi';
import { DOCUMENTATION_API, type DocumentationUploadType } from '../api/documentation.api';
import type {
  AirTrackingParams,
  ApplyChargeTemplateDto,
  BoeListParams,
  BulkCostBatchDto,
  ChargeTemplateListParams,
  CgmVoyageDto,
  CreateBoeRecordDto,
  CreateChargeTemplateDto,
  CreateMpciFilingDto,
  DocumentationListParams,
  DocumentationRecord,
  DocumentationReportParams,
  ListResult,
  UpdateBoeRecordDto,
  UpdateCgmVoyageDto,
  UpdateChargeTemplateDto,
  UpdateDeliveryOrderDto,
} from '../types/documentation.types';
import { normalizeDocumentationRecord, normalizeMany } from '../utils/normalizeDocumentation';
import {
  formatDocumentationError,
  normalizeMeta,
  preparePayload,
  queryParams,
  unwrapEntity,
  unwrapList,
} from '../utils/documentationUnwrap';

async function listResource<T extends DocumentationRecord>(
  path: string,
  params: object,
  listKeys: string[] = [],
): Promise<ListResult<T>> {
  const res = await withGatewayRetry(() =>
    axiosInstance.get(path, { params: queryParams(params) }),
  );
  const raw = unwrapList(res.data, listKeys);
  const items = normalizeMany(raw.items, normalizeDocumentationRecord) as T[];
  return { items, meta: normalizeMeta(raw.meta, items.length, params as DocumentationListParams) };
}

async function getRecord(path: string): Promise<DocumentationRecord> {
  const res = await withGatewayRetry(() => axiosInstance.get(path));
  const item = normalizeDocumentationRecord(unwrapEntity(res.data));
  if (!item) throw new Error('Record not found.');
  return item;
}

async function mutateRecord(
  method: 'post' | 'patch' | 'delete',
  path: string,
  body?: object,
): Promise<DocumentationRecord | Record<string, unknown>> {
  const res = await withGatewayRetry(() => {
    if (method === 'delete') return axiosInstance.delete(path);
    if (method === 'patch') return axiosInstance.patch(path, body);
    return axiosInstance.post(path, body);
  });
  const raw = unwrapEntity(res.data);
  return (normalizeDocumentationRecord(raw) ?? (asObject(raw) ?? {})) as DocumentationRecord;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function downloadBlob(
  method: 'get' | 'post',
  path: string,
  body?: object,
  filename = 'download.bin',
): Promise<void> {
  const res = await withGatewayRetry(() =>
    method === 'get'
      ? axiosInstance.get(path, { responseType: 'blob' })
      : axiosInstance.post(path, body, { responseType: 'blob' }),
  );
  triggerBlobDownload(res.data as Blob, filename);
}

async function uploadFile(path: string, file: File): Promise<Record<string, unknown>> {
  const form = new FormData();
  form.append('file', file);
  const res = await withGatewayRetry(() =>
    axiosInstance.post(path, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  );
  return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
}

async function reportGet(path: string, params: object = {}): Promise<Record<string, unknown>> {
  const res = await withGatewayRetry(() =>
    axiosInstance.get(path, { params: queryParams(params) }),
  );
  return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
}

export const documentationBoeService = {
  async dashboard(params: BoeListParams = {}): Promise<ListResult<DocumentationRecord>> {
    try {
      return await listResource(DOCUMENTATION_API.boe.dashboard, params, ['boe', 'records']);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async pendingClaims(params: BoeListParams = {}): Promise<ListResult<DocumentationRecord>> {
    try {
      return await listResource(DOCUMENTATION_API.boe.pendingClaims, params, ['claims']);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async create(dto: CreateBoeRecordDto): Promise<DocumentationRecord> {
    try {
      return (await mutateRecord('post', DOCUMENTATION_API.boe.create, preparePayload(dto))) as DocumentationRecord;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async update(id: string, dto: UpdateBoeRecordDto): Promise<DocumentationRecord> {
    try {
      return (await mutateRecord('patch', DOCUMENTATION_API.boe.byId(id), preparePayload(dto))) as DocumentationRecord;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};

export const documentationBulkCostService = {
  async preview(dto: BulkCostBatchDto): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(DOCUMENTATION_API.bulkCosts.preview, preparePayload(dto)),
      );
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async create(dto: BulkCostBatchDto): Promise<DocumentationRecord> {
    try {
      return (await mutateRecord('post', DOCUMENTATION_API.bulkCosts.create, preparePayload(dto))) as DocumentationRecord;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async get(id: string): Promise<DocumentationRecord> {
    try {
      return await getRecord(DOCUMENTATION_API.bulkCosts.byId(id));
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};

export const documentationChargeTemplateService = {
  async list(params: ChargeTemplateListParams = {}): Promise<ListResult<DocumentationRecord>> {
    try {
      return await listResource(DOCUMENTATION_API.chargeTemplates.list, params, ['templates']);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async get(id: string): Promise<DocumentationRecord> {
    try {
      return await getRecord(DOCUMENTATION_API.chargeTemplates.byId(id));
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async create(dto: CreateChargeTemplateDto): Promise<DocumentationRecord> {
    try {
      return (await mutateRecord(
        'post',
        DOCUMENTATION_API.chargeTemplates.create,
        preparePayload(dto),
      )) as DocumentationRecord;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async update(id: string, dto: UpdateChargeTemplateDto): Promise<DocumentationRecord> {
    try {
      return (await mutateRecord(
        'patch',
        DOCUMENTATION_API.chargeTemplates.byId(id),
        preparePayload(dto),
      )) as DocumentationRecord;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await mutateRecord('delete', DOCUMENTATION_API.chargeTemplates.byId(id));
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async apply(id: string, dto: ApplyChargeTemplateDto): Promise<Record<string, unknown>> {
    try {
      return (await mutateRecord(
        'post',
        DOCUMENTATION_API.chargeTemplates.apply(id),
        preparePayload(dto),
      )) as Record<string, unknown>;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};

export const documentationDeliveryOrderService = {
  async closedJobs(params: DocumentationListParams = {}): Promise<ListResult<DocumentationRecord>> {
    try {
      return await listResource(DOCUMENTATION_API.deliveryOrders.closedJobs, params, ['jobs']);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async updateJob(jobId: string, dto: UpdateDeliveryOrderDto): Promise<DocumentationRecord> {
    try {
      return (await mutateRecord(
        'patch',
        DOCUMENTATION_API.deliveryOrders.updateJob(jobId),
        preparePayload(dto),
      )) as DocumentationRecord;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};

export const documentationEdiService = {
  bayanJobs: (params?: DocumentationListParams) =>
    listResource(DOCUMENTATION_API.edi.bayan.jobs, params ?? {}, ['jobs']),
  bayanShipments: (params?: DocumentationListParams) =>
    listResource(DOCUMENTATION_API.edi.bayan.shipments, params ?? {}, ['shipments']),
  bayanGenerate: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.bayan.generate(jobId)),
  bayanSubmit: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.bayan.submit(jobId)),
  bayanAmend: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.bayan.amend(jobId)),

  ccnJobs: (params?: DocumentationListParams) =>
    listResource(DOCUMENTATION_API.edi.ccn.jobs, params ?? {}, ['jobs']),
  ccnGenerateFwb: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.ccn.generateFwb(jobId)),
  ccnGenerateFhl: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.ccn.generateFhl(jobId)),
  ccnSubmit: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.ccn.submit(jobId)),

  cgmVessels: (params?: DocumentationListParams) =>
    listResource(DOCUMENTATION_API.edi.cgm.vessels, params ?? {}, ['vessels']),
  cgmCreate: (dto: CgmVoyageDto) =>
    mutateRecord('post', DOCUMENTATION_API.edi.cgm.vessels, preparePayload(dto)),
  cgmUpdate: (id: string, dto: UpdateCgmVoyageDto) =>
    mutateRecord('patch', DOCUMENTATION_API.edi.cgm.byId(id), preparePayload(dto)),
  cgmDelete: (id: string) => mutateRecord('delete', DOCUMENTATION_API.edi.cgm.byId(id)),
  cgmDownloadEdi: (id: string, filename = 'cgm-edi.txt') =>
    downloadBlob('post', DOCUMENTATION_API.edi.cgm.downloadEdi(id), undefined, filename),

  dubaiEqoJobs: (params?: DocumentationListParams) =>
    listResource(DOCUMENTATION_API.edi.eqo.dubai.jobs, params ?? {}, ['jobs']),
  dubaiEqoGenerateBol: (jobId: string) =>
    mutateRecord('post', DOCUMENTATION_API.edi.eqo.dubai.generateBol(jobId)),
  dubaiEqoSubmit: (jobId: string) =>
    mutateRecord('post', DOCUMENTATION_API.edi.eqo.dubai.submit(jobId)),

  omanEqoJobs: (params?: DocumentationListParams) =>
    listResource(DOCUMENTATION_API.edi.eqo.oman.jobs, params ?? {}, ['jobs']),
  omanEqoGenerateBol: (jobId: string) =>
    mutateRecord('post', DOCUMENTATION_API.edi.eqo.oman.generateBol(jobId)),
  omanEqoSubmit: (jobId: string) =>
    mutateRecord('post', DOCUMENTATION_API.edi.eqo.oman.submit(jobId)),

  ialJobs: (params?: DocumentationListParams) =>
    listResource(DOCUMENTATION_API.edi.ial.jobs, params ?? {}, ['jobs']),
  ialGenerate: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.ial.generate(jobId)),
  ialSubmit: (jobId: string) => mutateRecord('post', DOCUMENTATION_API.edi.ial.submit(jobId)),

  downloadSubmission: (submissionId: string, filename = 'edi-submission.txt') =>
    downloadBlob('get', DOCUMENTATION_API.edi.downloadSubmission(submissionId), undefined, filename),
};

export const documentationJobTransferService = {
  async exportJobs(body?: object): Promise<void> {
    try {
      await downloadBlob('post', DOCUMENTATION_API.jobTransfer.export, body, 'documentation-jobs-export.zip');
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async importJobs(file: File): Promise<Record<string, unknown>> {
    try {
      return await uploadFile(DOCUMENTATION_API.jobTransfer.import, file);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};

export const documentationMpciService = {
  async list(params: DocumentationListParams = {}): Promise<ListResult<DocumentationRecord>> {
    try {
      return await listResource(DOCUMENTATION_API.mpci.list, params, ['filings']);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async create(dto: CreateMpciFilingDto = {}): Promise<DocumentationRecord> {
    try {
      return (await mutateRecord(
        'post',
        DOCUMENTATION_API.mpci.create,
        preparePayload(dto),
      )) as DocumentationRecord;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async prepare(id: string): Promise<Record<string, unknown>> {
    try {
      return (await mutateRecord('post', DOCUMENTATION_API.mpci.prepare(id))) as Record<string, unknown>;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async status(id: string): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(DOCUMENTATION_API.mpci.status(id)));
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async submit(id: string): Promise<Record<string, unknown>> {
    try {
      return (await mutateRecord('post', DOCUMENTATION_API.mpci.submit(id))) as Record<string, unknown>;
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};

export const documentationReportService = {
  summary: (params?: DocumentationReportParams) => reportGet(DOCUMENTATION_API.reports.summary, params ?? {}),
  jobsList: (params?: DocumentationReportParams) => reportGet(DOCUMENTATION_API.reports.jobsList, params ?? {}),
  etaFollowup: (params?: DocumentationReportParams) =>
    reportGet(DOCUMENTATION_API.reports.etaFollowup, params ?? {}),
  etdFollowup: (params?: DocumentationReportParams) =>
    reportGet(DOCUMENTATION_API.reports.etdFollowup, params ?? {}),
  manifestStatus: (params?: DocumentationReportParams) =>
    reportGet(DOCUMENTATION_API.reports.manifestStatus, params ?? {}),
};

export const documentationTrackingService = {
  async air(params: AirTrackingParams): Promise<Record<string, unknown>> {
    try {
      return await reportGet(DOCUMENTATION_API.tracking.air, params);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};

export const documentationUploadService = {
  uploadTypePath(type: DocumentationUploadType): string {
    const map: Record<DocumentationUploadType, string> = {
      'container-numbers': DOCUMENTATION_API.uploads.containerNumbers,
      'container-transport': DOCUMENTATION_API.uploads.containerTransport,
      'dpworld-tracking': DOCUMENTATION_API.uploads.dpworldTracking,
      'truck-positions': DOCUMENTATION_API.uploads.truckPositions,
    };
    return map[type];
  },

  async upload(type: DocumentationUploadType, file: File): Promise<Record<string, unknown>> {
    try {
      return await uploadFile(this.uploadTypePath(type), file);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async downloadTemplate(type: DocumentationUploadType, filename?: string): Promise<void> {
    try {
      await downloadBlob('get', DOCUMENTATION_API.uploads.template(type), undefined, filename ?? `${type}-template.xlsx`);
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },

  async batchErrors(batchId: string): Promise<Record<string, unknown>> {
    try {
      return await reportGet(DOCUMENTATION_API.uploads.batchErrors(batchId));
    } catch (error) {
      throw formatDocumentationError(error);
    }
  },
};
