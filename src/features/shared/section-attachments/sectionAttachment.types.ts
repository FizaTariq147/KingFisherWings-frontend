/** Path segment for GET|POST /:entity/:id/:section/attachments */
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
  | 'acknowledgement';

export type SectionAttachmentEntity = 'jobs' | 'shipments' | 'quotations';

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
  'acknowledgement',
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
  acknowledgement: 'Acknowledgement',
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
