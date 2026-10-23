import { asRecord, pickBoolean, pickString, unwrapData } from '@/features/portal-shared/normalize';
import {
  REQUIRED_VERIFICATION_KINDS,
  type VerificationDocKind,
} from '../api/partyVerification.api';
import type {
  PartyVerificationChecklistItem,
  PartyVerificationDocument,
  PartyVerificationState,
  PartyVerificationStatus,
} from '../types/partyVerification.types';

function normalizeStatus(raw: unknown): PartyVerificationStatus {
  const s = pickString(raw).toUpperCase().replace(/[\s-]+/g, '_');
  if (!s) return 'NOT_STARTED';
  return s;
}

function normalizeDoc(raw: unknown): PartyVerificationDocument | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id, r.document_id, r.documentId);
  if (!id) return null;
  const kind = pickString(r.doc_kind, r.docKind, r.kind, r.document_kind).toUpperCase();
  return {
    id,
    kind: kind || 'OTHER',
    fileName: pickString(r.file_name, r.fileName, r.name, r.original_name) || undefined,
    mimeType: pickString(r.mime_type, r.mimeType, r.content_type) || undefined,
    uploadedAt: pickString(r.created_at, r.createdAt, r.uploaded_at, r.uploadedAt) || undefined,
    raw: r,
  };
}

function buildChecklist(
  documents: PartyVerificationDocument[],
  requiredKinds: string[],
  checklistRaw: unknown,
): PartyVerificationChecklistItem[] {
  if (Array.isArray(checklistRaw) && checklistRaw.length) {
    return checklistRaw
      .map((row) => {
        const r = asRecord(row);
        if (!r) return null;
        const kind = pickString(r.kind, r.doc_kind, r.docKind).toUpperCase();
        if (!kind) return null;
        return {
          kind,
          required: pickBoolean(r.required, r.is_required) ?? REQUIRED_VERIFICATION_KINDS.includes(kind as VerificationDocKind),
          uploaded:
            pickBoolean(r.uploaded, r.is_uploaded, r.present) ??
            documents.some((d) => String(d.kind).toUpperCase() === kind),
          documentId: pickString(r.document_id, r.documentId, r.id) || undefined,
        };
      })
      .filter((x): x is PartyVerificationChecklistItem => Boolean(x));
  }

  const kinds = requiredKinds.length
    ? requiredKinds
    : [...REQUIRED_VERIFICATION_KINDS, 'OTHER'];
  const unique = [...new Set(kinds.map((k) => k.toUpperCase()))];
  return unique.map((kind) => {
    const doc = documents.find((d) => String(d.kind).toUpperCase() === kind);
    return {
      kind,
      required: REQUIRED_VERIFICATION_KINDS.includes(kind as VerificationDocKind),
      uploaded: Boolean(doc),
      documentId: doc?.id,
    };
  });
}

export function normalizePartyVerification(raw: unknown): PartyVerificationState {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const status = normalizeStatus(
    data.status ?? data.verification_status ?? data.verificationStatus,
  );

  const docsRaw =
    data.documents ?? data.docs ?? data.uploaded_documents ?? data.uploadedDocuments;
  const documents = Array.isArray(docsRaw)
    ? docsRaw.map(normalizeDoc).filter((d): d is PartyVerificationDocument => Boolean(d))
    : [];

  const requiredRaw =
    data.required_kinds ?? data.requiredKinds ?? data.required_document_kinds;
  const requiredKinds = Array.isArray(requiredRaw)
    ? requiredRaw.map((k) => String(k).toUpperCase()).filter(Boolean)
    : [...REQUIRED_VERIFICATION_KINDS];

  const canUseExplicit = pickBoolean(
    data.can_use_portal,
    data.canUsePortal,
    data.can_use_vendor,
    data.canUseVendor,
    data.can_use,
    data.canUse,
  );
  const canUse = canUseExplicit ?? status === 'APPROVED';

  const blockingExplicit = pickBoolean(
    data.verification_blocking,
    data.verificationBlocking,
    data.is_blocking,
    data.blocking,
  );
  const verificationBlocking =
    blockingExplicit ?? (status !== 'APPROVED');

  return {
    status,
    canUse,
    verificationBlocking,
    rejectionReason:
      pickString(
        data.rejection_reason,
        data.rejectionReason,
        data.reject_reason,
        data.reason,
      ) || undefined,
    reviewedAt: pickString(data.reviewed_at, data.reviewedAt) || undefined,
    documents,
    checklist: buildChecklist(
      documents,
      requiredKinds,
      data.checklist ?? data.required_checklist,
    ),
    requiredKinds,
    raw: data,
  };
}

/** Strip fetch/axios status suffixes so gate matching stays stable. */
function normalizeGateMessageText(message: string): string {
  return message
    .replace(/\s*\(HTTP\s*\d+\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Detect BE gate messages so UI can show a verification modal instead of a raw error. */
export function isVerificationGateMessage(message: string): boolean {
  const m = normalizeGateMessageText(message).toLowerCase();
  if (!m) return false;
  return (
    /verification_required|verification_pending|verification_pending_approval/i.test(m) ||
    /upload required business documents/i.test(m) ||
    (/vat|business\s*license/i.test(m) &&
      /license|certificate/i.test(m) &&
      /portal|vendor|before using|verif/i.test(m)) ||
    /party verification.*(required|pending|approve)/i.test(m)
  );
}

/** Pull a verification gate message from an unknown thrown/query error. */
export function getVerificationGateMessage(error: unknown): string | null {
  if (error == null) return null;
  if (typeof error === 'string' && isVerificationGateMessage(error)) {
    return normalizeGateMessageText(error);
  }
  if (error instanceof Error && isVerificationGateMessage(error.message)) {
    return normalizeGateMessageText(error.message);
  }
  if (typeof error === 'object') {
    const rec = error as { message?: unknown; response?: { data?: unknown } };
    if (typeof rec.message === 'string' && isVerificationGateMessage(rec.message)) {
      return normalizeGateMessageText(rec.message);
    }
    const data = rec.response?.data;
    if (data && typeof data === 'object') {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === 'string' && isVerificationGateMessage(msg)) {
        return normalizeGateMessageText(msg);
      }
      if (Array.isArray(msg)) {
        const joined = msg.map(String).join('; ');
        if (isVerificationGateMessage(joined)) return normalizeGateMessageText(joined);
      }
    }
  }
  return null;
}
