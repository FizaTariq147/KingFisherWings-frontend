import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_DOCUMENTS_API } from '@/features/portal-documents/api/portalDocuments.api';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { safeDownloadFilename } from '@/features/portal-shared/normalize';
import { PORTAL_CREDIT_NOTES_API, PORTAL_DEBIT_NOTES_API } from '../api/portalCreditNotes.api';
import type {
  PortalCreditNoteDetail,
  PortalCreditNoteListParams,
  PortalCreditNoteListResult,
} from '../types/portalCreditNotes.types';
import {
  normalizeCreditNoteDetail,
  normalizeCreditNoteList,
} from '../utils/normalizePortalCreditNotes';

export type PortalNoteKind = 'credit' | 'debit';

function apiFor(kind: PortalNoteKind) {
  return kind === 'debit' ? PORTAL_DEBIT_NOTES_API : PORTAL_CREDIT_NOTES_API;
}

export const portalCreditNotesService = {
  async list(
    params: PortalCreditNoteListParams = {},
    kind: PortalNoteKind = 'credit',
  ): Promise<PortalCreditNoteListResult> {
    const res = await portalApiClient.get(apiFor(kind).list, { params });
    return normalizeCreditNoteList(res.data, params, kind);
  },
  async getById(id: string, kind: PortalNoteKind = 'credit'): Promise<PortalCreditNoteDetail> {
    const res = await portalApiClient.get(apiFor(kind).detail(id));
    const detail = normalizeCreditNoteDetail(res.data, kind);
    if (!detail) throw new Error(kind === 'debit' ? 'Debit note not found.' : 'Credit note not found.');
    return detail;
  },
  async downloadPdf(
    id: string,
    kind: PortalNoteKind = 'credit',
    fallbackName?: string,
  ): Promise<void> {
    const fallback = kind === 'debit' ? 'debit-note.pdf' : 'credit-note.pdf';
    await downloadPortalBlob(
      PORTAL_DOCUMENTS_API.downloadInvoice(id),
      safeDownloadFilename(fallbackName || fallback, fallback),
      { accept: 'application/pdf, application/octet-stream, */*' },
    );
  },
};
