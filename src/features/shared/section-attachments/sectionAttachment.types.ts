/**
 * Path segment for GET|POST /:entity/:id/:section/attachments.
 * Must match BE allowlist (Unknown section otherwise).
 * Delivery acknowledgement files use `pods` (ack extends ProofOfDelivery).
 */
export type OpsSectionKey =
  | 'customs_status'
  | 'cfs_storage'
  | 'transhipment_link'
  | 'deposits'
  | 'free_days'
  | 'damage_reports'
  | 'part_deliveries'
  | 'pods'
  | 'payment_requests'
  | 'sub_jobs'
  | 'bills_of_lading'
  | 'stuffing_records'
  /** Air waybill panel only — not in Section files hub allowlist. */
  | 'air_waybills';

export type SectionAttachmentEntity = 'jobs' | 'shipments' | 'quotations';

/** Sections offered in Entity Section files — matches BE allowlist. */
export const OPS_SECTION_KEYS: OpsSectionKey[] = [
  'customs_status',
  'cfs_storage',
  'transhipment_link',
  'deposits',
  'free_days',
  'damage_reports',
  'part_deliveries',
  'pods',
  'payment_requests',
  'sub_jobs',
  'bills_of_lading',
  'stuffing_records',
];

export const OPS_SECTION_LABELS: Record<OpsSectionKey, string> = {
  customs_status: 'Customs status',
  cfs_storage: 'CFS storage',
  transhipment_link: 'Transhipment link',
  deposits: 'Deposits',
  free_days: 'Free days',
  damage_reports: 'Damage reports',
  part_deliveries: 'Part deliveries',
  pods: 'Proof of delivery',
  payment_requests: 'Payment requests',
  sub_jobs: 'Sub-jobs',
  bills_of_lading: 'Bills of lading',
  stuffing_records: 'Stuffing records',
  air_waybills: 'Airway bills',
};

export interface SectionAttachment {
  id: string;
  file_name?: string;
  mime_type?: string;
  size_bytes?: number;
  record_id?: string;
  visible_to_customer?: boolean;
  visible_to_vendor?: boolean;
  downloadable_by_customer?: boolean;
  downloadable_by_vendor?: boolean;
  created_at?: string;
  raw?: Record<string, unknown>;
}

export interface SectionAttachmentsListResult {
  items: SectionAttachment[];
  can_upload: boolean;
}

export interface UploadSectionAttachmentFields {
  record_id?: string;
  visible_to_customer?: boolean;
  visible_to_vendor?: boolean;
  downloadable_by_customer?: boolean;
  downloadable_by_vendor?: boolean;
}
