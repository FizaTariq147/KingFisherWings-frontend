import { axiosInstance } from '@/lib/axios';
import { portalApiClient } from '@/lib/portalApiClient';
import { vendorApiClient } from '@/lib/vendorApiClient';
import { withGatewayRetry } from '@/lib/wakeApi';
import {
  PORTAL_VERIFICATION_API,
  STAFF_PARTY_VERIFICATION_API,
  VENDOR_VERIFICATION_API,
  type VerificationDocKind,
} from '../api/partyVerification.api';
import type { PartyVerificationState } from '../types/partyVerification.types';
import { normalizePartyVerification } from '../utils/normalizePartyVerification';

async function uploadMultipart(
  client: { post: typeof portalApiClient.post },
  url: string,
  file: File,
): Promise<unknown> {
  const form = new FormData();
  form.append('file', file, file.name);
  const res = await client.post(url, form, {
    transformRequest: [
      (data, headers) => {
        if (headers && typeof headers === 'object' && data instanceof FormData) {
          const h = headers as Record<string, unknown> & {
            delete?: (k: string) => void;
          };
          delete h['Content-Type'];
          delete h['content-type'];
          h.delete?.('Content-Type');
          h.delete?.('content-type');
        }
        return data;
      },
    ],
  });
  return res.data;
}

async function downloadBlob(
  client: { get: typeof portalApiClient.get },
  url: string,
  fileName: string,
): Promise<void> {
  const res = await client.get(url, { responseType: 'blob' });
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart]);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName || 'verification-document';
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export const portalVerificationService = {
  async get(): Promise<PartyVerificationState> {
    const res = await portalApiClient.get(PORTAL_VERIFICATION_API.root);
    return normalizePartyVerification(res.data);
  },
  async upload(kind: VerificationDocKind | string, file: File): Promise<PartyVerificationState> {
    await uploadMultipart(portalApiClient, PORTAL_VERIFICATION_API.upload(kind), file);
    return this.get();
  },
  async remove(documentId: string): Promise<PartyVerificationState> {
    await portalApiClient.delete(PORTAL_VERIFICATION_API.remove(documentId));
    return this.get();
  },
  async submit(): Promise<PartyVerificationState> {
    await portalApiClient.post(PORTAL_VERIFICATION_API.submit);
    return this.get();
  },
  async download(documentId: string, fileName = 'verification-document'): Promise<void> {
    await downloadBlob(
      portalApiClient,
      PORTAL_VERIFICATION_API.download(documentId),
      fileName,
    );
  },
};

export const vendorVerificationService = {
  async get(): Promise<PartyVerificationState> {
    const res = await vendorApiClient.get(VENDOR_VERIFICATION_API.root);
    return normalizePartyVerification(res.data);
  },
  async upload(kind: VerificationDocKind | string, file: File): Promise<PartyVerificationState> {
    await uploadMultipart(vendorApiClient, VENDOR_VERIFICATION_API.upload(kind), file);
    return this.get();
  },
  async remove(documentId: string): Promise<PartyVerificationState> {
    await vendorApiClient.delete(VENDOR_VERIFICATION_API.remove(documentId));
    return this.get();
  },
  async submit(): Promise<PartyVerificationState> {
    await vendorApiClient.post(VENDOR_VERIFICATION_API.submit);
    return this.get();
  },
  async download(documentId: string, fileName = 'verification-document'): Promise<void> {
    await downloadBlob(
      vendorApiClient,
      VENDOR_VERIFICATION_API.download(documentId),
      fileName,
    );
  },
};

export const staffPartyVerificationService = {
  async get(partyId: string): Promise<PartyVerificationState> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(STAFF_PARTY_VERIFICATION_API.root(partyId)),
    );
    return normalizePartyVerification(res.data);
  },
  async approve(partyId: string, notes?: string): Promise<PartyVerificationState> {
    await withGatewayRetry(() =>
      axiosInstance.post(STAFF_PARTY_VERIFICATION_API.approve(partyId), {
        ...(notes?.trim() ? { notes: notes.trim() } : {}),
      }),
    );
    return this.get(partyId);
  },
  async reject(partyId: string, reason: string): Promise<PartyVerificationState> {
    await withGatewayRetry(() =>
      axiosInstance.post(STAFF_PARTY_VERIFICATION_API.reject(partyId), {
        reason: reason.trim(),
      }),
    );
    return this.get(partyId);
  },
  async download(partyId: string, documentId: string, fileName = 'verification-doc'): Promise<void> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(STAFF_PARTY_VERIFICATION_API.download(partyId, documentId), {
        responseType: 'blob',
      }),
    );
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },
};
