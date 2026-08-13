import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CRM_API } from '../api/crm.api';
import type { Budget, CreateBudgetDto, DashboardParams, ReportParams } from '../types/crm.types';
import { normalizeBudget, normalizeDashboard, normalizeMany } from '../utils/normalizeCrm';
import { formatAxiosError, queryParams, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

export const crmDashboardService = {
  async overview(params: DashboardParams = {}) {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.dashboard, { params: queryParams(params) })); return normalizeDashboard(unwrapEntity(res.data)); }
    catch (error) { throw formatAxiosError(error); }
  },
  async budgets(salesperson_id?: string): Promise<Budget[]> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.budgets, { params: queryParams({ salesperson_id }) })); return normalizeMany(unwrapList(res.data, ['budgets']).items, normalizeBudget); }
    catch (error) { throw formatAxiosError(error); }
  },
  async createBudget(dto: CreateBudgetDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.budgets, prepareCrmPayload(dto))); const item = normalizeBudget(unwrapEntity(res.data)); if (!item) throw new Error('Budget was created but not returned.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async report({ type, ...params }: ReportParams): Promise<unknown> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.report(type), { params: queryParams(params) })); return unwrapEntity(res.data); }
    catch (error) { throw formatAxiosError(error); }
  },
};
