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
  status?: string;
}

export interface PortalCcDocument {
  id: string;
  file_name?: string;
  document_type?: string;
  status?: string;
}
