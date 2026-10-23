/** Portal / vendor self-serve + staff party verification (OpenAPI). */

export const PORTAL_VERIFICATION_API = {
  root: '/portal/verification',
  submit: '/portal/verification/submit',
  upload: (kind: string) =>
    `/portal/verification/documents/${encodeURIComponent(kind)}`,
  remove: (documentId: string) =>
    `/portal/verification/documents/${encodeURIComponent(documentId)}`,
  download: (documentId: string) =>
    `/portal/verification/documents/${encodeURIComponent(documentId)}/download`,
} as const;

export const VENDOR_VERIFICATION_API = {
  root: '/vendor/verification',
  submit: '/vendor/verification/submit',
  upload: (kind: string) =>
    `/vendor/verification/documents/${encodeURIComponent(kind)}`,
  remove: (documentId: string) =>
    `/vendor/verification/documents/${encodeURIComponent(documentId)}`,
  download: (documentId: string) =>
    `/vendor/verification/documents/${encodeURIComponent(documentId)}/download`,
} as const;

export const STAFF_PARTY_VERIFICATION_API = {
  root: (partyId: string) =>
    `/parties/${encodeURIComponent(partyId)}/verification`,
  approve: (partyId: string) =>
    `/parties/${encodeURIComponent(partyId)}/verification/approve`,
  reject: (partyId: string) =>
    `/parties/${encodeURIComponent(partyId)}/verification/reject`,
  download: (partyId: string, documentId: string) =>
    `/parties/${encodeURIComponent(partyId)}/verification/documents/${encodeURIComponent(documentId)}/download`,
} as const;

export const PORTAL_VERIFICATION_PATH = '/portal/verification';
export const VENDOR_VERIFICATION_PATH = '/vendor/verification';

export const REQUIRED_VERIFICATION_KINDS = [
  'VAT_CERTIFICATE',
  'BUSINESS_LICENSE',
] as const;

export type RequiredVerificationKind = (typeof REQUIRED_VERIFICATION_KINDS)[number];

export const VERIFICATION_DOC_KINDS = [
  'VAT_CERTIFICATE',
  'BUSINESS_LICENSE',
  'OTHER',
] as const;

export type VerificationDocKind = (typeof VERIFICATION_DOC_KINDS)[number];

export const VERIFICATION_DOC_KIND_LABELS: Record<VerificationDocKind, string> = {
  VAT_CERTIFICATE: 'VAT certificate',
  BUSINESS_LICENSE: 'Business license',
  OTHER: 'Other document',
};
