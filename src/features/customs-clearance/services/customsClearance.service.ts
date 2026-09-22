import { axiosInstance } from '@/lib/axios';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CUSTOMS_CLEARANCE_API } from '../api/customsClearance.api';
import type {
  CcChecklistItem,
  CcDashboardStats,
  CcDeclaration,
  CcDetails,
  CcFiling,
  CcFinancialSummary,
  CcLine,
  CcLinkFreight,
  CcQuery,
  CcQueueResult,
  CcStageActionDto,
  CcStatus,
  ClassifyCcLineDto,
  CreateCcLineDto,
  CreateCcQueryDto,
  DutyPaymentRequestDto,
  HsValidateDto,
  HsValidateResult,
  LinkFreightDto,
  UpdateCcChecklistItemDto,
  UpdateCcDetailsDto,
  UpdateCcFilingDto,
  UpdateCcLineDto,
  UpdateCcQueryDto,
  UpsertCcDeclarationDto,
} from '../types/customsClearance.types';
import {
  normalizeCcChecklist,
  normalizeCcChecklistItem,
  normalizeCcDashboard,
  normalizeCcDeclaration,
  normalizeCcDetails,
  normalizeCcFiling,
  normalizeCcFinancialSummary,
  normalizeCcLine,
  normalizeCcLines,
  normalizeCcLinkFreight,
  normalizeCcQueries,
  normalizeCcQuery,
  normalizeCcQueue,
  normalizeCcStatus,
  normalizeHsValidate,
  prepareCcPayload,
  unwrapEntity,
} from '../utils/normalizeCustomsClearance';

function assertJobId(id: string) {
  if (!isUuid(id)) throw new Error('Invalid job id.');
}

function formatError(error: unknown): Error {
  return new Error(extractAxiosErrorDetail(error));
}

async function getRaw(url: string, params?: object): Promise<unknown> {
  const res = await withGatewayRetry(() =>
    axiosInstance.get<unknown>(url, params ? { params: prepareCcPayload(params as Record<string, unknown>) } : undefined),
  );
  return res.data;
}

async function postRaw(url: string, body?: object): Promise<unknown> {
  const res = await withGatewayRetry(() =>
    axiosInstance.post<unknown>(
      url,
      body ? prepareCcPayload(body as Record<string, unknown>) : undefined,
    ),
  );
  return res.data;
}

async function patchRaw(url: string, body?: object): Promise<unknown> {
  const res = await withGatewayRetry(() =>
    axiosInstance.patch<unknown>(
      url,
      body ? prepareCcPayload(body as Record<string, unknown>) : {},
    ),
  );
  return res.data;
}

async function putRaw(url: string, body?: object): Promise<unknown> {
  const res = await withGatewayRetry(() =>
    axiosInstance.put<unknown>(
      url,
      body ? prepareCcPayload(body as Record<string, unknown>) : {},
    ),
  );
  return res.data;
}

async function deleteRaw(url: string): Promise<unknown> {
  const res = await withGatewayRetry(() => axiosInstance.delete<unknown>(url));
  return res.data;
}

export const customsClearanceService = {
  async dashboard(params: Record<string, unknown> = {}): Promise<CcDashboardStats> {
    try {
      return normalizeCcDashboard(await getRaw(CUSTOMS_CLEARANCE_API.dashboard, params));
    } catch (error) {
      throw formatError(error);
    }
  },

  async queue(params: Record<string, unknown> = {}): Promise<CcQueueResult> {
    try {
      return normalizeCcQueue(await getRaw(CUSTOMS_CLEARANCE_API.queue, params));
    } catch (error) {
      throw formatError(error);
    }
  },

  async getDetails(jobId: string): Promise<CcDetails> {
    assertJobId(jobId);
    try {
      return normalizeCcDetails(await getRaw(CUSTOMS_CLEARANCE_API.details(jobId)), jobId);
    } catch (error) {
      throw formatError(error);
    }
  },

  async updateDetails(jobId: string, dto: UpdateCcDetailsDto): Promise<CcDetails> {
    assertJobId(jobId);
    try {
      return normalizeCcDetails(
        await patchRaw(CUSTOMS_CLEARANCE_API.details(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async open(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(await postRaw(CUSTOMS_CLEARANCE_API.open(jobId), dto), jobId);
    } catch (error) {
      throw formatError(error);
    }
  },

  async getStatus(jobId: string): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(await getRaw(CUSTOMS_CLEARANCE_API.status(jobId)), jobId);
    } catch (error) {
      throw formatError(error);
    }
  },

  async listLines(jobId: string): Promise<CcLine[]> {
    assertJobId(jobId);
    try {
      return normalizeCcLines(await getRaw(CUSTOMS_CLEARANCE_API.lines(jobId)));
    } catch (error) {
      throw formatError(error);
    }
  },

  async createLine(jobId: string, dto: CreateCcLineDto): Promise<CcLine> {
    assertJobId(jobId);
    try {
      const line = normalizeCcLine(unwrapEntity(await postRaw(CUSTOMS_CLEARANCE_API.lines(jobId), dto)));
      if (!line) throw new Error('Line created but not returned.');
      return line;
    } catch (error) {
      throw formatError(error);
    }
  },

  async updateLine(jobId: string, lineId: string, dto: UpdateCcLineDto): Promise<CcLine> {
    assertJobId(jobId);
    if (!isUuid(lineId)) throw new Error('Invalid line id.');
    try {
      const line = normalizeCcLine(
        unwrapEntity(await patchRaw(CUSTOMS_CLEARANCE_API.lineById(jobId, lineId), dto)),
      );
      if (!line) throw new Error('Line update returned no data.');
      return line;
    } catch (error) {
      throw formatError(error);
    }
  },

  async deleteLine(jobId: string, lineId: string): Promise<void> {
    assertJobId(jobId);
    if (!isUuid(lineId)) throw new Error('Invalid line id.');
    try {
      await deleteRaw(CUSTOMS_CLEARANCE_API.lineById(jobId, lineId));
    } catch (error) {
      throw formatError(error);
    }
  },

  async classifyLine(
    jobId: string,
    lineId: string,
    dto: ClassifyCcLineDto = {},
  ): Promise<CcLine> {
    assertJobId(jobId);
    if (!isUuid(lineId)) throw new Error('Invalid line id.');
    try {
      const line = normalizeCcLine(
        unwrapEntity(await postRaw(CUSTOMS_CLEARANCE_API.classifyLine(jobId, lineId), dto)),
      );
      if (!line) throw new Error('Classify returned no line.');
      return line;
    } catch (error) {
      throw formatError(error);
    }
  },

  async getChecklist(jobId: string): Promise<CcChecklistItem[]> {
    assertJobId(jobId);
    try {
      return normalizeCcChecklist(await getRaw(CUSTOMS_CLEARANCE_API.checklist(jobId)));
    } catch (error) {
      throw formatError(error);
    }
  },

  async updateChecklistItem(
    jobId: string,
    itemId: string,
    dto: UpdateCcChecklistItemDto,
  ): Promise<CcChecklistItem> {
    assertJobId(jobId);
    if (!isUuid(itemId)) throw new Error('Invalid checklist item id.');
    try {
      const item = normalizeCcChecklistItem(
        unwrapEntity(await patchRaw(CUSTOMS_CLEARANCE_API.checklistItem(jobId, itemId), dto)),
      );
      if (!item) throw new Error('Checklist update returned no item.');
      return item;
    } catch (error) {
      throw formatError(error);
    }
  },

  async seedChecklist(jobId: string, dto: CcStageActionDto = {}): Promise<CcChecklistItem[]> {
    assertJobId(jobId);
    try {
      return normalizeCcChecklist(await postRaw(CUSTOMS_CLEARANCE_API.checklistSeed(jobId), dto));
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageDocsComplete(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(
        await postRaw(CUSTOMS_CLEARANCE_API.stageDocsComplete(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageClassify(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(
        await postRaw(CUSTOMS_CLEARANCE_API.stageClassify(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageFile(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(await postRaw(CUSTOMS_CLEARANCE_API.stageFile(jobId), dto), jobId);
    } catch (error) {
      throw formatError(error);
    }
  },

  async updateFiling(jobId: string, dto: UpdateCcFilingDto): Promise<CcFiling> {
    assertJobId(jobId);
    try {
      return normalizeCcFiling(await patchRaw(CUSTOMS_CLEARANCE_API.filing(jobId), dto), jobId);
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageAssess(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(
        await postRaw(CUSTOMS_CLEARANCE_API.stageAssess(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async listQueries(jobId: string): Promise<CcQuery[]> {
    assertJobId(jobId);
    try {
      return normalizeCcQueries(await getRaw(CUSTOMS_CLEARANCE_API.queries(jobId)));
    } catch (error) {
      throw formatError(error);
    }
  },

  async createQuery(jobId: string, dto: CreateCcQueryDto): Promise<CcQuery> {
    assertJobId(jobId);
    try {
      const q = normalizeCcQuery(
        unwrapEntity(await postRaw(CUSTOMS_CLEARANCE_API.queries(jobId), dto)),
      );
      if (!q) throw new Error('Query created but not returned.');
      return q;
    } catch (error) {
      throw formatError(error);
    }
  },

  async updateQuery(
    jobId: string,
    queryId: string,
    dto: UpdateCcQueryDto,
  ): Promise<CcQuery> {
    assertJobId(jobId);
    if (!isUuid(queryId)) throw new Error('Invalid query id.');
    try {
      const q = normalizeCcQuery(
        unwrapEntity(await patchRaw(CUSTOMS_CLEARANCE_API.queryById(jobId, queryId), dto)),
      );
      if (!q) throw new Error('Query update returned no data.');
      return q;
    } catch (error) {
      throw formatError(error);
    }
  },

  async closeQuery(
    jobId: string,
    queryId: string,
    dto: CcStageActionDto = {},
  ): Promise<CcQuery> {
    assertJobId(jobId);
    if (!isUuid(queryId)) throw new Error('Invalid query id.');
    try {
      const q = normalizeCcQuery(
        unwrapEntity(await postRaw(CUSTOMS_CLEARANCE_API.queryClose(jobId, queryId), dto)),
      );
      if (!q) throw new Error('Close query returned no data.');
      return q;
    } catch (error) {
      throw formatError(error);
    }
  },

  async dutyPaymentRequest(
    jobId: string,
    dto: DutyPaymentRequestDto = {},
  ): Promise<Record<string, unknown>> {
    assertJobId(jobId);
    try {
      const raw = await postRaw(CUSTOMS_CLEARANCE_API.dutyPaymentRequest(jobId), dto);
      return (asRecordSafe(unwrapEntity(raw)) ?? asRecordSafe(raw) ?? {}) as Record<
        string,
        unknown
      >;
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageDutyPaid(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(
        await postRaw(CUSTOMS_CLEARANCE_API.stageDutyPaid(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageClear(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(await postRaw(CUSTOMS_CLEARANCE_API.stageClear(jobId), dto), jobId);
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageRelease(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(
        await postRaw(CUSTOMS_CLEARANCE_API.stageRelease(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageInvoiceReady(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(
        await postRaw(CUSTOMS_CLEARANCE_API.stageInvoiceReady(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async stageClose(jobId: string, dto: CcStageActionDto = {}): Promise<CcStatus> {
    assertJobId(jobId);
    try {
      return normalizeCcStatus(await postRaw(CUSTOMS_CLEARANCE_API.stageClose(jobId), dto), jobId);
    } catch (error) {
      throw formatError(error);
    }
  },

  async financialSummary(jobId: string): Promise<CcFinancialSummary> {
    assertJobId(jobId);
    try {
      return normalizeCcFinancialSummary(
        await getRaw(CUSTOMS_CLEARANCE_API.financialSummary(jobId)),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async getLinkFreight(jobId: string): Promise<CcLinkFreight | null> {
    assertJobId(jobId);
    try {
      return normalizeCcLinkFreight(await getRaw(CUSTOMS_CLEARANCE_API.linkFreight(jobId)), jobId);
    } catch (error) {
      const detail = extractAxiosErrorDetail(error).toLowerCase();
      if (detail.includes('404') || detail.includes('not found')) return null;
      throw formatError(error);
    }
  },

  async linkFreight(jobId: string, dto: LinkFreightDto): Promise<CcLinkFreight> {
    assertJobId(jobId);
    try {
      const linked = normalizeCcLinkFreight(
        await postRaw(CUSTOMS_CLEARANCE_API.linkFreight(jobId), dto),
        jobId,
      );
      if (!linked) throw new Error('Link freight returned no data.');
      return linked;
    } catch (error) {
      throw formatError(error);
    }
  },

  async unlinkFreight(jobId: string): Promise<void> {
    assertJobId(jobId);
    try {
      await deleteRaw(CUSTOMS_CLEARANCE_API.linkFreight(jobId));
    } catch (error) {
      throw formatError(error);
    }
  },

  async getDeclaration(jobId: string): Promise<CcDeclaration> {
    assertJobId(jobId);
    try {
      return normalizeCcDeclaration(
        await getRaw(CUSTOMS_CLEARANCE_API.declaration(jobId)),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async putDeclaration(jobId: string, dto: UpsertCcDeclarationDto): Promise<CcDeclaration> {
    assertJobId(jobId);
    try {
      return normalizeCcDeclaration(
        await putRaw(CUSTOMS_CLEARANCE_API.declaration(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async validateDeclaration(
    jobId: string,
    dto: CcStageActionDto = {},
  ): Promise<CcDeclaration> {
    assertJobId(jobId);
    try {
      return normalizeCcDeclaration(
        await postRaw(CUSTOMS_CLEARANCE_API.declarationValidate(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async submitDeclarationLocal(
    jobId: string,
    dto: CcStageActionDto = {},
  ): Promise<CcDeclaration> {
    assertJobId(jobId);
    try {
      return normalizeCcDeclaration(
        await postRaw(CUSTOMS_CLEARANCE_API.declarationSubmitLocal(jobId), dto),
        jobId,
      );
    } catch (error) {
      throw formatError(error);
    }
  },

  async entryPack(jobId: string, dto: CcStageActionDto = {}): Promise<Record<string, unknown>> {
    assertJobId(jobId);
    try {
      const raw = await postRaw(CUSTOMS_CLEARANCE_API.entryPack(jobId), dto);
      return (asRecordSafe(unwrapEntity(raw)) ?? asRecordSafe(raw) ?? {}) as Record<
        string,
        unknown
      >;
    } catch (error) {
      throw formatError(error);
    }
  },

  async validateHsCode(dto: HsValidateDto): Promise<HsValidateResult> {
    try {
      return normalizeHsValidate(
        await postRaw(CUSTOMS_CLEARANCE_API.hsValidate, { hs_code: dto.hs_code }),
      );
    } catch (error) {
      throw formatError(error);
    }
  },
};

function asRecordSafe(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
