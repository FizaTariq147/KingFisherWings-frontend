import { vendorApiClient } from '@/lib/vendorApiClient';
import { VENDOR_CREDIT_NOTES_API } from '../api/vendorCreditNotes.api';
import type {
  VendorCreditNoteListParams,
  VendorCreditNoteListResult,
} from '../types/vendorCreditNotes.types';
import { normalizeCreditNoteList } from '../utils/normalizeVendorCreditNotes';

export const vendorCreditNotesService = {
  async list(params: VendorCreditNoteListParams = {}): Promise<VendorCreditNoteListResult> {
    const res = await vendorApiClient.get(VENDOR_CREDIT_NOTES_API.list, { params });
    return normalizeCreditNoteList(res.data, params);
  },
};
