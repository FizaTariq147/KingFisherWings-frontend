import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CRM_API } from '../api/crm.api';
import type { Campaign, CampaignTemplate, CreateCampaignDto, CreateCampaignTemplateDto, CreateSubscriberDto, Subscriber } from '../types/crm.types';
import { normalizeCampaign, normalizeMany, normalizeSubscriber, normalizeTemplate } from '../utils/normalizeCrm';
import { formatAxiosError, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

export const crmEmailService = {
  async subscribers(): Promise<Subscriber[]> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.subscribers)); return normalizeMany(unwrapList(res.data, ['subscribers']).items, normalizeSubscriber); }
    catch (error) { throw formatAxiosError(error); }
  },
  async createSubscriber(dto: CreateSubscriberDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.subscribers, prepareCrmPayload(dto))); const item = normalizeSubscriber(unwrapEntity(res.data)); if (!item) throw new Error('Subscriber was created but not returned.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async importSubscribers(file: File) { try { const form = new FormData(); form.append('file', file); const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.subscriberImport, form)); return unwrapEntity(res.data); } catch (error) { throw formatAxiosError(error); } },
  async unsubscribe(id: string) { try { await withGatewayRetry(() => axiosInstance.post(CRM_API.unsubscribe(id))); } catch (error) { throw formatAxiosError(error); } },
  async templates(): Promise<CampaignTemplate[]> { try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.templates)); return normalizeMany(unwrapList(res.data, ['templates']).items, normalizeTemplate); } catch (error) { throw formatAxiosError(error); } },
  async createTemplate(dto: CreateCampaignTemplateDto) { try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.templates, prepareCrmPayload(dto))); const item = normalizeTemplate(unwrapEntity(res.data)); if (!item) throw new Error('Template was created but not returned.'); return item; } catch (error) { throw formatAxiosError(error); } },
  async campaigns(): Promise<Campaign[]> { try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.campaigns)); return normalizeMany(unwrapList(res.data, ['campaigns']).items, normalizeCampaign); } catch (error) { throw formatAxiosError(error); } },
  async createCampaign(dto: CreateCampaignDto) { try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.campaigns, prepareCrmPayload(dto))); const item = normalizeCampaign(unwrapEntity(res.data)); if (!item) throw new Error('Campaign was created but not returned.'); return item; } catch (error) { throw formatAxiosError(error); } },
  async schedule(id: string) { try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.campaignSchedule(id))); return unwrapEntity(res.data); } catch (error) { throw formatAxiosError(error); } },
  async send(id: string) { try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.campaignSend(id))); return unwrapEntity(res.data); } catch (error) { throw formatAxiosError(error); } },
};
