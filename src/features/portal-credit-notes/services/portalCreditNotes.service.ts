import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_CREDIT_NOTES_API } from '../api/portalCreditNotes.api';
import type { PortalCreditNoteDetail, PortalCreditNoteListParams, PortalCreditNoteListResult } from '../types/portalCreditNotes.types';
import { normalizeCreditNoteDetail, normalizeCreditNoteList } from '../utils/normalizePortalCreditNotes';

export const portalCreditNotesService = {
  async list(params: PortalCreditNoteListParams = {}): Promise<PortalCreditNoteListResult> {
    const res = await portalApiClient.get(PORTAL_CREDIT_NOTES_API.list, { params });
    return normalizeCreditNoteList(res.data, params);
  },
  async getById(id: string): Promise<PortalCreditNoteDetail> {
    const res = await portalApiClient.get(PORTAL_CREDIT_NOTES_API.detail(id));
    const detail = normalizeCreditNoteDetail(res.data);
    if (!detail) throw new Error('Credit note not found.');
    return detail;
  },
};

