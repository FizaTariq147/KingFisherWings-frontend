/** Staff ops continuum entity types (OpenAPI). */
export type OpsEntityType = 'ENQUIRY' | 'QUOTATION' | 'SHIPMENT' | 'JOB';

export type OpsContinuumTab =
  | 'comments'
  | 'follow-ups'
  | 'attachments'
  | 'references'
  | 'tags'
  | 'links'
  | 'likes'
  | 'complaints'
  | 'history';

/** POST /ops/:type/:id/comments — CreateOpsCommentDto */
export interface OpsCommentDto {
  body: string;
}

/** POST /ops/:type/:id/follow-ups — CreateOpsFollowUpDto */
export interface OpsFollowUpDto {
  due_date: string;
  subject: string;
  notes?: string;
  owner_id?: string;
}

/** POST /ops/:type/:id/references — CreateOpsReferenceDto */
export interface OpsReferenceDto {
  ref_type: string;
  ref_value: string;
  notes?: string;
}

/** POST /ops/:type/:id/tags — CreateOpsTagDto */
export interface OpsTagDto {
  tag: string;
}

/** POST /ops/:type/:id/links — CreateOpsLinkDto */
export interface OpsLinkDto {
  title: string;
  url: string;
}

/** POST /ops/:type/:id/complaints — CreateOpsComplaintDto */
export interface OpsComplaintDto {
  subject: string;
  body: string;
}

/** PATCH /ops/:type/:id/complaints/:id — PatchOpsComplaintDto */
export type OpsComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

/** POST /ops/:type/:id/attachments — CreateOpsAttachmentMetaDto */
export interface OpsAttachmentRegisterDto {
  file_name: string;
  storage_key?: string;
  file_url?: string;
  mime_type?: string;
  size_bytes?: number;
  notes?: string;
  visible_to_customer?: boolean;
  visible_to_vendor?: boolean;
}
