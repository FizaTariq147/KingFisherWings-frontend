import type { VerificationDocKind } from '../api/partyVerification.api';

export type PartyVerificationStatus =
  | 'NOT_STARTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | string;

export interface PartyVerificationDocument {
  id: string;
  kind: VerificationDocKind | string;
  fileName?: string;
  mimeType?: string;
  uploadedAt?: string;
  raw?: Record<string, unknown>;
}

export interface PartyVerificationChecklistItem {
  kind: VerificationDocKind | string;
  required: boolean;
  uploaded: boolean;
  documentId?: string;
}

export interface PartyVerificationState {
  status: PartyVerificationStatus;
  /** Portal: can_use_portal; Vendor: can_use_vendor — true only when APPROVED. */
  canUse: boolean;
  verificationBlocking: boolean;
  rejectionReason?: string;
  reviewedAt?: string;
  documents: PartyVerificationDocument[];
  checklist: PartyVerificationChecklistItem[];
  requiredKinds: string[];
  raw?: Record<string, unknown>;
}
