export interface PortalCcJobListItem {
  id: string;
  job_number?: string;
  status?: string;
  stage?: string;
  customer_name?: string;
  updated_at?: string;
}

export interface PortalCcJobDetail extends PortalCcJobListItem {
  notes?: string;
  raw?: Record<string, unknown>;
}

export interface PortalCcChecklistItem {
  id: string;
  label?: string;
  code?: string;
  required?: boolean;
  completed?: boolean;
  received?: boolean;
  verified?: boolean;
  status?: string;
}

export interface PortalCcDocument {
  id: string;
  doc_code?: string;
  job_document_id?: string;
  file_name?: string;
  document_type?: string;
  status?: string;
}

/** POST /portal/cc-jobs/:id/documents — PortalCcDocumentDto */
export type PortalCcDocumentDto = {
  doc_code: string;
  job_document_id?: string;
};
